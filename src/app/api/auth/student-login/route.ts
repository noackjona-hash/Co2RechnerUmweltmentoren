import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { accessKey } = await request.json();

    if (!accessKey) {
      return NextResponse.json(
        { error: 'Zugangscode ist erforderlich.' },
        { status: 400 }
      );
    }

    // Normalize the access key (uppercase, add dash if missing)
    let normalized = accessKey.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (normalized.length === 8) {
      normalized = `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
    }

    const student = await prisma.student.findUnique({
      where: { accessKey: normalized },
      include: {
        class: {
          include: {
            license: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Ungültiger Zugangscode.' },
        { status: 401 }
      );
    }

    if (!student.class.license.isActive) {
      return NextResponse.json(
        { error: 'Die Lizenz deiner Schule ist deaktiviert.' },
        { status: 403 }
      );
    }

    await setSession({
      id: student.id,
      role: 'student',
      classId: student.classId,
      accessKey: student.accessKey,
    });

    return NextResponse.json({
      success: true,
      role: 'student',
      isCompleted: student.isCompleted,
    });
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
