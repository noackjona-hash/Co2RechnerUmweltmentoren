import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET all quiz questions
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const questions = await prisma.quizQuestion.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('List questions error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Fragen.' }, { status: 500 });
  }
}

// UPDATE quiz question
export async function PATCH(request: Request) {
  const session = await getSession();
  if (
    !session ||
    session.role !== 'super-admin' ||
    (session.adminRole !== 'super-admin' && session.adminRole !== 'editor')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const {
      id,
      questionText,
      co2Factor,
      helpText,
      orderIndex,
      tier,
      options,
      minValue,
      maxValue,
      step,
      defaultValue,
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Fragen-ID ist erforderlich.' }, { status: 400 });
    }

    const data: any = {};
    if (questionText !== undefined) data.questionText = questionText;
    if (co2Factor !== undefined) data.co2Factor = Number(co2Factor);
    if (helpText !== undefined) data.helpText = helpText;
    if (orderIndex !== undefined) data.orderIndex = Number(orderIndex);
    if (tier !== undefined) data.tier = Number(tier);
    if (options !== undefined) data.options = options; // Options can be null, JSON array or object
    if (minValue !== undefined) data.minValue = minValue !== null ? Number(minValue) : null;
    if (maxValue !== undefined) data.maxValue = maxValue !== null ? Number(maxValue) : null;
    if (step !== undefined) data.step = step !== null ? Number(step) : null;
    if (defaultValue !== undefined) data.defaultValue = defaultValue !== null ? Number(defaultValue) : null;

    const question = await prisma.quizQuestion.update({
      where: { id },
      data,
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren der Frage.' }, { status: 500 });
  }
}

// CREATE quiz question
export async function POST(request: Request) {
  const session = await getSession();
  if (
    !session ||
    session.role !== 'super-admin' ||
    (session.adminRole !== 'super-admin' && session.adminRole !== 'editor')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const {
      category,
      questionText,
      questionType,
      co2Factor,
      helpText,
      orderIndex,
      tier,
      options,
      minValue,
      maxValue,
      step,
      defaultValue,
      unit,
    } = await request.json();

    if (!category || !questionText || !questionType) {
      return NextResponse.json({ error: 'Kategorie, Fragentext und Typ sind erforderlich.' }, { status: 400 });
    }

    const question = await prisma.quizQuestion.create({
      data: {
        category,
        questionText,
        questionType,
        co2Factor: Number(co2Factor || 0),
        helpText: helpText || null,
        orderIndex: Number(orderIndex || 0),
        tier: Number(tier || 3),
        options: options || null,
        minValue: minValue !== null && minValue !== undefined ? Number(minValue) : null,
        maxValue: maxValue !== null && maxValue !== undefined ? Number(maxValue) : null,
        step: step !== null && step !== undefined ? Number(step) : null,
        defaultValue: defaultValue !== null && defaultValue !== undefined ? Number(defaultValue) : null,
        unit: unit || null,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Frage.' }, { status: 500 });
  }
}

// DELETE quiz question
export async function DELETE(request: Request) {
  const session = await getSession();
  if (
    !session ||
    session.role !== 'super-admin' ||
    (session.adminRole !== 'super-admin' && session.adminRole !== 'editor')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Fragen-ID ist erforderlich.' }, { status: 400 });
    }

    // Delete responses first to avoid foreign key violations if not cascaded
    await prisma.quizResponse.deleteMany({
      where: { questionId: id },
    });

    await prisma.quizQuestion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Frage erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen der Frage.' }, { status: 500 });
  }
}
