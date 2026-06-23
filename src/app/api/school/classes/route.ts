import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET all classes for the logged-in school
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'school-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const classes = await prisma.class.findMany({
    where: { licenseId: session.licenseId },
    include: {
      students: {
        select: {
          id: true,
          accessKey: true,
          isCompleted: true,
          completedAt: true,
        },
      },
      _count: {
        select: { students: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(classes);
}

// CREATE new class
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'school-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { className } = await request.json();

    if (!className) {
      return NextResponse.json(
        { error: 'Klassenname ist erforderlich.' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        className,
        licenseId: session.licenseId!,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Klasse.' },
      { status: 500 }
    );
  }
}
