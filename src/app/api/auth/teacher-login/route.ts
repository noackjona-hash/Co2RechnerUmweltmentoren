import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, identifier, password, licenseKey, className } = body;

    const rawPassword = password ? String(password) : '';
    if (!rawPassword) {
      return NextResponse.json(
        { error: 'Bitte gib dein Passwort ein.' },
        { status: 400 }
      );
    }

    const inputEmail = (email || (identifier && identifier.includes('@') ? identifier : '')).trim();
    const inputLicenseKey = (licenseKey || (identifier && !identifier.includes('@') ? identifier : '')).trim();

    // 1. Authentication via Teacher Email
    if (inputEmail) {
      const classes = await prisma.class.findMany({
        where: {
          teacherEmail: {
            equals: inputEmail,
            mode: 'insensitive',
          },
        },
        include: {
          license: {
            select: {
              id: true,
              schoolName: true,
              isActive: true,
            },
          },
        },
      });

      if (classes.length === 0) {
        return NextResponse.json(
          { error: 'Keine Klasse mit dieser E-Mail-Adresse verknüpft.' },
          { status: 401 }
        );
      }

      // Check if any matching class has a valid password
      let matchedClass = null;
      for (const cls of classes) {
        if (cls.teacherPasswordHash) {
          const isValid = await bcrypt.compare(rawPassword, cls.teacherPasswordHash);
          if (isValid) {
            matchedClass = cls;
            break;
          }
        }
      }

      if (!matchedClass) {
        return NextResponse.json(
          { error: 'Ungültiges Passwort oder noch kein Lehrer-Passwort eingerichtet.' },
          { status: 401 }
        );
      }

      if (!matchedClass.license.isActive) {
        return NextResponse.json(
          { error: 'Die Schullizenz dieser Schule ist derzeit deaktiviert.' },
          { status: 403 }
        );
      }

      await setSession({
        id: matchedClass.id,
        role: 'teacher',
        email: matchedClass.teacherEmail || undefined,
        schoolName: matchedClass.license.schoolName,
        licenseId: matchedClass.licenseId,
        classId: matchedClass.id,
        teacherName: matchedClass.teacherName || undefined,
        className: matchedClass.className,
      });

      return NextResponse.json({
        success: true,
        role: 'teacher',
        teacherName: matchedClass.teacherName,
        className: matchedClass.className,
        schoolName: matchedClass.license.schoolName,
      });
    }

    // 2. Authentication via School License Key + Class Name
    if (inputLicenseKey && className) {
      const license = await prisma.license.findUnique({
        where: { licenseKey: inputLicenseKey },
      });

      if (!license || !license.isActive) {
        return NextResponse.json(
          { error: 'Ungültiger oder inaktiver Schullizenz-Schlüssel.' },
          { status: 401 }
        );
      }

      const classRecord = await prisma.class.findFirst({
        where: {
          licenseId: license.id,
          className: {
            equals: String(className).trim(),
            mode: 'insensitive',
          },
        },
      });

      if (!classRecord || !classRecord.teacherPasswordHash) {
        return NextResponse.json(
          { error: 'Klasse nicht gefunden oder kein Lehrer-Passwort vergeben.' },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(rawPassword, classRecord.teacherPasswordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Ungültiges Passwort.' },
          { status: 401 }
        );
      }

      await setSession({
        id: classRecord.id,
        role: 'teacher',
        email: classRecord.teacherEmail || undefined,
        schoolName: license.schoolName,
        licenseId: classRecord.licenseId,
        classId: classRecord.id,
        teacherName: classRecord.teacherName || undefined,
        className: classRecord.className,
      });

      return NextResponse.json({
        success: true,
        role: 'teacher',
        teacherName: classRecord.teacherName,
        className: classRecord.className,
        schoolName: license.schoolName,
      });
    }

    return NextResponse.json(
      { error: 'Bitte gib deine E-Mail-Adresse und dein Passwort ein.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Teacher login error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler beim Login.' },
      { status: 500 }
    );
  }
}
