/**
 * Wissenschaftliche CO₂-Bilanzierung nach Standard des Umweltbundesamts (UBA) und GEMIS.
 * 
 * Jede Person in Deutschland hat eine Grund-Pauschale für unvermeidbare gesellschaftliche und
 * infrastrukturelle Emissionen sowie Lebensbereich-Sockelbeträge für die Grundversorgung.
 */

export const CO2_BASE_PAUSCHALEN = {
  // 1. Feste gesellschaftliche Pauschale: Öffentliche Hand & Infrastruktur
  // Straßen, Schienen, Krankenhäuser, Schulen, Hochschulen, Polizei, Justiz, Verwaltung, Wasser- & Abfallwirtschaft.
  // Fällt unvermeidbar für jeden Bürger in Deutschland an.
  public: 1200, // kg CO₂e / Jahr

  // 2. Lebensbereich-Grundpauschalen (Sockelbeträge für Grundbedarfe)
  // Konsum: Grundausstattung an Möbeln, Haushaltsgeräten, IT-Netzen, Post, Dienstleistungen, Gesundheitswesen
  consumption: 1400, // kg CO₂e / Jahr

  // Wohnen & Energie: Gebäudegrundlast, graue Bauenergie, Allgemeinstrom des Hauses, Trinkwasserpumpen
  energy: 800, // kg CO₂e / Jahr

  // Ernährung: Physiologischer Grundbedarf (2000 kcal/Tag), Landwirtschafts-Vorleistungen, Kühlketten
  food: 600, // kg CO₂e / Jahr

  // Mobilität: Versorgungslogistik für den Alltag, Warentransporte, Bereitstellung des ÖPNV-Basisnetzes
  mobility: 400, // kg CO₂e / Jahr
} as const;

export type PauschaleCategory = keyof typeof CO2_BASE_PAUSCHALEN;

// Gesamte Grundpauschale = 1200 + 1400 + 800 + 600 + 400 = 4400 kg (4,4 Tonnen)
export const TOTAL_BASE_PAUSCHALE =
  CO2_BASE_PAUSCHALEN.public +
  CO2_BASE_PAUSCHALEN.consumption +
  CO2_BASE_PAUSCHALEN.energy +
  CO2_BASE_PAUSCHALEN.food +
  CO2_BASE_PAUSCHALEN.mobility;

/**
 * Berechnet die Summen pro Kategorie inklusive der UBA-Basispauschalen
 */
export function calculateStudentCategoryTotals(
  responses: { category: string; calculatedCo2: number }[]
): Record<string, number> {
  const totals: Record<string, number> = {
    mobility: CO2_BASE_PAUSCHALEN.mobility,
    food: CO2_BASE_PAUSCHALEN.food,
    energy: CO2_BASE_PAUSCHALEN.energy,
    consumption: CO2_BASE_PAUSCHALEN.consumption,
    public: CO2_BASE_PAUSCHALEN.public,
  };

  for (const r of responses) {
    if (r.category && r.category in totals) {
      totals[r.category] += Number(r.calculatedCo2) || 0;
    }
  }

  // Ensure no category falls below its minimum physical threshold
  totals.mobility = Math.max(CO2_BASE_PAUSCHALEN.mobility, Math.round(totals.mobility));
  totals.food = Math.max(CO2_BASE_PAUSCHALEN.food, Math.round(totals.food));
  totals.energy = Math.max(CO2_BASE_PAUSCHALEN.energy, Math.round(totals.energy));
  totals.consumption = Math.max(CO2_BASE_PAUSCHALEN.consumption, Math.round(totals.consumption));
  totals.public = CO2_BASE_PAUSCHALEN.public;

  return totals;
}

/**
 * Berechnet das gesamte Jahresergebnis eines Schülers (Fragen-Ergebnis + Grundpauschale)
 */
export function calculateStudentTotalCo2(
  responses: { calculatedCo2: number }[]
): number {
  const variableSum = responses.reduce((sum, r) => sum + (Number(r.calculatedCo2) || 0), 0);
  return Math.round(variableSum + TOTAL_BASE_PAUSCHALE);
}
