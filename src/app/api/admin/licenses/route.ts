import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateLicenseKey } from '@/lib/utils';
import bcrypt from 'bcryptjs';

// GET all licenses
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const licenses = await prisma.license.findMany({
    include: {
      classes: {
        include: {
          _count: { select: { students: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(licenses);
}

// CREATE new license
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { schoolName, contactEmail, password } = await request.json();

    if (!schoolName || !contactEmail || !password) {
      return NextResponse.json(
        { error: 'Schulname, E-Mail und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    const licenseKey = generateLicenseKey();
    const passwordHash = await bcrypt.hash(password, 12);

    const license = await prisma.license.create({
      data: {
        schoolName,
        contactEmail,
        licenseKey,
        passwordHash,
      },
    });

    return NextResponse.json(license, { status: 201 });
  } catch (error) {
    console.error('Create license error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Lizenz.' },
      { status: 500 }
    );
  }
}
