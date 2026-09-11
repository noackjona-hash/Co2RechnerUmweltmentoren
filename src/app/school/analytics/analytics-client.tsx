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
      <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground animate-pulse">
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
      <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Diagramm lädt...
      </div>
    ),
  }
);

import {
  Leaf,
  LogOut,
  ArrowLeft,
  Users,
  TrendingDown,
  TrendingUp,
  Target,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';
import { ParticleField } from '@/components/particle-field';

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
        <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-4 text-emerald-600 animate-bounce">
          <Leaf className="w-7 h-7" />
        </div>
        <p className="font-bold text-base text-foreground">Schulstatistiken werden geladen...</p>
      </div>
    );
  }

  if (!data) return null;

  const belowAverage = data.schoolAverage < NATIONAL_AVERAGE_CO2;

  // Category pie data
  const categoryPieData = Object.entries(data.schoolCategoryAverages).map(([key, value]) => ({
    name: CATEGORIES[key as Category]?.label || key,
    value: Math.max(0, Math.round(value)),
    color: CATEGORIES[key as Category]?.color || '#10b981',
  }));

  // Class comparison data
  const classComparisonData = data.classStats
    .filter((c) => c.completedStudents > 0)
    .map((c) => ({
      name: c.className,
      value: c.averageCo2,
      completed: c.completedStudents,
    }))
    .sort((a, b) => a.value - b.value);

  return (
    <div className="min-h-screen relative flex flex-col justify-between pb-12">
      <ParticleField />

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/school"
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors btn-bounce"
              title="Zurück zum Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-base text-foreground">Schulstatistiken</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-scale-in">
          <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>Teilnehmer</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {data.totalParticipants}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {data.totalCompleted} abgeschlossen
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-muted-foreground">
              <Target className="w-3.5 h-3.5" />
              <span>Ø Schulausstoß</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black gradient-text font-mono">
              {formatCO2(data.schoolAverage)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">pro Kopf / Jahr</div>
          </div>

          <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-muted-foreground">
              {belowAverage ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>vs. Bundesdurchschnitt</span>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black font-mono ${
                belowAverage ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {belowAverage ? '-' : '+'}
              {formatCO2(Math.abs(data.schoolAverage - NATIONAL_AVERAGE_CO2))}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {belowAverage ? 'unter' : 'über'} dem DE-Schnitt
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-muted-foreground">
              <span>Abschlussrate</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {data.totalParticipants > 0
                ? Math.round((data.totalCompleted / data.totalParticipants) * 100)
                : 0}
              %
            </div>
            <div className="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-500"
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
          <div className="bg-card rounded-3xl p-12 text-center border border-border">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-foreground mb-1">Noch keine Daten verfügbar</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Sobald Schüler:innen das Quiz abgeschlossen haben, erscheinen hier die aggregierten
              Statistiken eurer Schule. Alle Daten sind 100% anonym.
            </p>
          </div>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-3xl p-6 border border-border shadow-xs">
                <h3 className="text-base font-bold text-foreground mb-1">
                  Durchschnittliche Verteilung
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Aufteilung nach Kategorien an eurer Schule
                </p>
                <SchoolCategoryPieChart data={categoryPieData} />
              </div>

              <div className="bg-card rounded-3xl p-6 border border-border shadow-xs">
                <h3 className="text-base font-bold text-foreground mb-1">
                  Vergleich nach Klassen
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Durchschnittlicher CO₂-Ausstoß je Klasse
                </p>
                {classComparisonData.length > 0 ? (
                  <SchoolClassBarChart data={classComparisonData} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-10">
                    Noch keine abgeschlossenen Klassen.
                  </p>
                )}
              </div>
            </div>

            {/* School Category Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(data.schoolCategoryAverages).map(([key, value]) => {
                const cat = CATEGORIES[key as Category];
                if (!cat) return null;
                const totalCat = Object.values(data.schoolCategoryAverages).reduce(
                  (s, v) => s + v,
                  0
                );
                const percent = totalCat > 0 ? Math.round((Math.max(0, value) / totalCat) * 100) : 0;
                return (
                  <div key={key} className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl select-none">{cat.icon}</span>
                      <span className="text-xs font-bold text-foreground">{cat.label}</span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-foreground font-mono">
                      {formatCO2(Math.max(0, value))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ø pro Schüler:in</p>
                    <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard for Teachers */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-foreground">
                  Schul-Challenge Rangliste & Auszeichnungen
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Aktuelles Ranking aller Klassen und deren freigeschaltete Abzeichen:
              </p>

              <div className="space-y-3">
                {data.classStats
                  .sort((a, b) => {
                    if (a.completedStudents === 0 && b.completedStudents > 0) return 1;
                    if (b.completedStudents === 0 && a.completedStudents > 0) return -1;
                    return a.averageCo2 - b.averageCo2;
                  })
                  .map((cls, index) => {
                    const hasCompletions = cls.completedStudents > 0;
                    const rank = index + 1;
                    return (
                      <div
                        key={cls.id}
                        className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center font-black text-sm text-foreground">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                          </span>
                          <div>
                            <span className="font-bold text-sm sm:text-base text-foreground block">
                              {cls.className}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {cls.completedStudents} von {cls.totalStudents} Schüler:innen fertig
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Ø Ausstoß
                          </span>
                          <span className="text-base sm:text-lg font-black font-mono text-foreground">
                            {hasCompletions ? formatCO2(cls.averageCo2) : '---'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Didactic Teacher Guide */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-foreground">
                  Didaktischer Leitfaden für den Unterricht
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Ideen und Aktionen, um die Ergebnisse im Klassenverband lebendig zu machen:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                  <span className="text-xl">📈</span>
                  <h4 className="font-bold text-sm text-foreground">
                    Ergebnisse im Unterricht reflektieren
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Vergleicht den Klassendurchschnitt mit dem bundesweiten Schnitt (9.1t) und
                    diskutiert in Gruppen, in welchen Bereichen die größten Einsparchancen liegen.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                  <span className="text-xl">🚲</span>
                  <h4 className="font-bold text-sm text-foreground">
                    Die &quot;Verkehrswende-Woche&quot; ausrufen
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Versucht gemeinsam eine Woche lang, das Elterntaxi stehenzulassen und zu Fuß, mit
                    dem Rad oder dem Bus zur Schule zu kommen.
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
