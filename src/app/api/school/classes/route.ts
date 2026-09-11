import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET all classes for the logged-in school or teacher
export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'school-admin' && session.role !== 'teacher')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let whereClause: any = { licenseId: session.licenseId };

  // If teacher, scope to only their classes
  if (session.role === 'teacher') {
    if (session.email) {
      whereClause = {
        licenseId: session.licenseId,
        OR: [
          { id: session.classId },
          { teacherEmail: { equals: session.email, mode: 'insensitive' } },
        ],
      };
    } else {
      whereClause = {
        licenseId: session.licenseId,
        id: session.classId,
      };
    }
  }

  const classes = await prisma.class.findMany({
    where: whereClause,
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

  const sanitizedClasses = classes.map((cls) => {
    const { teacherPasswordHash, ...rest } = cls;
    return {
      ...rest,
      hasTeacherPassword: !!teacherPasswordHash,
    };
  });

  return NextResponse.json(sanitizedClasses);
}

// CREATE new class (school-admin only)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'school-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { className, quizMode, teacherName, teacherEmail, teacherPassword } = await request.json();

    if (!className) {
      return NextResponse.json(
        { error: 'Klassenname ist erforderlich.' },
        { status: 400 }
      );
    }

    const mode = quizMode ? Number(quizMode) : 60;
    if (![10, 30, 60].includes(mode)) {
      return NextResponse.json(
        { error: 'Ungültiger Fragen-Modus (muss 10, 30 oder 60 sein).' },
        { status: 400 }
      );
    }

    let teacherPasswordHash: string | null = null;
    if (teacherPassword && String(teacherPassword).trim().length > 0) {
      teacherPasswordHash = await bcrypt.hash(String(teacherPassword).trim(), 10);
    }

    const newClass = await prisma.class.create({
      data: {
        className: String(className).trim(),
        teacherName: teacherName ? String(teacherName).trim() : null,
        teacherEmail: teacherEmail ? String(teacherEmail).trim() : null,
        teacherPasswordHash,
        quizMode: mode,
        licenseId: session.licenseId!,
      },
    });

    const { teacherPasswordHash: _, ...result } = newClass;
    return NextResponse.json({ ...result, hasTeacherPassword: !!teacherPasswordHash }, { status: 201 });
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Klasse.' },
      { status: 500 }
    );
  }
}
