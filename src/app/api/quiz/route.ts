import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET quiz questions
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Fetch student's class mode
  const studentClass = await prisma.class.findUnique({
    where: { id: session.classId! },
    select: { quizMode: true },
  });

  const quizMode = studentClass?.quizMode || 60;
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
    isCompleted: student?.isCompleted || false,
  });
}

// POST quiz responses (submit all)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { responses } = await request.json();

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Antworten sind erforderlich.' },
        { status: 400 }
      );
    }

    // Fetch all questions from the database to map defaults for unasked ones
    const allQuestions = await prisma.quizQuestion.findMany();

    // Create a map of incoming responses by questionId
    const responseMap = new Map<string, { numericalValue: number; calculatedCo2: number }>();
    for (const r of responses) {
      responseMap.set(r.questionId, {
        numericalValue: r.numericalValue,
        calculatedCo2: r.calculatedCo2,
      });
    }

    // Delete existing responses for this student
    await prisma.quizResponse.deleteMany({
      where: { studentId: session.id },
    });

    // Create responses for all 60 questions (using student's answers or defaults)
    const prismaResponsesData = allQuestions.map((q) => {
      const studentAnswer = responseMap.get(q.id);
      let numericalValue = 0;
      let calculatedCo2 = 0;

      if (studentAnswer) {
        numericalValue = studentAnswer.numericalValue;
        calculatedCo2 = studentAnswer.calculatedCo2;
      } else {
        // Fallback to default values
        numericalValue = q.defaultValue || 0;
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

    // Batch insert the responses
    await prisma.quizResponse.createMany({
      data: prismaResponsesData,
    });

    // Mark student as completed
    await prisma.student.update({
      where: { id: session.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Antworten.' },
      { status: 500 }
    );
  }
}
