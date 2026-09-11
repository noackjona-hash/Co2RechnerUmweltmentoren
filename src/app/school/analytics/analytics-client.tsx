'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CATEGORIES,
  NATIONAL_AVERAGE_CO2,
  formatCO2,
  type Category,
} from '@/lib/utils';
import dynamic from 'next/dynamic';

const SchoolCategoryPieChart = dynamic(
  () => import('@/components/analytics-charts').then((mod) => mod.SchoolCategoryPieChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] flex items-center justify-center font-mono text-xs text-muted-foreground">
        Diagramm wird geladen...
      </div>
    ),
  }
);
const SchoolClassBarChart = dynamic(
  () => import('@/components/analytics-charts').then((mod) => mod.SchoolClassBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] flex items-center justify-center font-mono text-xs text-muted-foreground">
        Diagramm wird geladen...
      </div>
    ),
  }
);

import {
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

interface AnalyticsData {
  schoolAverage: number;
  totalParticipants: number;
  totalCompleted: number;
  schoolCategoryAverages: Record<string, number>;
  classStats: {
    id: string;
    className: string;
    totalStudents: number;
    completedStudents: number;
    completionRate: number;
    averageCo2: number;
    categoryAverages: Record<string, number>;
    badges: any[];
  }[];
}

export default function SchoolAnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/school/analytics');
        const result = await res.json();
        setData(result);
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Statistiken werden geladen...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const belowAverage = data.schoolAverage < NATIONAL_AVERAGE_CO2;

  const categoryPieData = Object.entries(data.schoolCategoryAverages).map(([key, value]) => ({
    name: CATEGORIES[key as Category]?.label || key,
    value: Math.max(0, Math.round(value)),
    color: CATEGORIES[key as Category]?.color || '#444',
  }));

  const classComparisonData = data.classStats
    .filter((c) => c.completedStudents > 0)
    .map((c) => ({
      name: c.className,
      value: c.averageCo2,
      completed: c.completedStudents,
    }))
    .sort((a, b) => a.value - b.value);

  return (
    <div className="min-h-screen flex flex-col justify-between pb-12 bg-background">
      {/* Minimal Sticky Header */}
      <header className="w-full border-b border-border bg-background sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/school"
              className="paper-btn-secondary text-xs"
              title="Zurück zur Klassenverwaltung"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Klassen</span>
            </Link>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs font-semibold text-foreground tracking-tight">
              Schulauswertung & Gesamtanalyse
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="paper-btn-secondary text-xs"
              title="Abmelden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6">
        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="paper-sheet p-4 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Teilnehmer:innen
            </span>
            <div className="text-2xl font-mono font-semibold text-foreground tracking-tight">
              {data.totalParticipants}
            </div>
            <span className="text-[11px] text-muted-foreground block">
              {data.totalCompleted} ausgefüllt
            </span>
          </div>

          <div className="paper-sheet p-4 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Ø Schulausstoß
            </span>
            <div className="text-2xl font-mono font-semibold text-foreground tracking-tight">
              {formatCO2(data.schoolAverage)}
            </div>
            <span className="text-[11px] text-muted-foreground block">
              pro Schüler:in / Jahr
            </span>
          </div>

          <div className="paper-sheet p-4 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              vs. Bundesschnitt
            </span>
            <div className="text-2xl font-mono font-semibold text-foreground tracking-tight">
              {belowAverage ? '-' : '+'}
              {formatCO2(Math.abs(data.schoolAverage - NATIONAL_AVERAGE_CO2))}
            </div>
            <span className="text-[11px] text-muted-foreground block">
              {belowAverage ? 'unter' : 'über'} Bundesdurchschnitt
            </span>
          </div>

          <div className="paper-sheet p-4 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Abschlussquote
            </span>
            <div className="text-2xl font-mono font-semibold text-foreground tracking-tight">
              {data.totalParticipants > 0
                ? Math.round((data.totalCompleted / data.totalParticipants) * 100)
                : 0}
              %
            </div>
            <div className="w-full h-1 bg-border rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{
                  width: `${
                    data.totalParticipants > 0
                      ? (data.totalCompleted / data.totalParticipants) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {data.totalCompleted === 0 ? (
          <div className="paper-sheet p-12 text-center space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Noch keine abgeschlossenen Schüler-Fragebögen
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Sobald Schüler:innen ihre Fragebögen abgeschlossen haben, erscheinen hier aggregierte Diagramme und Klassenvergleiche.
            </p>
          </div>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="paper-sheet p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Verteilung nach Bereichen (Schulweit)
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-mono">Anteile</span>
                </div>
                <SchoolCategoryPieChart data={categoryPieData} />
              </div>

              <div className="paper-sheet p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Klassen-Vergleich (Ø Jahresausstoß)
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-mono">kg CO₂</span>
                </div>
                {classComparisonData.length > 0 ? (
                  <SchoolClassBarChart data={classComparisonData} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-12">
                    Noch keine abgeschlossenen Klassen.
                  </p>
                )}
              </div>
            </div>

            {/* School Leaderboard Table */}
            <article className="paper-sheet p-6 space-y-4">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Ranking
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">
                    Klassen-Rangliste der Schule
                  </h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Sortiert nach geringstem Ø CO₂
                </span>
              </div>

              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {data.classStats
                  .sort((a, b) => {
                    if (a.completedStudents === 0 && b.completedStudents > 0) return 1;
                    if (b.completedStudents === 0 && a.completedStudents > 0) return -1;
                    return a.averageCo2 - b.averageCo2;
                  })
                  .map((cls, index) => {
                    const hasCompletions = cls.completedStudents > 0;
                    const rankMedal = index === 0 ? '1.' : index === 1 ? '2.' : index === 2 ? '3.' : `${index + 1}.`;

                    return (
                      <div
                        key={cls.id}
                        className="p-3.5 flex items-center justify-between text-xs bg-background hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-mono font-semibold text-xs text-muted-foreground">
                            {rankMedal}
                          </span>
                          <div>
                            <span className="text-foreground font-medium block">
                              {cls.className}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {cls.completedStudents} von {cls.totalStudents} Schüler:innen abgeschlossen
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono font-medium text-foreground">
                          {hasCompletions ? formatCO2(cls.averageCo2) : '---'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </article>

            {/* Didactic Classroom Guide */}
            <article className="paper-sheet p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Pädagogik
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  Didaktische Impulse für den Unterricht
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-lg border border-border bg-background space-y-1.5">
                  <span className="font-medium text-foreground block text-xs">
                    1. Ergebnisse reflektieren & diskutieren
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Vergleicht den Klassendurchschnitt mit dem bundesweiten Schnitt (10,8 t) und analysiert gemeinsam, in welchem Lebensbereich (Ernährung, Mobilität, Wohnen) die größten Hebel liegen.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-background space-y-1.5">
                  <span className="font-medium text-foreground block text-xs">
                    2. Schulweite Aktionswoche starten
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Ruft eine gemeinsame Aktion wie »Eine Woche Fahrrad statt Elterntaxi« oder einen saisonalen Aktionstag in der Schulmensa aus und berechnet die konkrete CO₂-Einsparung im Simulator.
                  </p>
                </div>
              </div>
            </article>
          </>
        )}
      </main>

      <LegalFooter />
    </div>
  );
}
