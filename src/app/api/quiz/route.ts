import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET quiz questions
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get('mode');

  // Fetch student's class mode
  const studentClass = session.classId
    ? await prisma.class.findUnique({
        where: { id: session.classId },
        select: { quizMode: true },
      })
    : null;

  const isGuest = session.accessKey?.startsWith('GAST-') || false;
  let quizMode = studentClass?.quizMode || (isGuest ? 10 : 60);

  // Allow guests to switch mode via ?mode=10|30|60
  if (isGuest && modeParam && [10, 30, 60].includes(Number(modeParam))) {
    quizMode = Number(modeParam);
  }

  const maxTier = quizMode === 10 ? 1 : quizMode === 30 ? 2 : 3;

  const questions = await prisma.quizQuestion.findMany({
    where: {
      tier: { lte: maxTier },
    },
    orderBy: { orderIndex: 'asc' },
  });

  const responses = await prisma.quizResponse.findMany({
    where: { studentId: session.id },
  });

  const student = await prisma.student.findUnique({
    where: { id: session.id },
    select: { isCompleted: true },
  });

  return NextResponse.json({
    questions,
    responses,
    studentId: session.id,
    accessKey: session.accessKey,
    isGuest,
    isCompleted: student?.isCompleted || false,
    quizMode,
  });
}

// POST quiz responses (single auto-save OR complete submission)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // 1. Single answer auto-save
    if (body.questionId && body.category && body.numericalValue !== undefined) {
      await prisma.quizResponse.upsert({
        where: {
          studentId_questionId: {
            studentId: session.id,
            questionId: body.questionId,
          },
        },
        create: {
          studentId: session.id,
          questionId: body.questionId,
          category: body.category,
          numericalValue: Number(body.numericalValue),
          calculatedCo2: Number(body.calculatedCo2) || 0,
        },
        update: {
          numericalValue: Number(body.numericalValue),
          calculatedCo2: Number(body.calculatedCo2) || 0,
        },
      });
      return NextResponse.json({ success: true, mode: 'autosave' });
    }

    // 2. Full submission / Complete quiz
    const incomingResponses: any[] = Array.isArray(body.responses) ? body.responses : [];

    // Fetch all questions to ensure all categories and metrics have defaults
    const allQuestions = await prisma.quizQuestion.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    // Map incoming responses
    const responseMap = new Map<string, { numericalValue: number; calculatedCo2: number }>();
    for (const r of incomingResponses) {
      if (r && r.questionId) {
        responseMap.set(r.questionId, {
          numericalValue: Number(r.numericalValue) || 0,
          calculatedCo2: Number(r.calculatedCo2) || 0,
        });
      }
    }

    // Check existing database responses if any were missing from incoming array
    if (responseMap.size < allQuestions.length) {
      const existingDbResponses = await prisma.quizResponse.findMany({
        where: { studentId: session.id },
      });
      for (const er of existingDbResponses) {
        if (!responseMap.has(er.questionId)) {
          responseMap.set(er.questionId, {
            numericalValue: er.numericalValue,
            calculatedCo2: er.calculatedCo2,
          });
        }
      }
    }

    // Delete existing responses to prevent any duplicates
    await prisma.quizResponse.deleteMany({
      where: { studentId: session.id },
    });

    // Create responses for all questions (using answered values or intelligent defaults)
    const prismaResponsesData = allQuestions.map((q) => {
      const studentAnswer = responseMap.get(q.id);
      let numericalValue = 0;
      let calculatedCo2 = 0;

      if (studentAnswer) {
        numericalValue = studentAnswer.numericalValue;
        calculatedCo2 = studentAnswer.calculatedCo2;
      } else {
        const opts = q.options as { label: string; value: number }[] | null;
        numericalValue =
          q.defaultValue ??
          (opts && Array.isArray(opts) && opts.length > 0 ? opts[0].value : (q.minValue ?? 0));
        calculatedCo2 = numericalValue * q.co2Factor;
      }

      return {
        studentId: session.id,
        questionId: q.id,
        category: q.category,
        numericalValue,
        calculatedCo2,
      };
    });

    // Batch insert all responses
    await prisma.quizResponse.createMany({
      data: prismaResponsesData,
    });

    // Mark student as completed in DB
    await prisma.student.update({
      where: { id: session.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, isCompleted: true });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Antworten.' },
      { status: 500 }
    );
  }
}
