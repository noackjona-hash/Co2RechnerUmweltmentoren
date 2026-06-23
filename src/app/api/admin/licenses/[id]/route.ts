import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Toggle license active/inactive
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { isActive } = await request.json();

    const license = await prisma.license.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(license);
  } catch (error) {
    console.error('Update license error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Lizenz.' },
      { status: 500 }
    );
  }
}

// DELETE license
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.license.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete license error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Lizenz.' },
      { status: 500 }
    );
  }
}
