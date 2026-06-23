import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { licenseKey, password } = await request.json();

    if (!licenseKey || !password) {
      return NextResponse.json(
        { error: 'Lizenzschlüssel und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey },
    });

    if (!license) {
      return NextResponse.json(
        { error: 'Ungültiger Lizenzschlüssel.' },
        { status: 401 }
      );
    }

    if (!license.isActive) {
      return NextResponse.json(
        { error: 'Diese Lizenz ist deaktiviert.' },
        { status: 403 }
      );
    }

    const validPassword = await bcrypt.compare(password, license.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Ungültiges Passwort.' },
        { status: 401 }
      );
    }

    await setSession({
      id: license.id,
      role: 'school-admin',
      schoolName: license.schoolName,
      licenseId: license.id,
    });

    return NextResponse.json({
      success: true,
      role: 'school-admin',
      schoolName: license.schoolName,
    });
  } catch (error) {
    console.error('School login error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
