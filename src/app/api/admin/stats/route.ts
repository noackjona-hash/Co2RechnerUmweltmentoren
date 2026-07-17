import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // 1. Basic Counts
    const totalStudents = await prisma.student.count();
    const totalCompleted = await prisma.student.count({
      where: { isCompleted: true },
    });
    const totalSchools = await prisma.license.count();
    const totalClasses = await prisma.class.count();

    // 2. Total and average CO2
    const co2SumResult = await prisma.quizResponse.aggregate({
      _sum: { calculatedCo2: true },
      where: {
        student: { isCompleted: true },
      },
    });
    const totalCo2 = co2SumResult._sum.calculatedCo2 || 0;
    const avgCo2PerStudent = totalCompleted > 0 ? totalCo2 / totalCompleted : 0;

    // 3. Category aggregates
    const categoryAggregates = await prisma.quizResponse.groupBy({
      by: ['category'],
      _sum: { calculatedCo2: true },
      where: {
        student: { isCompleted: true },
      },
    });

    const categoryStats = categoryAggregates.map((agg) => {
      const sum = agg._sum.calculatedCo2 || 0;
      return {
        category: agg.category,
        totalCo2: Math.round(sum),
        avgCo2: totalCompleted > 0 ? parseFloat((sum / totalCompleted).toFixed(2)) : 0,
      };
    });

    // Ensure all standard categories exist (mobility, food, heating, electricity, consumption)
    const standardCategories = ['mobility', 'food', 'heating', 'electricity', 'consumption'];
    const formattedCategoryStats = standardCategories.map((cat) => {
      const existing = categoryStats.find((s) => s.category.toLowerCase() === cat.toLowerCase());
      if (existing) return existing;
      return { category: cat, totalCo2: 0, avgCo2: 0 };
    });

    // 4. Completions over time (last 30 days)
    const completions = await prisma.student.findMany({
      where: {
        isCompleted: true,
        completedAt: { not: null },
      },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    });

    const historyMap: Record<string, number> = {};
    // Seed last 7 days with zeros by default so chart has data structure
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      historyMap[dateStr] = 0;
    }

    completions.forEach((c) => {
      if (c.completedAt) {
        const dateStr = c.completedAt.toISOString().split('T')[0];
        if (historyMap[dateStr] !== undefined) {
          historyMap[dateStr]++;
        } else {
          // If it is older than 7 days but still in the list, we can track it if we want
          // Let's only track the ones in our range or keep them
          historyMap[dateStr] = (historyMap[dateStr] || 0) + 1;
        }
      }
    });

    const completionHistory = Object.entries(historyMap)
      .map(([date, count]) => ({
        date: date.split('-').slice(1).reverse().join('.'), // convert YYYY-MM-DD to DD.MM
        completions: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

    // 5. Travel to school transport distribution
    // Let's find the transport question
    const transportQuestion = await prisma.quizQuestion.findFirst({
      where: {
        questionText: { contains: 'Wie kommst du normalerweise zur Schule?' },
      },
    });

    let transportDistribution: { label: string; count: number }[] = [];
    if (transportQuestion) {
      const responses = await prisma.quizResponse.findMany({
        where: {
          questionId: transportQuestion.id,
          student: { isCompleted: true },
        },
        select: { numericalValue: true },
      });

      // Parse options to get labels mapping
      let optionsList: { label: string; value: number }[] = [];
      try {
        optionsList = typeof transportQuestion.options === 'string'
          ? JSON.parse(transportQuestion.options)
          : (transportQuestion.options as any) || [];
      } catch (e) {
        console.error('Failed to parse options', e);
      }

      const counts: Record<number, number> = {};
      responses.forEach((r) => {
        counts[r.numericalValue] = (counts[r.numericalValue] || 0) + 1;
      });

      transportDistribution = optionsList.map((opt) => ({
        label: opt.label,
        count: counts[opt.value] || 0,
      }));
    }

    return NextResponse.json({
      summary: {
        totalStudents,
        totalCompleted,
        completionRate: totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0,
        totalSchools,
        totalClasses,
        totalCo2: Math.round(totalCo2),
        avgCo2PerStudent: parseFloat(avgCo2PerStudent.toFixed(1)),
      },
      categoryStats: formattedCategoryStats,
      completionHistory,
      transportDistribution,
    });
  } catch (error) {
    console.error('Stats generation error:', error);
    return NextResponse.json({ error: 'Fehler beim Generieren der Statistiken.' }, { status: 500 });
  }
}
