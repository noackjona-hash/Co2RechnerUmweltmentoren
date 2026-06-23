import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public stats endpoint – returns aggregate counts for the landing page
export async function GET() {
  try {
    const totalCompleted = await prisma.student.count({
      where: { isCompleted: true },
    });

    const totalSchools = await prisma.license.count();

    const totalClasses = await prisma.class.count();

    return NextResponse.json({
      totalCompleted,
      totalSchools,
      totalClasses,
    });
  } catch {
    return NextResponse.json(
      { totalCompleted: 0, totalSchools: 0, totalClasses: 0 },
      { status: 200 }
    );
  }
}
