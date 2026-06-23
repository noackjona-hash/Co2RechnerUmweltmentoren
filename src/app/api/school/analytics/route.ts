import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET aggregated analytics for the school
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'school-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Get all classes for this school
    const classes = await prisma.class.findMany({
      where: { licenseId: session.licenseId },
      include: {
        students: {
          where: { isCompleted: true },
          include: {
            responses: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    // Calculate aggregated stats
    const classStats = classes.map((cls) => {
      const completedStudents = cls.students;
      const totalStudents = cls._count.students;
      const completionRate =
        totalStudents > 0
          ? Math.round((completedStudents.length / totalStudents) * 100)
          : 0;

      // Category totals
      const categoryTotals: Record<string, number[]> = {};
      completedStudents.forEach((student) => {
        const studentCategoryTotals: Record<string, number> = {};
        student.responses.forEach((r) => {
          studentCategoryTotals[r.category] =
            (studentCategoryTotals[r.category] || 0) + r.calculatedCo2;
        });
        Object.entries(studentCategoryTotals).forEach(([cat, total]) => {
          if (!categoryTotals[cat]) categoryTotals[cat] = [];
          categoryTotals[cat].push(total);
        });
      });

      const categoryAverages: Record<string, number> = {};
      Object.entries(categoryTotals).forEach(([cat, totals]) => {
        categoryAverages[cat] =
          totals.length > 0
            ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
            : 0;
      });

      const totalCo2Values = completedStudents.map((s) =>
        s.responses.reduce((sum, r) => sum + r.calculatedCo2, 0)
      );
      const averageCo2 =
        totalCo2Values.length > 0
          ? Math.round(
              totalCo2Values.reduce((a, b) => a + b, 0) /
                totalCo2Values.length
            )
          : 0;

      return {
        id: cls.id,
        className: cls.className,
        totalStudents,
        completedStudents: completedStudents.length,
        completionRate,
        averageCo2,
        categoryAverages,
      };
    });

    // School-wide stats
    const allCompletedStudents = classes.flatMap((c) => c.students);
    const allCo2Values = allCompletedStudents.map((s) =>
      s.responses.reduce((sum, r) => sum + r.calculatedCo2, 0)
    );

    const schoolAverage =
      allCo2Values.length > 0
        ? Math.round(
            allCo2Values.reduce((a, b) => a + b, 0) / allCo2Values.length
          )
        : 0;

    const totalParticipants = classes.reduce(
      (sum, c) => sum + c._count.students,
      0
    );
    const totalCompleted = allCompletedStudents.length;

    // School-wide category averages
    const schoolCategoryTotals: Record<string, number[]> = {};
    allCompletedStudents.forEach((student) => {
      const studentCats: Record<string, number> = {};
      student.responses.forEach((r) => {
        studentCats[r.category] =
          (studentCats[r.category] || 0) + r.calculatedCo2;
      });
      Object.entries(studentCats).forEach(([cat, total]) => {
        if (!schoolCategoryTotals[cat]) schoolCategoryTotals[cat] = [];
        schoolCategoryTotals[cat].push(total);
      });
    });

    const schoolCategoryAverages: Record<string, number> = {};
    Object.entries(schoolCategoryTotals).forEach(([cat, totals]) => {
      schoolCategoryAverages[cat] =
        totals.length > 0
          ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
          : 0;
    });

    return NextResponse.json({
      schoolAverage,
      totalParticipants,
      totalCompleted,
      schoolCategoryAverages,
      classStats,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken.' },
      { status: 500 }
    );
  }
}
