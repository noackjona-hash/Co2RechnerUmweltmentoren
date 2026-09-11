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
      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
        Diagramm lädt...
      </div>
    ),
  }
);
const SchoolClassBarChart = dynamic(
  () => import('@/components/analytics-charts').then((mod) => mod.SchoolClassBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
        Diagramm lädt...
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
        <p className="text-sm font-semibold text-muted-foreground">Statistiken werden geladen...</p>
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
    <div className="min-h-screen relative flex flex-col justify-between pb-12 selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border/80">
        <div className="flex items-center gap-3">
          <Link
            href="/school"
            className="p-1.5 rounded-lg paper-btn-secondary text-xs"
            title="Zurück zum Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-bold text-base text-foreground">Schulstatistiken</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="paper-card p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Teilnehmer</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {data.totalParticipants}
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {data.totalCompleted} abgeschlossen
            </span>
          </div>

          <div className="paper-card p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Ø Schulausstoß</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCO2(data.schoolAverage)}
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              pro Schüler:in / Jahr
            </span>
          </div>

          <div className="paper-card p-4">
            <div className="text-xs text-muted-foreground mb-1">
              vs. Bundesschnitt
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                belowAverage ? 'text-primary' : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {belowAverage ? '-' : '+'}
              {formatCO2(Math.abs(data.schoolAverage - NATIONAL_AVERAGE_CO2))}
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {belowAverage ? 'unter' : 'über'} Bundesdurchschnitt
            </span>
          </div>

          <div className="paper-card p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Abschlussquote
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {data.totalParticipants > 0
                ? Math.round((data.totalCompleted / data.totalParticipants) * 100)
                : 0}
              %
            </div>
            <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary"
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
          <div className="paper-card p-8 text-center text-xs text-muted-foreground">
            Noch keine Schülerdaten abgeschlossen.
          </div>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="paper-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Verteilung an der Schule
                </h3>
                <SchoolCategoryPieChart data={categoryPieData} />
              </div>

              <div className="paper-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Klassen-Vergleich (Ø Ausstoß)
                </h3>
                {classComparisonData.length > 0 ? (
                  <SchoolClassBarChart data={classComparisonData} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Noch keine abgeschlossenen Klassen.
                  </p>
                )}
              </div>
            </div>

            {/* School Leaderboard Table */}
            <div className="paper-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Klassen-Rangliste
                </h3>
              </div>

              <div className="space-y-2">
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
                        className="p-3 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold w-4">{index + 1}.</span>
                          <div>
                            <span className="font-bold text-foreground block">{cls.className}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {cls.completedStudents} / {cls.totalStudents} fertig
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono font-bold text-sm text-foreground">
                          {hasCompletions ? formatCO2(cls.averageCo2) : '---'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Didactic Teacher Guide */}
            <div className="paper-card p-6 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">
                  Didaktische Anregungen für den Unterricht
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                  <span className="font-bold text-foreground block">Ergebnisse reflektieren</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Vergleicht den Klassendurchschnitt mit dem bundesweiten Schnitt (9,1 t) und diskutiert die Ursachen.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                  <span className="font-bold text-foreground block">Aktionswoche</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Ruft eine Woche ohne Elterntaxi aus und prüft den Unterschied bei den Mobilitätswerten.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <LegalFooter />
    </div>
  );
}
