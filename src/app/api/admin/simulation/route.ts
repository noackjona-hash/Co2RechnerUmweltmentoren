import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateLicenseKey, generateAccessKey } from '@/lib/utils';
import bcrypt from 'bcryptjs';

// GET simulated schools
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const simulatedSchools = await prisma.license.findMany({
      where: {
        OR: [
          { licenseKey: { startsWith: 'SIM-' } },
          { schoolName: { contains: '[Simulation]' } },
        ],
      },
      include: {
        classes: {
          include: {
            students: {
              select: {
                id: true,
                isCompleted: true,
              },
            },
            _count: { select: { students: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = simulatedSchools.map((school) => {
      const totalStudents = school.classes.reduce((sum, c) => sum + c._count.students, 0);
      const totalCompleted = school.classes.reduce(
        (sum, c) => sum + c.students.filter((s) => s.isCompleted).length,
        0
      );

      return {
        id: school.id,
        schoolName: school.schoolName,
        contactEmail: school.contactEmail,
        licenseKey: school.licenseKey,
        isActive: school.isActive,
        createdAt: school.createdAt,
        classesCount: school.classes.length,
        totalStudents,
        totalCompleted,
        completionRate: totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Fetch simulated schools error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Simulationen.' }, { status: 500 });
  }
}

// POST create simulated school & large dataset
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin' || session.adminRole !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      preset = 'standard',
      schoolName: customName,
      classesCount: inputClassesCount,
      studentsPerClass: inputStudentsPerClass,
      quizMode: inputQuizMode = 60,
      completionRate: inputCompletionRate = 85,
    } = body;

    // Preset configurations
    let targetSchoolName = 'Geschwister-Scholl-Gymnasium [Simulation]';
    let classesCount = 4;
    let studentsPerClass = 25;
    let quizMode = 60;
    let completionRate = 85;

    if (preset === 'small') {
      targetSchoolName = 'Realschule am Stadtpark [Simulation]';
      classesCount = 2;
      studentsPerClass = 20;
      quizMode = 30;
      completionRate = 80;
    } else if (preset === 'large') {
      targetSchoolName = 'Max-Planck-Gesamtschule [Simulation]';
      classesCount = 8;
      studentsPerClass = 28;
      quizMode = 60;
      completionRate = 90;
    } else if (preset === 'custom') {
      targetSchoolName = customName ? `${customName} [Simulation]` : 'Modellschule Baden-Württemberg [Simulation]';
      classesCount = Math.min(Math.max(1, parseInt(inputClassesCount) || 4), 12);
      studentsPerClass = Math.min(Math.max(5, parseInt(inputStudentsPerClass) || 25), 35);
      quizMode = [10, 30, 60].includes(Number(inputQuizMode)) ? Number(inputQuizMode) : 60;
      completionRate = Math.min(Math.max(10, parseInt(inputCompletionRate) || 85), 100);
    }

    if (customName && !customName.includes('[Simulation]')) {
      targetSchoolName = `${customName.trim()} [Simulation]`;
    }

    // 1. Fetch available questions to generate realistic responses
    const allQuestions = await prisma.quizQuestion.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Keine Quizfragen in der Datenbank gefunden.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash('schule123', 10);
    const licenseKey = `SIM-${generateLicenseKey()}`;
    const timestamp = Date.now().toString().slice(-4);

    // 2. Create the simulated School (License)
    const license = await prisma.license.create({
      data: {
        schoolName: `${targetSchoolName} #${timestamp}`,
        contactEmail: `simulation-${timestamp}@umweltmentoren.schule.de`,
        licenseKey,
        passwordHash,
        isActive: true,
      },
    });

    const classNamesList = [
      'Klasse 5a',
      'Klasse 6b',
      'Klasse 7a',
      'Klasse 8b',
      'Klasse 9a',
      'Klasse 10b',
      'Kursstufe 1 (Bio-LK)',
      'Kursstufe 2 (Geographie-LK)',
      'Klasse 7c (Umwelt-AG)',
      'Klasse 8a',
      'Klasse 6a',
      'Klasse 9c',
    ];

    let totalCreatedStudents = 0;
    let totalCompletedStudents = 0;

    // Archetype probabilities for realistic spread
    // 0: Eco / Climate champion (~25%)
    // 1: Average / Typical student (~55%)
    // 2: Carbon-heavy (~20%)
    const archetypes = [0, 1, 1, 1, 2];

    for (let cIdx = 0; cIdx < classesCount; cIdx++) {
      const clsName = classNamesList[cIdx] || `Klasse ${cIdx + 5}a`;

      const newClass = await prisma.class.create({
        data: {
          licenseId: license.id,
          className: clsName,
          quizMode,
        },
      });

      for (let sIdx = 0; sIdx < studentsPerClass; sIdx++) {
        let accessKey = generateAccessKey();
        let existing = await prisma.student.findUnique({ where: { accessKey } });
        while (existing) {
          accessKey = generateAccessKey();
          existing = await prisma.student.findUnique({ where: { accessKey } });
        }

        const isCompleted = Math.random() * 100 < completionRate;
        const student = await prisma.student.create({
          data: {
            classId: newClass.id,
            accessKey,
            isCompleted,
            completedAt: isCompleted ? new Date(Date.now() - Math.random() * 7 * 86400000) : null,
          },
        });

        totalCreatedStudents++;

        if (isCompleted) {
          totalCompletedStudents++;
          const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];

          // Generate response data for each question
          const responseEntries = allQuestions.map((q) => {
            let numericalValue = q.defaultValue || 0;

            if (q.questionType === 'select' || q.questionType === 'radio') {
              if (Array.isArray(q.options) && q.options.length > 0) {
                const opts = q.options as { label: string; value: number }[];
                let pickIdx = 0;
                if (archetype === 0) {
                  // eco: prefer lower value index
                  pickIdx = Math.floor(Math.random() * Math.min(2, opts.length));
                } else if (archetype === 2) {
                  // heavy: prefer higher index
                  pickIdx = Math.max(0, opts.length - 1 - Math.floor(Math.random() * 2));
                } else {
                  // average: random middle
                  pickIdx = Math.floor(Math.random() * opts.length);
                }
                numericalValue = opts[pickIdx]?.value ?? opts[0].value;
              }
            } else if (q.questionType === 'slider' || q.questionType === 'number') {
              const min = q.minValue ?? 0;
              const max = q.maxValue ?? 50;
              const step = q.step ?? 1;

              if (archetype === 0) {
                numericalValue = min + Math.round((Math.random() * (max - min) * 0.3) / step) * step;
              } else if (archetype === 2) {
                numericalValue = min + Math.round(((0.5 + Math.random() * 0.5) * (max - min)) / step) * step;
              } else {
                numericalValue = min + Math.round(((0.2 + Math.random() * 0.5) * (max - min)) / step) * step;
              }
            }

            return {
              studentId: student.id,
              questionId: q.id,
              category: q.category,
              numericalValue,
              calculatedCo2: Math.max(0, numericalValue * q.co2Factor),
            };
          });

          await prisma.quizResponse.createMany({
            data: responseEntries,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Schule "${license.schoolName}" erfolgreich simuliert!`,
      license: {
        id: license.id,
        schoolName: license.schoolName,
        licenseKey: license.licenseKey,
        contactEmail: license.contactEmail,
        classesCount,
        totalCreatedStudents,
        totalCompletedStudents,
      },
    });
  } catch (error) {
    console.error('Simulation generation error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren der Simulationsdaten.' },
      { status: 500 }
    );
  }
}

// DELETE simulated school(s)
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'super-admin' || session.adminRole !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get('licenseId');
    const all = searchParams.get('all') === 'true';

    if (licenseId) {
      await prisma.license.delete({
        where: { id: licenseId },
      });
      return NextResponse.json({ success: true, message: 'Simulierte Schule gelöscht.' });
    }

    if (all) {
      const deleted = await prisma.license.deleteMany({
        where: {
          OR: [
            { licenseKey: { startsWith: 'SIM-' } },
            { schoolName: { contains: '[Simulation]' } },
          ],
        },
      });
      return NextResponse.json({
        success: true,
        message: `${deleted.count} simulierte Schule(n) rückstandslos gelöscht.`,
      });
    }

    return NextResponse.json({ error: 'Keine ID oder all=true angegeben.' }, { status: 400 });
  } catch (error) {
    console.error('Delete simulation error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Simulationsdaten.' },
      { status: 500 }
    );
  }
}
