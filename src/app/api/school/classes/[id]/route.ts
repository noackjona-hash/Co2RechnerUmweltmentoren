import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateAccessKey } from '@/lib/utils';

// Generate student access keys for a class
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'school-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { count } = await request.json();

    if (!count || count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Anzahl muss zwischen 1 und 100 liegen.' },
        { status: 400 }
      );
    }

    // Verify the class belongs to this school
    const classRecord = await prisma.class.findFirst({
      where: { id, licenseId: session.licenseId },
    });

    if (!classRecord) {
      return NextResponse.json(
        { error: 'Klasse nicht gefunden.' },
        { status: 404 }
      );
    }

    const students = [];
    for (let i = 0; i < count; i++) {
      let accessKey = generateAccessKey();
      // Ensure uniqueness
      let exists = await prisma.student.findUnique({ where: { accessKey } });
      while (exists) {
        accessKey = generateAccessKey();
        exists = await prisma.student.findUnique({ where: { accessKey } });
      }

      const student = await prisma.student.create({
        data: {
          classId: id,
          accessKey,
        },
      });
      students.push(student);
    }

    return NextResponse.json(students, { status: 201 });
  } catch (error) {
    console.error('Generate keys error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren der Zugangscodes.' },
      { status: 500 }
    );
  }
}

// DELETE a class
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'school-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const classRecord = await prisma.class.findFirst({
      where: { id, licenseId: session.licenseId },
    });

    if (!classRecord) {
      return NextResponse.json(
        { error: 'Klasse nicht gefunden.' },
        { status: 404 }
      );
    }

    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete class error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Klasse.' },
      { status: 500 }
    );
  }
}
