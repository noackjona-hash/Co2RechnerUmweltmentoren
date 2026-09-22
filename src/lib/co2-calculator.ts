/**
 * Wissenschaftliche CO₂-Bilanzierung nach Standard des Umweltbundesamts (UBA) und GEMIS.
 * 
 * Jede Person in Deutschland hat persönliche Emissionen im Alltag (Ernährung, Mobilität, Wohnen, Konsum)
 * sowie einen statistischen Anteil an der öffentlichen Infrastruktur (Straßen, Schulen, Krankenhäuser).
 */

// Feste gesellschaftliche Pauschale: Öffentliche Hand & staatliche Infrastruktur
// Straßen, Schienen, Krankenhäuser, Schulen, Verwaltung, Polizei, Wasser- & Abfallwirtschaft.
// Fällt für jeden Bürger in Deutschland an und beträgt laut Umweltbundesamt ca. 1.200 kg CO₂e pro Jahr.
export const PUBLIC_INFRASTRUCTURE_CO2 = 1200; // kg CO₂e / Jahr

export const CO2_BASE_PAUSCHALEN = {
  public: 1200,
  consumption: 0,
  energy: 0,
  food: 0,
  mobility: 0,
} as const;

export type PauschaleCategory = keyof typeof CO2_BASE_PAUSCHALEN;

export const TOTAL_BASE_PAUSCHALE = 1200;

/**
 * Berechnet die tatsächlichen Summen der 4 persönlichen Lebensbereiche aus den Quiz-Antworten.
 */
export function calculateStudentCategoryTotals(
  responses: { category: string; calculatedCo2: number }[]
): Record<string, number> {
  const totals: Record<string, number> = {
    mobility: 0,
    food: 0,
    energy: 0,
    consumption: 0,
  };

  for (const r of responses) {
    if (r.category && r.category in totals) {
      totals[r.category] += Number(r.calculatedCo2) || 0;
    }
  }

  // Physikalische Untergrenzen (keine negativen Kategorien nach Boni)
  totals.mobility = Math.max(0, Math.round(totals.mobility));
  totals.food = Math.max(0, Math.round(totals.food));
  totals.energy = Math.max(0, Math.round(totals.energy));
  totals.consumption = Math.max(0, Math.round(totals.consumption));

  return totals;
}

/**
 * Berechnet das persönliche Jahresergebnis eines Schülers (Summe aller Alltagsbereiche).
 */
export function calculateStudentTotalCo2(
  responses: { calculatedCo2: number }[]
): number {
  const variableSum = responses.reduce((sum, r) => sum + (Number(r.calculatedCo2) || 0), 0);
  return Math.max(0, Math.round(variableSum));
}

/**
 * Berechnet das Gesamtergebnis inklusive staatlicher UBA-Infrastruktur (+1.200 kg).
 */
export function calculateStudentFullCo2(
  responses: { calculatedCo2: number }[]
): number {
  return calculateStudentTotalCo2(responses) + PUBLIC_INFRASTRUCTURE_CO2;
}

