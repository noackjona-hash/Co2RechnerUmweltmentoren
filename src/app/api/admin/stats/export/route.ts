import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
      'Heizung_kg_CO2',
      'Strom_kg_CO2',
      'Konsum_kg_CO2',
      'Gesamt_kg_CO2'
    ].join(';'));

    for (const student of students) {
      const catTotals: Record<string, number> = {
        mobility: 0,
        food: 0,
        heating: 0,
        electricity: 0,
        consumption: 0,
      };

      let totalCo2 = 0;
      student.responses.forEach(r => {
        const cat = r.category.toLowerCase();
        if (catTotals[cat] !== undefined) {
          catTotals[cat] += r.calculatedCo2;
        } else {
          catTotals[cat] = (catTotals[cat] || 0) + r.calculatedCo2;
        }
        totalCo2 += r.calculatedCo2;
      });

      const row = [
        student.id,
        student.class.license.schoolName,
        student.class.className,
        student.createdAt.toISOString().split('T')[0],
        student.isCompleted ? 'Ja' : 'Nein',
        catTotals.mobility.toFixed(2),
        catTotals.food.toFixed(2),
        catTotals.heating.toFixed(2),
        catTotals.electricity.toFixed(2),
        catTotals.consumption.toFixed(2),
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
