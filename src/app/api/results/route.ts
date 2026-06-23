import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET student results
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const responses = await prisma.quizResponse.findMany({
      where: { studentId: session.id },
      include: { question: true },
    });

    // Calculate totals per category
    const categoryTotals: Record<string, number> = {};
    responses.forEach((r) => {
      categoryTotals[r.category] =
        (categoryTotals[r.category] || 0) + r.calculatedCo2;
    });

    const totalCo2 = Object.values(categoryTotals).reduce(
      (sum, v) => sum + v,
      0
    );

    return NextResponse.json({
      totalCo2,
      categoryTotals,
      responses,
    });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Ergebnisse.' },
      { status: 500 }
    );
  }
}
