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
  Users,
  Target,
  Trophy,
  BookOpen,
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
      {/* Editorial Header */}
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Link
              href="/school"
              className="paper-btn-secondary text-xs"
              title="Zurück zum Dashboard"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Zurück zum Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-semibold text-foreground">Schulauswertung</span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="paper-btn-secondary text-xs"
              title="Abmelden"
            >
              <LogOut className="w-3 h-3" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6">
        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="paper-sheet p-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              Teilnehmer
            </span>
            <div className="text-2xl font-semibold text-foreground">
              {data.totalParticipants}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">
              {data.totalCompleted} abgeschlossen
            </span>
          </div>

          <div className="paper-sheet p-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              Ø Schulausstoß
            </span>
            <div className="text-2xl font-semibold text-foreground">
              {formatCO2(data.schoolAverage)}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">
              pro Schüler:in / Jahr
            </span>
          </div>

          <div className="paper-sheet p-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              vs. Bundesschnitt
            </span>
            <div className="text-2xl font-semibold text-foreground">
              {belowAverage ? '-' : '+'}
              {formatCO2(Math.abs(data.schoolAverage - NATIONAL_AVERAGE_CO2))}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">
              {belowAverage ? 'unter' : 'über'} Bundesdurchschnitt
            </span>
          </div>

          <div className="paper-sheet p-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              Abschlussquote
            </span>
            <div className="text-2xl font-semibold text-foreground">
              {data.totalParticipants > 0
                ? Math.round((data.totalCompleted / data.totalParticipants) * 100)
                : 0}
              %
            </div>
            <div className="w-full h-1 bg-border mt-2 overflow-hidden">
              <div
                className="h-full bg-foreground"
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
          <div className="paper-sheet p-10 text-center font-mono text-xs text-muted-foreground">
            Noch keine Schülerdaten abgeschlossen.
          </div>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="paper-sheet p-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Verteilung nach Bereichen (Schule)
                </h3>
                <SchoolCategoryPieChart data={categoryPieData} />
              </div>

              <div className="paper-sheet p-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Klassen-Vergleich (Ø Ausstoß)
                </h3>
                {classComparisonData.length > 0 ? (
                  <SchoolClassBarChart data={classComparisonData} />
                ) : (
                  <p className="font-mono text-xs text-muted-foreground text-center py-8">
                    Noch keine abgeschlossenen Klassen.
                  </p>
                )}
              </div>
            </div>

            {/* School Leaderboard Table */}
            <article className="paper-sheet p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground block">
                  Ranking
                </span>
                <h3 className="text-base font-serif font-normal text-foreground">
                  Klassen-Rangliste der Schule
                </h3>
              </div>

              <div className="divide-y divide-border border border-border">
                {data.classStats
                  .sort((a, b) => {
                    if (a.completedStudents === 0 && b.completedStudents > 0) return 1;
                    if (b.completedStudents === 0 && a.completedStudents > 0) return -1;
                    return a.averageCo2 - b.averageCo2;
                  })
                  .map((cls, index) => {
                    const hasCompletions = cls.completedStudents > 0;
                    return (
                      <div
                        key={cls.id}
                        className="p-3.5 flex items-center justify-between font-mono text-xs bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-muted-foreground">{index + 1}.</span>
                          <div>
                            <span className="text-foreground block">{cls.className}</span>
                            <span className="text-[11px] text-muted-foreground font-sans block">
                              {cls.completedStudents} / {cls.totalStudents} abgeschlossen
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-semibold text-foreground">
                          {hasCompletions ? formatCO2(cls.averageCo2) : '---'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </article>

            {/* Didactic Teacher Guide */}
            <article className="paper-sheet p-6 space-y-3">
              <div className="border-b border-border pb-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground block">
                  Unterricht
                </span>
                <h3 className="text-base font-serif font-normal text-foreground">
                  Didaktische Anregungen für den Unterricht
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs font-sans">
                <div className="p-3 border border-border bg-muted/20 space-y-1">
                  <span className="font-mono font-semibold text-foreground text-[11px] uppercase tracking-wider block">
                    Ergebnisse reflektieren
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Vergleicht den Klassendurchschnitt mit dem bundesweiten Schnitt (10,8 t) und diskutiert die Ursachen im Unterricht.
                  </p>
                </div>
                <div className="p-3 border border-border bg-muted/20 space-y-1">
                  <span className="font-mono font-semibold text-foreground text-[11px] uppercase tracking-wider block">
                    Aktionswoche starten
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Ruft eine Woche ohne Elterntaxi aus oder führt einen fleischfreien Schultag durch und analysiert den Effekt.
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
