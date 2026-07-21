import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://co2user:co2pass@localhost:5432/co2rechner';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Seeding demo data for presentation...');

  const passwordHash = await bcrypt.hash('demo123', 12);

  // 1. Create a License for Hilda-Gymnasium
  const license = await prisma.license.upsert({
    where: { licenseKey: 'HILDA-2026' },
    update: {},
    create: {
      schoolName: 'Hilda-Gymnasium Pforzheim',
      contactEmail: 'demo@hilda.de',
      licenseKey: 'HILDA-2026',
      passwordHash,
    },
  });
  console.log('✅ License created: HILDA-2026');

  // 2. Create Classes
  const class9b = await prisma.class.create({
    data: {
      licenseId: license.id,
      className: 'Klasse 9b',
      quizMode: 60,
    },
  });
  const class10a = await prisma.class.create({
    data: {
      licenseId: license.id,
      className: 'Klasse 10a',
      quizMode: 60,
    },
  });
  console.log('✅ Classes created: 9b, 10a');

  // Fetch some questions to mock responses
  const questions = await prisma.quizQuestion.findMany();
  
  if (questions.length === 0) {
    console.error('❌ No questions found. Please run npm run db:seed first!');
    process.exit(1);
  }

  // Helper to generate a student with random but good responses
  async function generateStudent(classId: string, isEcoFriendly: boolean) {
    const student = await prisma.student.create({
      data: {
        classId,
        accessKey: Math.random().toString(36).substring(2, 10).toUpperCase(),
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    for (const q of questions) {
      let value = 0;
      let co2 = 0;

      // Smart mock logic to trigger badges
      if (q.category === 'mobility' && q.questionText.includes('Wie kommst du normalerweise zur Schule?')) {
        value = isEcoFriendly ? 1 : 4; // 1 = Fahrrad, 4 = Auto
        co2 = isEcoFriendly ? 0 : 300;
      } else if (q.category === 'food' && q.questionText.includes('Wie würdest du deine Ernährung beschreiben?')) {
        value = isEcoFriendly ? 1200 : 1800; // Veggi vs Mischkost
        co2 = value;
      } else if (q.category === 'energy' && q.questionText.includes('Bezieht ihr Ökostrom?')) {
        value = isEcoFriendly ? -400 : 0;
        co2 = value;
      } else if (q.category === 'consumption' && q.questionText.includes('Second-Hand')) {
        value = isEcoFriendly ? -100 : 0;
        co2 = value;
      } else if (q.category === 'mobility' && q.questionText.includes('Wie oft bist du im letzten Jahr geflogen')) {
        value = isEcoFriendly ? 0 : 1000;
        co2 = value;
      } else {
        // Fallback random
        value = q.defaultValue || 0;
        co2 = Math.random() * 50;
      }

      await prisma.quizResponse.create({
        data: {
          studentId: student.id,
          questionId: q.id,
          category: q.category,
          numericalValue: value,
          calculatedCo2: co2,
        },
      });
    }
  }

  console.log('👨‍🎓 Generating students for Klasse 9b (Eco Friendly)...');
  for (let i = 0; i < 20; i++) {
    await generateStudent(class9b.id, true); // Trigger all badges
  }

  console.log('👩‍🎓 Generating students for Klasse 10a (Average)...');
  for (let i = 0; i < 22; i++) {
    await generateStudent(class10a.id, Math.random() > 0.7); // Some eco, mostly not
  }

  console.log('🎉 Demo data seeded successfully! You can login with License: HILDA-2026, Pass: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
