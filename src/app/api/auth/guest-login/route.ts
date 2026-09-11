import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/auth';
import { generateAccessKey } from '@/lib/utils';

const GUEST_LICENSE_KEY = 'GAST-LIZENZ-SYSTEM';

export async function POST() {
  try {
    // 1. Ensure system guest license exists
    let license = await prisma.license.findUnique({
      where: { licenseKey: GUEST_LICENSE_KEY },
    });

    if (!license) {
      license = await prisma.license.create({
        data: {
          schoolName: 'Freie Gast-Teilnahme',
          contactEmail: 'gast@umweltmentoren.de',
          licenseKey: GUEST_LICENSE_KEY,
          passwordHash: 'GUEST_LOCKED_ACCOUNT',
          isActive: true,
        },
      });
    }

    // 2. Ensure system guest class exists
    let guestClass = await prisma.class.findFirst({
      where: {
        licenseId: license.id,
        className: 'Gast-Teilnahme',
      },
    });

    if (!guestClass) {
      guestClass = await prisma.class.create({
        data: {
          licenseId: license.id,
          className: 'Gast-Teilnahme',
          quizMode: 60,
        },
      });
    }

    // 3. Create a unique guest student
    let key = `GAST-${generateAccessKey().slice(0, 4)}`;
    let existing = await prisma.student.findUnique({ where: { accessKey: key } });
    while (existing) {
      key = `GAST-${generateAccessKey().slice(0, 4)}`;
      existing = await prisma.student.findUnique({ where: { accessKey: key } });
    }

    const student = await prisma.student.create({
      data: {
        classId: guestClass.id,
        accessKey: key,
      },
    });

    // 4. Set session
    await setSession({
      id: student.id,
      role: 'student',
      classId: guestClass.id,
      accessKey: student.accessKey,
    });

    return NextResponse.json({
      success: true,
      url: '/quiz',
      accessKey: student.accessKey,
      isGuest: true,
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Starten der Gast-Sitzung.' },
      { status: 500 }
    );
  }
}
