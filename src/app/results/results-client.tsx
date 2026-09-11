'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES,
  NATIONAL_AVERAGE_CO2,
  CLIMATE_TARGET_CO2,
  formatCO2,
  type Category,
} from '@/lib/utils';
import dynamic from 'next/dynamic';

const CategoryPieChart = dynamic(
  () => import('@/components/results-charts').then((mod) => mod.CategoryPieChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Diagramm wird vorbereitet...
      </div>
    ),
  }
);
const ComparisonBarChart = dynamic(
  () => import('@/components/results-charts').then((mod) => mod.ComparisonBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Diagramm wird vorbereitet...
      </div>
    ),
  }
);
const CategoryDetailBarChart = dynamic(
  () => import('@/components/results-charts').then((mod) => mod.CategoryDetailBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Diagramm wird vorbereitet...
      </div>
    ),
  }
);

import {
  Leaf,
  LogOut,
  Award,
  Sparkles,
  Printer,
  X,
  Trophy,
  Users,
  TreePine,
  Bike,
  Flame,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';
import { ParticleField } from '@/components/particle-field';

const CLIMATE_TIPS = [
  { emoji: '🚲', tip: 'Wenn du täglich 5 km mit dem Rad statt mit dem Auto fährst, sparst du über 300 kg CO₂ im Jahr!' },
  { emoji: '🥗', tip: 'Ein vegetarischer Tag pro Woche spart jährlich rund 350 kg CO₂ ein – super lecker und klimafreundlich.' },
  { emoji: '👕', tip: 'Lieblingskleidung länger tragen und Second-Hand kaufen spart wertvolles Wasser und schont das Klima.' },
  { emoji: '🌡️', tip: 'Heizung im Winter um 1-2 Grad senken und einen gemütlichen Pulli anziehen spart jede Menge Heizenergie.' },
  { emoji: '🌳', tip: 'Ein Baum nimmt etwa 12,5 kg CO₂ im Jahr auf. Jeder gesparte Kilo CO₂ schützt unsere Wälder!' },
  { emoji: '🚿', tip: '5 Minuten kürzer duschen spart 140 kg CO₂ und bis zu 12.000 Liter warmes Wasser pro Jahr.' },
  { emoji: '🍎', tip: 'Regionale Äpfel haben bis zu 80% weniger CO₂ im Gepäck als weit importierte Früchte.' },
];

interface ResultsData {
  totalCo2: number;
  categoryTotals: Record<string, number>;
  responses: any[];
  className: string;
  classAverage: number;
  classCategoryAverages: Record<string, number>;
  schoolAverage: number;
  schoolLeaderboard: {
    classId: string;
    className: string;
    averageCo2: number;
    completedCount: number;
    totalCount: number;
    badges: any[];
  }[];
  classBadges: any[];
}

export default function ResultsClient() {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'analysis' | 'simulator' | 'challenge'>('analysis');
  const [pledges, setPledges] = useState({
    vegetarian: false,
    vegan: false,
    bioRegional: false,
    activeTransit: false,
    noFlights: false,
    greenPower: false,
    lowerHeating: false,
    secondHand: false,
    digitalReduction: false,
  });
  const [studentName, setStudentName] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const router = useRouter();

  // Load pledges from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('co2rechner_pledges');
    if (saved) {
      try {
        setPledges(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save pledges
  useEffect(() => {
    if (results) {
      localStorage.setItem('co2rechner_pledges', JSON.stringify(pledges));
    }
  }, [pledges, results]);

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
    const duration = 1800;
    const steps = 45;
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

  // Confetti burst on load
  useEffect(() => {
    if (loading || !results) return;

    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class ConfettiPiece {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -60;
        this.size = Math.random() * 8 + 4;
        const colors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 + 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    const pieces: ConfettiPiece[] = Array.from({ length: 65 }, () => new ConfettiPiece());
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [loading, results]);

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
        <p className="font-bold text-base text-foreground">Ergebnisse werden berechnet...</p>
        <p className="text-xs text-muted-foreground mt-1">Einen Moment bitte!</p>
      </div>
    );
  }

  if (!results) return null;

  const { totalCo2, categoryTotals } = results;

  // Simulated values based on pledges
  const simulatedCategoryTotals = {
    mobility: categoryTotals.mobility || 0,
    food: categoryTotals.food || 0,
    energy: categoryTotals.energy || 0,
    consumption: categoryTotals.consumption || 0,
  };

  if (pledges.vegan) {
    simulatedCategoryTotals.food = Math.max(0, simulatedCategoryTotals.food - (categoryTotals.food || 0) * 0.45);
  } else if (pledges.vegetarian) {
    simulatedCategoryTotals.food = Math.max(0, simulatedCategoryTotals.food - (categoryTotals.food || 0) * 0.33);
  }
  if (pledges.bioRegional) {
    simulatedCategoryTotals.food = Math.max(0, simulatedCategoryTotals.food - (categoryTotals.food || 0) * 0.1);
  }

  if (pledges.activeTransit) {
    simulatedCategoryTotals.mobility = Math.max(0, simulatedCategoryTotals.mobility - (categoryTotals.mobility || 0) * 0.3);
  }
  if (pledges.noFlights) {
    simulatedCategoryTotals.mobility = Math.max(0, simulatedCategoryTotals.mobility - (categoryTotals.mobility || 0) * 0.5);
  }

  if (pledges.greenPower) {
    simulatedCategoryTotals.energy = Math.max(0, simulatedCategoryTotals.energy - 300);
  }
  if (pledges.lowerHeating) {
    simulatedCategoryTotals.energy = Math.max(0, simulatedCategoryTotals.energy - (categoryTotals.energy || 0) * 0.12);
  }

  if (pledges.secondHand) {
    simulatedCategoryTotals.consumption = Math.max(0, simulatedCategoryTotals.consumption - (categoryTotals.consumption || 0) * 0.4);
  }
  if (pledges.digitalReduction) {
    simulatedCategoryTotals.consumption = Math.max(0, simulatedCategoryTotals.consumption - (categoryTotals.consumption || 0) * 0.2);
  }

  const simulatedTotalCo2 = Object.values(simulatedCategoryTotals).reduce((sum, v) => sum + v, 0);
  const co2Saved = Math.max(0, totalCo2 - simulatedTotalCo2);
  const treesSaved = Math.round(co2Saved / 12.5);

  // Child-friendly Rating Badge
  const getRating = () => {
    if (totalCo2 <= CLIMATE_TARGET_CO2) {
      return {
        label: 'Vorbildlich!',
        emoji: '🌟',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
        desc: 'Fantastisch! Du bist bereits unter dem Pariser Klimaziel (2 Tonnen).',
      };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2 * 0.6) {
      return {
        label: 'Sehr gut!',
        emoji: '🌱',
        color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300',
        desc: 'Deutlich sparsamer als der deutsche Durchschnitt! Weiter so.',
      };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2 * 0.85) {
      return {
        label: 'Guter Kurs!',
        emoji: '🌿',
        color: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border-green-300',
        desc: 'Schon spürbar unter dem Bundesdurchschnitt.',
      };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2) {
      return {
        label: 'Im Mittelfeld',
        emoji: '⚖️',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
        desc: 'Im Bereich des deutschen Schnitts – mit einfachen Tricks kannst du viel bewirken!',
      };
    }
    return {
      label: 'Großes Spar-Potenzial!',
      emoji: '💡',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300',
      desc: 'Hier gibt es spannende Chancen zum CO₂-Sparen. Schau dir die Tipps an!',
    };
  };

  const rating = getRating();

  // Pie chart data
  const pieData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: CATEGORIES[key as Category]?.label || key,
    value: Math.max(0, Math.round(value)),
    color: CATEGORIES[key as Category]?.color || '#10b981',
  }));

  // Comparison bar data
  const comparisonData = [
    { name: 'Klimaziel', value: CLIMATE_TARGET_CO2, fill: '#10b981' },
    { name: 'Mit Versprechen', value: Math.round(simulatedTotalCo2), fill: '#06b6d4' },
    { name: 'Dein Ergebnis', value: Math.round(totalCo2), fill: totalCo2 <= NATIONAL_AVERAGE_CO2 ? '#10b981' : '#f59e0b' },
  ];

  if (results.classAverage > 0) {
    comparisonData.push({
      name: `Klasse ${results.className}`,
      value: results.classAverage,
      fill: '#8b5cf6',
    });
  }

  comparisonData.push({
    name: 'Durchschnitt DE',
    value: NATIONAL_AVERAGE_CO2,
    fill: '#64748b',
  });

  // Tips based on highest category
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  const highestCategory = sortedCategories[0]?.[0] as Category;

  const tips: Record<string, string[]> = {
    mobility: [
      '🚲 Fahre öfter mit dem Rad oder gehe zu Fuß zur Schule.',
      '🚌 Nutze Bus & Bahn statt dich mit dem Auto fahren zu lassen.',
      '🚄 Wähle im Urlaub für kürzere Reisen den Zug statt das Flugzeug.',
      '🛴 Bilde mit Freund:innen Lauf- oder Fahrrad-Gemeinschaften.',
    ],
    food: [
      '🥗 Lege jede Woche mindestens einen vegetarischen Tag ein.',
      '🍎 Kaufe Obst und Gemüse aus deiner Region und der aktuellen Saison.',
      '🍱 Nimm Reste in einer Dose mit zur Schule, statt Essen wegzuwerfen.',
      '🥛 Probiere leckere pflanzliche Drinks wie Hafer- oder Mandelmilch.',
    ],
    energy: [
      '🌡️ Drehe die Heizung im Zimmer 1-2 Grad runter und zieh einen Pulli an.',
      '🚿 Dusche kürzer (5 statt 10 Minuten) – das spart enorm viel warmes Wasser.',
      '💡 Schalte Licht und Spielkonsolen ganz aus, wenn du das Zimmer verlässt.',
      '☀️ Frage deine Eltern, ob ihr zu echtem Ökostrom wechseln könnt.',
    ],
    consumption: [
      '👕 Kaufe Kleidung öfter Second-Hand oder tausche mit Freund:innen.',
      '📱 Behalte Smartphone & Co. länger, statt jedes Jahr ein neues zu wollen.',
      '♻️ Trenne deinen Müll sorgfältig (Papier, Glas, Plastik, Bio).',
      '📚 Nutze die Schul- oder Stadtbibliothek statt alles neu zu kaufen.',
    ],
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative pb-16">
      <canvas id="confetti-canvas" className="pointer-events-none fixed inset-0 z-50 w-full h-full" />
      <ParticleField />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight block leading-tight text-foreground">
              CO₂ Rechner
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">
              Auswertung für Klasse {results.className || 'Schule'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all border border-border/60 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Abmelden
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-4 flex-1 w-full">
        {/* Celebration Banner & Score */}
        <div className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-lg text-center mb-8 animate-scale-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-3 shadow-xs">
            <span>🎉</span> Quiz erfolgreich abgeschlossen!
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-3">
            Dein Jahres-Fußabdruck
          </h1>

          {/* Big Score */}
          <div className="my-4">
            <span className="text-5xl sm:text-7xl font-black gradient-text font-mono tracking-tight">
              {formatCO2(animatedTotal)}
            </span>
            <span className="text-sm sm:text-base font-bold text-muted-foreground block mt-1">
              CO₂-Ausstoß pro Jahr
            </span>
          </div>

          {/* Rating Badge */}
          <div className="flex justify-center mt-3">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${rating.color}`}>
              <span className="text-lg">{rating.emoji}</span>
              <span className="font-extrabold text-sm">{rating.label}</span>
              <span className="text-xs opacity-90 hidden sm:inline">• {rating.desc}</span>
            </div>
          </div>
        </div>

        {/* 3 Relatable Real-World Comparisons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            {
              icon: <TreePine className="w-5 h-5 text-emerald-500" />,
              value: Math.round(totalCo2 / 12.5),
              label: 'Bäume nötig',
              sub: 'um dein CO₂ auszugleichen',
              bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40',
            },
            {
              icon: <Bike className="w-5 h-5 text-sky-500" />,
              value: `${(totalCo2 / 0.15 / 1000).toFixed(0)}k`,
              label: 'km Autofahrt',
              sub: 'als Fahrrad-Alternative',
              bg: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/40',
            },
            {
              icon: <Flame className="w-5 h-5 text-amber-500" />,
              value: Math.round(totalCo2 / 3.6),
              label: 'Burger',
              sub: 'entsprechende Mahlzeiten',
              bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-between ${item.bg}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center mb-2">
                {item.icon}
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-foreground block font-mono">
                  {item.value}
                </span>
                <span className="text-xs font-bold text-foreground block">{item.label}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <div className="bg-card p-1.5 rounded-2xl border border-border shadow-xs flex gap-1.5 max-w-lg w-full">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'analysis'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>Analyse</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Klima-Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'challenge'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Klassen-Challenge</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DEINE ANALYSE */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-fade-in">
            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie chart */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                <h3 className="text-base sm:text-lg font-bold mb-1 text-foreground">
                  Aufteilung nach Kategorien
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Wo entsteht dein meistes CO₂?</p>
                <CategoryPieChart data={pieData} />
              </div>

              {/* Comparison chart */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                <h3 className="text-base sm:text-lg font-bold mb-1 text-foreground">
                  Vergleich deines Werts
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Du im Vergleich zu Klasse, Bundesdurchschnitt und Klimaziel
                </p>
                <ComparisonBarChart data={comparisonData} />
              </div>
            </div>

            {/* 4 Category Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(categoryTotals).map(([key, value]) => {
                const cat = CATEGORIES[key as Category];
                if (!cat) return null;
                const percent = Math.round((Math.max(0, value) / Math.max(1, totalCo2)) * 100);
                return (
                  <div key={key} className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl select-none">{cat.icon}</span>
                      <span className="text-xs font-bold text-foreground">{cat.label}</span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-foreground font-mono">
                      {formatCO2(Math.max(0, value))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold mt-1">
                      <span>{percent}% vom Gesamtwert</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Personal Tips Box */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl">💡</span>
                <h3 className="text-lg font-bold text-foreground">
                  Konkrete Tipps für dich ({CATEGORIES[highestCategory]?.label})
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                In dieser Kategorie hast du deinen höchsten Ausstoß. Hier kannst du am schnellsten CO₂ einsparen:
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {tips[highestCategory]?.map((tip, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs sm:text-sm text-foreground flex items-start gap-2.5"
                  >
                    <span className="text-lg shrink-0">{tip.slice(0, 2)}</span>
                    <span className="leading-snug pt-0.5">{tip.slice(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KLIMA-SIMULATOR & URKUNDE */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Interaktiver Klima-Simulator
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Wähle Versprechen aus und beobachte, wie viele Bäume und wie viel CO₂ du sparst!
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (co2Saved === 0) {
                      alert('Wähle bitte mindestens ein Klima-Versprechen aus, um deine Urkunde zu erstellen!');
                      return;
                    }
                    setShowCertificate(true);
                  }}
                  className="px-5 py-3 rounded-2xl gradient-primary text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all btn-bounce cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <Award className="w-4.5 h-4.5" />
                  Urkunde erstellen 📜
                </button>
              </div>

              {/* Live Impact Header */}
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                    Deine mögliche Ersparnis
                  </span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    -{formatCO2(co2Saved)} pro Jahr
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
                  <span className="text-3xl select-none">🌳</span>
                  <div>
                    <span className="text-xl font-extrabold text-foreground font-mono block leading-tight">
                      {treesSaved} Bäume
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      gerettet durch deine Versprechen
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkbox pledges list */}
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    key: 'vegetarian',
                    icon: '🥗',
                    title: 'Vegetarischer Alltag',
                    desc: 'Spart rund 33% deiner Lebensmittel-Emissionen.',
                  },
                  {
                    key: 'vegan',
                    icon: '🌱',
                    title: 'Rein pflanzliche Ernährung',
                    desc: 'Spart rund 45% deiner Lebensmittel-Emissionen.',
                  },
                  {
                    key: 'bioRegional',
                    icon: '🍎',
                    title: 'Regional & Saisonal einkaufen',
                    desc: 'Spart ca. 10% der Lebensmittel-Emissionen.',
                  },
                  {
                    key: 'activeTransit',
                    icon: '🚲',
                    title: 'Schulweg mit Rad / zu Fuß',
                    desc: 'Spart rund 30% deiner alltäglichen Mobilitäts-Emissionen.',
                  },
                  {
                    key: 'noFlights',
                    icon: '🏖️',
                    title: 'Urlaub ohne Flugreisen',
                    desc: 'Vermeidet bis zu 50% deiner gesamten Mobilitäts-Emissionen.',
                  },
                  {
                    key: 'greenPower',
                    icon: '⚡',
                    title: 'Zuhause 100% Ökostrom nutzen',
                    desc: 'Reduziert den häuslichen Strom-Ausstoß um ca. 300 kg CO₂.',
                  },
                  {
                    key: 'lowerHeating',
                    icon: '🌡️',
                    title: 'Heizung um 1-2°C senken',
                    desc: 'Spart ca. 12% der gesamten Heizenergie im Winter.',
                  },
                  {
                    key: 'secondHand',
                    icon: '👕',
                    title: 'Kleidung Second-Hand bevorzugen',
                    desc: 'Spart bis zu 40% der jährlichen Konsum-Emissionen.',
                  },
                  {
                    key: 'digitalReduction',
                    icon: '📱',
                    title: 'Streaming & Bildschirmzeit drosseln',
                    desc: 'Spart rund 20% deiner digitalen Server-Emissionen.',
                  },
                ].map((item) => {
                  const isChecked = (pledges as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 btn-bounce ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/25 shadow-xs'
                          : 'border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-700/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setPledges((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                            ...(item.key === 'vegan' && e.target.checked ? { vegetarian: false } : {}),
                            ...(item.key === 'vegetarian' && e.target.checked ? { vegan: false } : {}),
                          }))
                        }
                        className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base select-none">{item.icon}</span>
                          <span className="font-bold text-xs sm:text-sm text-foreground">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHUL-CHALLENGE & KLASSEN-ABZEICHEN */}
        {activeTab === 'challenge' && (
          <div className="space-y-6 animate-fade-in">
            {/* Leaderboard Card */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    Schul-Challenge Rangliste
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Gemeinsam für den niedrigsten Klassendurchschnitt:
                  </p>
                </div>
                {results.className && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Deine Klasse: {results.className}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {results.schoolLeaderboard?.map((entry, index) => {
                  const isOwnClass = entry.className === results.className;
                  const rank = index + 1;
                  return (
                    <div
                      key={entry.classId}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                        isOwnClass
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center font-black text-sm text-foreground">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-foreground">
                              {entry.className}
                            </span>
                            {isOwnClass && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white uppercase">
                                Du
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground block">
                            {entry.completedCount} von {entry.totalCount} Schüler:innen fertig
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Ø Ausstoß
                        </span>
                        <span className="text-base sm:text-lg font-black font-mono text-foreground">
                          {entry.completedCount > 0 ? formatCO2(entry.averageCo2) : '---'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-1">
                Klassen-Abzeichen für Klasse {results.className}
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Schaltet gemeinsam durch klimabewusste Antworten Medaillen frei:
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.classBadges?.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      badge.unlocked
                        ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                        : 'border-border bg-card/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl select-none">{badge.icon}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          badge.unlocked
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {badge.unlocked ? 'Freigeschaltet 🎉' : 'Gesperrt 🔒'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground mb-0.5">{badge.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Printable Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="w-full max-w-2xl bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-2xl relative print:border-none print:shadow-none print:p-0">
            {/* Close button */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Config panel (hidden in print) */}
            <div className="mb-6 space-y-3 print:hidden">
              <h3 className="text-lg font-extrabold text-foreground">
                Deine persönliche Klimaschutz-Urkunde 📜
              </h3>
              <p className="text-xs text-muted-foreground">
                Tippe deinen Namen ein, um die Urkunde auszudrucken oder als PDF zu sichern:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Dein Vor- und Nachname"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-muted/50 border border-border text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-2xl gradient-primary text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Drucken / PDF
                </button>
              </div>
            </div>

            {/* Printable Certificate Design */}
            <div
              id="print-certificate"
              className="border-8 border-double border-emerald-600/40 rounded-3xl p-6 sm:p-10 text-center relative bg-white text-slate-900 print:border-8 print:p-8 print:text-black"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900 tracking-wide mb-1">
                KLIMASCHUTZ-URKUNDE
              </h2>
              <p className="text-xs italic text-slate-500 font-serif mb-6">
                Verliehen im Rahmen des Schul-CO₂-Rechners der Umweltmentoren
              </p>

              <div className="border-b-2 border-slate-300 max-w-sm mx-auto pb-1 mb-2">
                <span className="text-xl sm:text-2xl font-serif font-extrabold text-slate-800">
                  {studentName.trim() || '__________________________'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-serif mb-6">
                aus der Klasse <strong className="text-slate-800">{results.className || 'Schule'}</strong>
              </p>

              <p className="text-xs sm:text-sm font-serif text-slate-700 max-w-md mx-auto leading-relaxed mb-4">
                hat den persönlichen CO₂-Fußabdruck analysiert und ein Jahresergebnis von{' '}
                <strong className="text-emerald-800 font-sans">{formatCO2(totalCo2)}</strong> ermittelt.
              </p>

              {/* Selected pledges list */}
              <div className="bg-slate-50 rounded-2xl p-4 max-w-md mx-auto text-left mb-6 border border-slate-200">
                <span className="text-xs font-bold text-emerald-800 block mb-2 font-serif uppercase tracking-wider">
                  Mein persönliches Klima-Versprechen:
                </span>
                <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside font-sans">
                  {pledges.vegetarian && <li>Ich ernähre mich vegetarisch (weniger Fleischkonsum).</li>}
                  {pledges.vegan && <li>Ich ernähre mich vegan (rein pflanzlich).</li>}
                  {pledges.bioRegional && <li>Ich bevorzuge regionale & saisonale Lebensmittel.</li>}
                  {pledges.activeTransit && <li>Ich bewege mich umweltschonend mit Rad oder zu Fuß zur Schule.</li>}
                  {pledges.noFlights && <li>Ich verzichte auf Flugreisen im Urlaub.</li>}
                  {pledges.greenPower && <li>Ich setze mich zu Hause für echten Ökostrom ein.</li>}
                  {pledges.lowerHeating && <li>Ich helfe beim Energiesparen (Heizung um 1-2°C senken).</li>}
                  {pledges.secondHand && <li>Ich kaufe Kleidung bevorzugt Second-Hand.</li>}
                  {pledges.digitalReduction && <li>Ich nutze Streaming & Bildschirme bewusster.</li>}
                </ul>
              </div>

              <p className="text-xs text-slate-600 font-serif mb-8">
                Durch diese Einsparung werden jährlich prognostizierte{' '}
                <strong className="text-emerald-700 font-sans">-{formatCO2(co2Saved)} CO₂</strong> vermieden
                – das entspricht dem Ausgleich von ca.{' '}
                <strong className="text-emerald-700 font-sans">{treesSaved} Bäumen</strong>!
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4 max-w-md mx-auto text-[11px] font-serif text-slate-500">
                <div className="border-t border-slate-300 pt-1">Datum & Ort</div>
                <div className="border-t border-slate-300 pt-1">Unterschrift Lehrkraft / Mentor:in</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LegalFooter />
    </div>
  );
}
