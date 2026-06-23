import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateClassBadges } from '@/lib/badges';

// GET student results
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const responses = await prisma.quizResponse.findMany({
      where: { studentId: session.id },
      select: {
        category: true,
        calculatedCo2: true,
      },
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

    // Fetch current student details to find class and license
    const student = await prisma.student.findUnique({
      where: { id: session.id },
      select: {
        classId: true,
        class: {
          select: {
            licenseId: true,
            className: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get all classes for the same school (license)
    const classes = await prisma.class.findMany({
      where: { licenseId: student.class.licenseId },
      select: {
        id: true,
        className: true,
        students: {
          where: { isCompleted: true },
          select: {
            id: true,
            responses: {
              select: {
                calculatedCo2: true,
                category: true,
                numericalValue: true,
                question: {
                  select: {
                    orderIndex: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    let classAverage = 0;
    const classCategoryAverages: Record<string, number> = {};
    let schoolAverage = 0;
    const schoolLeaderboard: any[] = [];
    const allSchoolCompletedCo2s: number[] = [];

    classes.forEach((cls) => {
      const completedStudents = cls.students;
      const totalStudents = cls._count.students;

      const studentCo2s = completedStudents.map((s) => {
        const studentSum = s.responses.reduce((sum, r) => sum + r.calculatedCo2, 0);
        allSchoolCompletedCo2s.push(studentSum);
        return studentSum;
      });

      const avgCo2 =
        studentCo2s.length > 0
          ? Math.round(studentCo2s.reduce((a, b) => a + b, 0) / studentCo2s.length)
          : 0;

      const badges = calculateClassBadges(completedStudents, avgCo2);

      schoolLeaderboard.push({
        classId: cls.id,
        className: cls.className,
        averageCo2: avgCo2,
        completedCount: completedStudents.length,
        totalCount: totalStudents,
        badges: badges,
      });

      if (cls.id === student.classId) {
        classAverage = avgCo2;

        const categoryTotalsMap: Record<string, number[]> = {};
        completedStudents.forEach((s) => {
          const studentCatTotals: Record<string, number> = {};
          s.responses.forEach((r) => {
            studentCatTotals[r.category] = (studentCatTotals[r.category] || 0) + r.calculatedCo2;
          });
          Object.entries(studentCatTotals).forEach(([cat, sum]) => {
            if (!categoryTotalsMap[cat]) categoryTotalsMap[cat] = [];
            categoryTotalsMap[cat].push(sum);
          });
        });

        Object.entries(categoryTotalsMap).forEach(([cat, values]) => {
          classCategoryAverages[cat] =
            values.length > 0
              ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
              : 0;
        });
      }
    });

    // Sort leaderboard: lowest average first. Classes with no completions go to the bottom.
    schoolLeaderboard.sort((a, b) => {
      if (a.completedCount === 0 && b.completedCount > 0) return 1;
      if (b.completedCount === 0 && a.completedCount > 0) return -1;
      return a.averageCo2 - b.averageCo2;
    });

    schoolAverage =
      allSchoolCompletedCo2s.length > 0
        ? Math.round(allSchoolCompletedCo2s.reduce((a, b) => a + b, 0) / allSchoolCompletedCo2s.length)
        : 0;

    return NextResponse.json({
      totalCo2,
      categoryTotals,
      responses,
      className: student.class.className,
      classAverage,
      classCategoryAverages,
      schoolAverage,
      schoolLeaderboard,
      classBadges: calculateClassBadges(
        classes.find((c) => c.id === student.classId)?.students || [],
        classAverage
      ),
    });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Ergebnisse.' },
      { status: 500 }
    );
  }
}
