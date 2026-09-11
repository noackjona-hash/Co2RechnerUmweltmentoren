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
  Leaf,
  BarChart3,
  Sparkles,
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
      {/* Modern Sticky Header */}
      <header className="w-full border-b border-border/70 bg-card/75 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/school"
              className="paper-btn-secondary text-xs"
              title="Zurück zur Klassenverwaltung"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Klassenverwaltung</span>
            </Link>
            <span className="text-border">/</span>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-foreground tracking-tight">
                Schulauswertung & Gesamtanalyse
              </span>
            </div>
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6 animate-fade-in">
        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="paper-sheet p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Teilnehmer:innen
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {data.totalParticipants}
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {data.totalCompleted} Fragebögen fertig
              </span>
            </div>
          </div>

          <div className="paper-sheet p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Ø Schulausstoß
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {formatCO2(data.schoolAverage)}
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                pro Schüler:in / Jahr
              </span>
            </div>
          </div>

          <div className="paper-sheet p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                vs. Bundesschnitt
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                belowAverage
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {belowAverage ? '-' : '+'}
                {formatCO2(Math.abs(data.schoolAverage - NATIONAL_AVERAGE_CO2))}
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {belowAverage ? 'unter' : 'über'} Bundesdurchschnitt (10,8 t)
              </span>
            </div>
          </div>

          <div className="paper-sheet p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Abschlussquote
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {data.totalParticipants > 0
                  ? Math.round((data.totalCompleted / data.totalParticipants) * 100)
                  : 0}
                %
              </div>
              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
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
        </div>

        {data.totalCompleted === 0 ? (
          <div className="paper-sheet p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6" />
            </div>
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
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Verteilung nach Bereichen (Schulweit)
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Anteile</span>
                </div>
                <SchoolCategoryPieChart data={categoryPieData} />
              </div>

              <div className="paper-sheet p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Klassen-Vergleich (Ø Jahresausstoß)
                  </h3>
                  <span className="text-[11px] text-muted-foreground">kg CO₂</span>
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
              <div className="border-b border-border/70 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Ranking
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    Klassen-Rangliste der Schule
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  Sortiert nach geringstem Ø CO₂
                </span>
              </div>

              <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden">
                {data.classStats
                  .sort((a, b) => {
                    if (a.completedStudents === 0 && b.completedStudents > 0) return 1;
                    if (b.completedStudents === 0 && a.completedStudents > 0) return -1;
                    return a.averageCo2 - b.averageCo2;
                  })
                  .map((cls, index) => {
                    const hasCompletions = cls.completedStudents > 0;
                    const rankMedal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

                    return (
                      <div
                        key={cls.id}
                        className="p-3.5 flex items-center justify-between text-xs bg-card hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-bold text-sm">
                            {rankMedal}
                          </span>
                          <div>
                            <span className="text-foreground font-semibold block">
                              {cls.className}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {cls.completedStudents} von {cls.totalStudents} Schüler:innen abgeschlossen
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-bold text-foreground">
                          {hasCompletions ? formatCO2(cls.averageCo2) : '---'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </article>

            {/* Didactic Classroom Guide */}
            <article className="paper-sheet p-6 space-y-4">
              <div className="border-b border-border/70 pb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Didaktische Impulse für den Unterricht
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-xl border border-border/80 bg-stone-50/50 dark:bg-stone-900/20 space-y-1.5">
                  <span className="font-semibold text-foreground block text-xs">
                    1. Ergebnisse reflektieren & diskutieren
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Vergleicht den Klassendurchschnitt mit dem bundesweiten Schnitt (10,8 t) und analysiert gemeinsam, in welchem Lebensbereich (Ernährung, Mobilität, Wohnen) die größten Hebel liegen.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-stone-50/50 dark:bg-stone-900/20 space-y-1.5">
                  <span className="font-semibold text-foreground block text-xs">
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
