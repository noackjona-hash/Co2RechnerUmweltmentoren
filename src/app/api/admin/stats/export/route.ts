import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  calculateStudentCategoryTotals,
  calculateStudentTotalCo2,
} from '@/lib/co2-calculator';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'super-admin' || (session.adminRole !== 'super-admin' && session.adminRole !== 'editor')) {
      return new Response('Unauthorized', { status: 403 });
    }

    const students = await prisma.student.findMany({
      include: {
        class: {
          include: {
            license: true,
          },
        },
        responses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const csvRows = [];
    // CSV Header
    csvRows.push([
      'Schueler_ID',
      'Schule',
      'Klasse',
      'Registrierungsdatum',
      'Abgeschlossen',
      'Mobilitaet_kg_CO2',
      'Ernaehrung_kg_CO2',
      'Energie_kg_CO2',
      'Konsum_kg_CO2',
      'Oeffentliche_Hand_kg_CO2',
      'Gesamt_kg_CO2'
    ].join(';'));

    for (const student of students) {
      const catTotals = calculateStudentCategoryTotals(student.responses);
      const totalCo2 = calculateStudentTotalCo2(student.responses);

      const row = [
        student.id,
        student.class.license.schoolName,
        student.class.className,
        student.createdAt.toISOString().split('T')[0],
        student.isCompleted ? 'Ja' : 'Nein',
        (catTotals.mobility || 0).toFixed(2),
        (catTotals.food || 0).toFixed(2),
        (catTotals.energy || 0).toFixed(2),
        (catTotals.consumption || 0).toFixed(2),
        (catTotals.public || 0).toFixed(2),
        totalCo2.toFixed(2)
      ];

      csvRows.push(row.join(';'));
    }

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="co2_rechner_ergebnisse.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
