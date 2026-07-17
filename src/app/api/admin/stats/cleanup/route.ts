import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'super-admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { confirmation } = await req.json();
    if (confirmation !== 'CLEANUP') {
      return NextResponse.json({ error: 'Falsches Bestaetigungswort' }, { status: 400 });
    }

    // Delete all students. Cascade will delete all QuizResponse records automatically.
    const deletedStudents = await prisma.student.deleteMany();

    return NextResponse.json({
      success: true,
      message: `${deletedStudents.count} Schueler und deren Ergebnisse wurden geloescht.`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
