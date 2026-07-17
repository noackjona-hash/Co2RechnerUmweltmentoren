import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET all admin users
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'super-admin' || session.adminRole !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const admins = await prisma.superAdmin.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('List admins error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Admins.' }, { status: 500 });
  }
}

// CREATE new admin user
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin' || session.adminRole !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'E-Mail, Passwort und Rolle sind erforderlich.' },
        { status: 400 }
      );
    }

    if (!['super-admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Ungültige Rolle.' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.superAdmin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Ein Admin mit dieser E-Mail existiert bereits.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.superAdmin.create({
      data: {
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Admins.' }, { status: 500 });
  }
}

// UPDATE admin user (role or password)
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin' || session.adminRole !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, password, role } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Admin-ID ist erforderlich.' }, { status: 400 });
    }

    const data: any = {};
    if (role) {
      if (!['super-admin', 'editor', 'viewer'].includes(role)) {
        return NextResponse.json({ error: 'Ungültige Rolle.' }, { status: 400 });
      }
      // Prevent demoting self
      if (id === session.id && role !== 'super-admin') {
        return NextResponse.json({ error: 'Sie können Ihre eigene Super-Admin-Rolle nicht ändern.' }, { status: 400 });
      }
      data.role = role;
    }

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    const admin = await prisma.superAdmin.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Admins.' }, { status: 500 });
  }
}

// DELETE admin user
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin' || session.adminRole !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin-ID ist erforderlich.' }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json({ error: 'Sie können sich nicht selbst löschen.' }, { status: 400 });
    }

    await prisma.superAdmin.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Admins.' }, { status: 500 });
  }
}
