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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
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

export default function SchoolAnalyticsPage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Statistiken werden geladen...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const belowAverage = data.schoolAverage < NATIONAL_AVERAGE_CO2;

  // Category pie data
  const categoryPieData = Object.entries(data.schoolCategoryAverages).map(
    ([key, value]) => ({
      name: CATEGORIES[key as Category]?.label || key,
      value: Math.max(0, Math.round(value)),
      color: CATEGORIES[key as Category]?.color || '#888',
    })
  );

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
    <div className="min-h-screen relative pb-20">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 glass-strong border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/school"
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Schulstatistiken</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Teilnehmer</span>
            </div>
            <div className="text-2xl font-bold">{data.totalParticipants}</div>
            <div className="text-xs text-muted-foreground">
              {data.totalCompleted} abgeschlossen
            </div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Ø CO₂</span>
            </div>
            <div className="text-2xl font-bold gradient-text">
              {formatCO2(data.schoolAverage)}
            </div>
            <div className="text-xs text-muted-foreground">pro Schüler:in / Jahr</div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              {belowAverage ? (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-xs text-muted-foreground">vs. Durchschnitt</span>
            </div>
            <div
              className={`text-2xl font-bold ${
                belowAverage ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {belowAverage ? '-' : '+'}
              {formatCO2(Math.abs(data.schoolAverage - NATIONAL_AVERAGE_CO2))}
            </div>
            <div className="text-xs text-muted-foreground">
              {belowAverage ? 'unter' : 'über'} dem DE-Schnitt
            </div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                Abschlussrate
              </span>
            </div>
            <div className="text-2xl font-bold">
              {data.totalParticipants > 0
                ? Math.round(
                    (data.totalCompleted / data.totalParticipants) * 100
                  )
                : 0}
              %
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
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
          <div className="glass-strong rounded-3xl p-12 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Noch keine Daten</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sobald Schüler:innen das Quiz abgeschlossen haben, erscheinen hier
              die aggregierten Statistiken. Alle Daten sind vollständig
              anonymisiert.
            </p>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category breakdown */}
              <div
                className="glass-strong rounded-3xl p-6 animate-slide-up"
                style={{ animationDelay: '0.2s' }}
              >
                <h3 className="text-lg font-bold mb-4">
                  Durchschnittliche Verteilung
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        `${formatCO2(Number(value || 0))}`,
                        'Ø CO₂',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Class comparison */}
              <div
                className="glass-strong rounded-3xl p-6 animate-slide-up"
                style={{ animationDelay: '0.3s' }}
              >
                <h3 className="text-lg font-bold mb-4">
                  Vergleich nach Klassen
                </h3>
                {classComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={classComparisonData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: any) => [
                          `${formatCO2(Number(value || 0))}`,
                          'Ø CO₂',
                        ]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                        {classComparisonData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.value <= NATIONAL_AVERAGE_CO2
                                ? '#10b981'
                                : '#f59e0b'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-10">
                    Noch keine abgeschlossenen Klassen.
                  </p>
                )}
              </div>
            </div>

            {/* Category details */}
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              {Object.entries(data.schoolCategoryAverages).map(
                ([key, value]) => {
                  const cat = CATEGORIES[key as Category];
                  if (!cat) return null;
                  const totalCat = Object.values(
                    data.schoolCategoryAverages
                  ).reduce((s, v) => s + v, 0);
                  return (
                    <div key={key} className="glass-strong rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-sm font-semibold">
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatCO2(Math.max(0, value))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ø pro Schüler:in
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              totalCat > 0 ? (Math.max(0, value) / totalCat) * 100 : 0
                            }%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
            {/* School-wide Challenge Leaderboard for Teachers */}
            <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.45s' }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
                Schul-Challenge Leaderboard & Auszeichnungen
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Hier siehst du das aktuelle Ranking aller Klassen deiner Schule sowie deren freigeschaltete Abzeichen.
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
                        className="glass border border-border/40 hover:border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 glass shadow-inner">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm sm:text-base">{cls.className}</span>
                            </div>
                            {hasCompletions && cls.badges && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {cls.badges.filter((b: any) => b.unlocked).map((b: any) => (
                                  <span
                                    key={b.id}
                                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform cursor-help"
                                    title={`${b.title}: ${b.description}`}
                                  >
                                    {b.icon}
                                  </span>
                                ))}
                                {cls.badges.filter((b: any) => b.unlocked).length === 0 && (
                                  <span className="text-[10px] text-muted-foreground italic">Noch keine Abzeichen</span>
                                )}
                              </div>
                            )}
                            {!hasCompletions && (
                              <span className="text-[10px] text-muted-foreground italic mt-1 block">Keine ausgefüllten Fragebögen</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block text-right sm:text-left">
                              {cls.completedStudents} / {cls.totalStudents} abgeschlossen
                            </span>
                            <div className="w-28 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full gradient-primary"
                                style={{ width: `${cls.totalStudents > 0 ? (cls.completedStudents / cls.totalStudents) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0 min-w-[90px]">
                            <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">Ø CO₂</span>
                            <span className="font-mono font-bold text-sm sm:text-base text-foreground">
                              {hasCompletions ? formatCO2(cls.averageCo2) : '---'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Didactic Competition Guide for Teachers */}
            <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.48s' }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Didaktischer Leitfaden: Klima-Wettbewerb an der Schule
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Nutze diese Challenge, um Umweltschutz im Unterricht greifbar und lebendig zu gestalten. Hier sind erprobte Ideen für Umweltmentoren und Lehrkräfte:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 space-y-2">
                  <span className="text-lg">📈</span>
                  <h4 className="font-bold text-sm">Ergebnisse im Unterricht reflektieren</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Vergleiche den Durchschnitt der Schule mit dem bundesweiten Durchschnitt (9.1t). Diskutiert in Kleingruppen, warum bestimmte Sektoren (wie Heizung oder Ernährung) oft den größten Anteil ausmachen.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 space-y-2">
                  <span className="text-lg">🚲</span>
                  <h4 className="font-bold text-sm">Die "Verkehrswende-Woche" ausrufen</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Schaltet gemeinsam das Abzeichen <strong>Pedal-Pioniere</strong> frei! Ruft eine Woche aus, in der alle Schüler:innen versuchen, auf das Elterntaxi zu verzichten und stattdessen zu Fuß, mit dem Fahrrad oder Bus zu kommen.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 space-y-2">
                  <span className="text-lg">🎖️</span>
                  <h4 className="font-bold text-sm">Urkunden verleihen & Pledges einhalten</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Lass Schüler:innen ihre personalisierten Klima-Urkunden mit ihren Versprechen (Pledges) ausdrucken. Hängt die Urkunden oder die Abzeichen der Klasse im Klassenzimmer auf, um das Engagement sichtbar zu machen.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 space-y-2">
                  <span className="text-lg">🍎</span>
                  <h4 className="font-bold text-sm">Klimafreundliches Frühstück / Mensa-Tag</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Startet einen Versuchstag mit rein veganer/vegetarischer Verpflegung, um das Abzeichen <strong>Veggie-Helden</strong> freizuschalten. Berechnet danach die fiktiven Einsparungen pro Jahr für die ganze Klasse.
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="glass-strong rounded-2xl p-4 text-center text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '0.5s' }}>
              🔒 Alle Daten sind vollständig anonymisiert. Es werden keine
              individuellen Schüler:innen-Ergebnisse gespeichert oder angezeigt.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
