'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES,
  NATIONAL_AVERAGE_CO2,
  CLIMATE_TARGET_CO2,
  formatCO2,
  type Category,
} from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Leaf, TrendingDown, TrendingUp, Minus, LogOut, RefreshCw, Award } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface ResultsData {
  totalCo2: number;
  categoryTotals: Record<string, number>;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/results');
        const data = await res.json();
        setResults(data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  // Animate the total counter
  useEffect(() => {
    if (!results) return;
    const target = results.totalCo2;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedTotal(target);
        clearInterval(timer);
      } else {
        setAnimatedTotal(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [results]);

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
          <p className="text-muted-foreground">Ergebnisse werden geladen...</p>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const { totalCo2, categoryTotals } = results;

  // Rating
  const getRating = () => {
    if (totalCo2 <= CLIMATE_TARGET_CO2)
      return { label: 'Ausgezeichnet!', color: 'text-emerald-500', icon: <Award className="w-6 h-6" />, emoji: '🌟', desc: 'Du bist unter dem Klimaziel!' };
    if (totalCo2 <= NATIONAL_AVERAGE_CO2 * 0.6)
      return { label: 'Sehr gut!', color: 'text-green-500', icon: <TrendingDown className="w-6 h-6" />, emoji: '🟢', desc: 'Deutlich unter dem Durchschnitt.' };
    if (totalCo2 <= NATIONAL_AVERAGE_CO2 * 0.85)
      return { label: 'Gut', color: 'text-lime-500', icon: <TrendingDown className="w-6 h-6" />, emoji: '🟡', desc: 'Unter dem Durchschnitt.' };
    if (totalCo2 <= NATIONAL_AVERAGE_CO2)
      return { label: 'Durchschnittlich', color: 'text-amber-500', icon: <Minus className="w-6 h-6" />, emoji: '🟠', desc: 'Im Bereich des deutschen Durchschnitts.' };
    return { label: 'Verbesserungsbedürftig', color: 'text-red-500', icon: <TrendingUp className="w-6 h-6" />, emoji: '🔴', desc: 'Über dem Durchschnitt.' };
  };

  const rating = getRating();

  // Pie chart data
  const pieData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: CATEGORIES[key as Category]?.label || key,
    value: Math.max(0, Math.round(value)),
    color: CATEGORIES[key as Category]?.color || '#888',
  }));

  // Comparison bar data
  const comparisonData = [
    {
      name: 'Klimaziel',
      value: CLIMATE_TARGET_CO2,
      fill: '#22c55e',
    },
    {
      name: 'Dein Ergebnis',
      value: Math.round(totalCo2),
      fill: totalCo2 <= NATIONAL_AVERAGE_CO2 ? '#10b981' : '#f59e0b',
    },
    {
      name: 'Durchschnitt DE',
      value: NATIONAL_AVERAGE_CO2,
      fill: '#64748b',
    },
  ];

  // Category breakdown for bar chart
  const categoryBarData = Object.entries(categoryTotals).map(
    ([key, value]) => ({
      name: CATEGORIES[key as Category]?.label || key,
      value: Math.max(0, Math.round(value)),
      fill: CATEGORIES[key as Category]?.color || '#888',
    })
  );

  // Tips based on highest category
  const sortedCategories = Object.entries(categoryTotals).sort(
    ([, a], [, b]) => b - a
  );
  const highestCategory = sortedCategories[0]?.[0] as Category;

  const tips: Record<string, string[]> = {
    mobility: [
      '🚲 Fahre öfter mit dem Fahrrad oder gehe zu Fuß.',
      '🚌 Nutze öffentliche Verkehrsmittel statt dem Auto.',
      '✈️ Vermeide Kurzstreckenflüge – nimm den Zug!',
      '🚗 Bilde Fahrgemeinschaften mit Freunden.',
    ],
    food: [
      '🥬 Reduziere Fleischkonsum, besonders Rindfleisch.',
      '🌽 Kaufe saisonale und regionale Produkte.',
      '♻️ Wirf weniger Lebensmittel weg.',
      '🥛 Probiere pflanzliche Milchalternativen.',
    ],
    energy: [
      '🌡️ Drehe die Heizung 1-2 Grad runter.',
      '🚿 Dusche kürzer (5 statt 10 Minuten).',
      '💡 Schalte Geräte komplett aus statt Standby.',
      '☀️ Frage nach Ökostrom für euer Zuhause.',
    ],
    consumption: [
      '👕 Kaufe weniger Fast Fashion, mehr Second-Hand.',
      '📱 Benutze Geräte länger statt ständig neu zu kaufen.',
      '♻️ Trenne deinen Müll sorgfältig.',
      '📦 Bestelle weniger online – kaufe lokal.',
    ],
  };

  return (
    <div className="min-h-screen relative pb-20">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">
            CO<span className="text-[10px] align-super">2</span> Ergebnisse
          </span>
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
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero score */}
        <div className="text-center animate-slide-up">
          <p className="text-sm text-muted-foreground mb-2">
            Dein jährlicher CO₂-Fußabdruck
          </p>
          <div className="relative inline-block">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black gradient-text">
              {formatCO2(animatedTotal)}
            </h1>
            <span className="block text-lg text-muted-foreground mt-1">
              CO₂ pro Jahr
            </span>
          </div>

          {/* Rating */}
          <div
            className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl glass ${rating.color}`}
          >
            <span className="text-xl">{rating.emoji}</span>
            <div className="text-left">
              <span className="text-sm font-bold">{rating.label}</span>
              <p className="text-xs text-muted-foreground">{rating.desc}</p>
            </div>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div
            className="glass-strong rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <h3 className="text-lg font-bold mb-4">Aufteilung nach Kategorien</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
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
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${formatCO2(Number(value || 0))}`, 'CO₂']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison chart */}
          <div
            className="glass-strong rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <h3 className="text-lg font-bold mb-4">Vergleich</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: any) => [`${formatCO2(Number(value || 0))}`, 'CO₂']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={30}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div
          className="glass-strong rounded-3xl p-6 animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <h3 className="text-lg font-bold mb-4">
            Detailansicht nach Kategorien
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryBarData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any) => [`${formatCO2(Number(value || 0))}`, 'CO₂']}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                {categoryBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category detail cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          {Object.entries(categoryTotals).map(([key, value]) => {
            const cat = CATEGORIES[key as Category];
            if (!cat) return null;
            return (
              <div key={key} className="glass-strong rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-semibold">{cat.label}</span>
                </div>
                <p className="text-2xl font-bold">{formatCO2(Math.max(0, value))}</p>
                <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (Math.max(0, value) / totalCo2) * 100)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div
          className="glass-strong rounded-3xl p-6 animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          <h3 className="text-lg font-bold mb-1">
            💡 Tipps für dich
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Basierend auf deiner höchsten Kategorie:{' '}
            <span className="font-semibold">
              {CATEGORIES[highestCategory]?.label}
            </span>
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {tips[highestCategory]?.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-lg">{tip.slice(0, 2)}</span>
                <span className="text-sm">{tip.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-muted/50 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
