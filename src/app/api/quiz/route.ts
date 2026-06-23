import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET quiz questions
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const questions = await prisma.quizQuestion.findMany({
    orderBy: { orderIndex: 'asc' },
  });

  // Also get any existing responses for this student
  const responses = await prisma.quizResponse.findMany({
    where: { studentId: session.id },
  });

  return NextResponse.json({ questions, responses });
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

    // Delete existing responses for this student
    await prisma.quizResponse.deleteMany({
      where: { studentId: session.id },
    });

    // Create all responses
    for (const response of responses) {
      await prisma.quizResponse.create({
        data: {
          studentId: session.id,
          questionId: response.questionId,
          category: response.category,
          numericalValue: response.numericalValue,
          calculatedCo2: response.calculatedCo2,
        },
      });
    }

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
