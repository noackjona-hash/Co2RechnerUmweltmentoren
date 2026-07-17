import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    console.log("Raw body received in admin-login:", rawBody);
    const { email, password } = JSON.parse(rawBody);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    const admin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten.' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten.' },
        { status: 401 }
      );
    }

    await setSession({
      id: admin.id,
      role: 'super-admin',
      email: admin.email,
      adminRole: admin.role as 'super-admin' | 'editor' | 'viewer',
    });

    return NextResponse.json({ success: true, role: 'super-admin', adminRole: admin.role });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
