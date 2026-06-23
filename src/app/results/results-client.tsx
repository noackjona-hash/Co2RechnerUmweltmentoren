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
  { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center text-muted-foreground animate-pulse">Diagramm lädt...</div> }
);
const ComparisonBarChart = dynamic(
  () => import('@/components/results-charts').then((mod) => mod.ComparisonBarChart),
  { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center text-muted-foreground animate-pulse">Diagramm lädt...</div> }
);
const CategoryDetailBarChart = dynamic(
  () => import('@/components/results-charts').then((mod) => mod.CategoryDetailBarChart),
  { ssr: false, loading: () => <div className="h-[200px] flex items-center justify-center text-muted-foreground animate-pulse">Diagramm lädt...</div> }
);
import { Leaf, TrendingDown, TrendingUp, Minus, LogOut, RefreshCw, Award, Sparkles, Printer, X, Trophy, Users, TreePine, Car, Flame } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';
import { TiltCard } from '@/components/tilt-card';
import { MagneticButton } from '@/components/magnetic-button';

const CLIMATE_TIPS = [
  { emoji: '✈️', tip: 'Wusstest du, dass ein einziger Langstreckenflug nach New York und zurück ca. 3,8 Tonnen CO₂ verursacht? Das ist fast so viel wie das Klimaziel für ein ganzes Jahr!' },
  { emoji: '🥩', tip: '1 kg Rindfleisch erzeugt so viel CO₂ wie 65 km Autofahrt. Schon ein fleischfreier Tag pro Woche spart jährlich ca. 350 kg CO₂.' },
  { emoji: '🚗', tip: 'Ein durchschnittlicher PKW stößt ca. 150 g CO₂ pro Kilometer aus. Wer täglich 10 km Rad statt Auto fährt, spart über 500 kg CO₂ pro Jahr.' },
  { emoji: '👕', tip: 'Die Modeindustrie verursacht mehr CO₂ als alle internationalen Flüge und Schifffahrten zusammen. Second-Hand-Shopping ist echte Klimahilfe!' },
  { emoji: '🌡️', tip: 'Jedes Grad weniger Raumtemperatur spart ca. 6% Heizenergie. Ein Pullover statt 22°C kann jährlich über 300 kg CO₂ einsparen.' },
  { emoji: '📱', tip: 'Die weltweiten Rechenzentren verbrauchen mehr Strom als ganz Großbritannien. Weniger Streaming = weniger CO₂.' },
  { emoji: '🌳', tip: 'Ein ausgewachsener Baum bindet ca. 12,5 kg CO₂ pro Jahr. Um den deutschen Durchschnitt auszugleichen, bräuchtest du über 700 Bäume!' },
  { emoji: '🚿', tip: '5 Minuten kürzer duschen spart pro Jahr ca. 140 kg CO₂ – und 12.000 Liter Wasser.' },
  { emoji: '🍎', tip: 'Regionale Äpfel aus Deutschland verursachen bis zu 80% weniger CO₂ als importierte Äpfel aus Neuseeland.' },
  { emoji: '💡', tip: 'LED-Lampen verbrauchen 80% weniger Strom als Glühbirnen. Ein kompletter Umstieg spart ca. 50 kg CO₂ pro Jahr.' },
  { emoji: '🥛', tip: 'Hafermilch verursacht nur ca. 0,3 kg CO₂ pro Liter – Kuhmilch dagegen ca. 1,4 kg. Das ist fast 5x so viel!' },
  { emoji: '📦', tip: 'Online-Bestellungen mit Rücksendung verdreifachen den CO₂-Ausstoß eines Einkaufs. Lieber einmal richtig kaufen!' },
  { emoji: '🔋', tip: 'Ökostrom reduziert den CO₂-Ausstoß deines Haushalts um bis zu 90%. Ein Wechsel ist oft kostenlos und dauert nur 5 Minuten.' },
  { emoji: '🧊', tip: 'Ein voll beladener Kühlschrank verbraucht weniger Strom als ein leerer, da die Lebensmittel die Kälte speichern.' },
  { emoji: '🌍', tip: 'Wenn alle Deutschen ihren CO₂-Ausstoß auf 2 Tonnen pro Jahr senken würden, könnten wir das Pariser Klimaziel erreichen.' },
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
  const [activeTab, setActiveTab] = useState<'analysis' | 'challenge' | 'badges'>('analysis');
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
        console.error(e);
      }
    }
  }, []);

  // Save pledges to localStorage
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

  // Celebrate with Confetti on complete
  useEffect(() => {
    if (loading || !results) return;

    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class ConfettiParticle {
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
        this.y = Math.random() * -100 - 10;
        this.size = Math.random() * 8 + 5;
        
        const colors = [
          '#10b981', // emerald
          '#06b6d4', // cyan
          '#f59e0b', // amber
          '#8b5cf6', // purple
          '#ec4899', // pink
          '#3b82f6', // blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
          this.speedY = Math.random() * 5 + 3;
        }
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

    const particles: ConfettiParticle[] = [];
    const maxParticles = 120;
    
    for (let i = 0; i < maxParticles; i++) {
      const p = new ConfettiParticle();
      p.y = Math.random() * canvas.height - canvas.height;
      particles.push(p);
    }

    class BurstParticle extends ConfettiParticle {
      constructor(fromLeft: boolean) {
        super();
        this.x = fromLeft ? 0 : canvas.width;
        this.y = canvas.height * 0.8;
        this.speedX = fromLeft ? Math.random() * 15 + 5 : Math.random() * -15 - 5;
        this.speedY = Math.random() * -20 - 5;
      }
      
      update() {
        super.update();
        this.speedY += 0.3; // add gravity to burst particles
      }
    }
    
    const burstCount = 50;
    for (let i = 0; i < burstCount; i++) {
      particles.push(new BurstParticle(true));
      particles.push(new BurstParticle(false));
    }

    let animationFrameId: number;
    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animateConfetti);
    };

    animateConfetti();

    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 6000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [loading, results]);

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

  // Calculate simulated values based on selected pledges
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
    simulatedCategoryTotals.food = Math.max(0, simulatedCategoryTotals.food - (categoryTotals.food || 0) * 0.10);
  }

  if (pledges.activeTransit) {
    simulatedCategoryTotals.mobility = Math.max(0, simulatedCategoryTotals.mobility - (categoryTotals.mobility || 0) * 0.30);
  }
  if (pledges.noFlights) {
    simulatedCategoryTotals.mobility = Math.max(0, simulatedCategoryTotals.mobility - (categoryTotals.mobility || 0) * 0.50);
  }

  if (pledges.greenPower) {
    simulatedCategoryTotals.energy = Math.max(0, simulatedCategoryTotals.energy - 300);
  }
  if (pledges.lowerHeating) {
    simulatedCategoryTotals.energy = Math.max(0, simulatedCategoryTotals.energy - (categoryTotals.energy || 0) * 0.12);
  }

  if (pledges.secondHand) {
    simulatedCategoryTotals.consumption = Math.max(0, simulatedCategoryTotals.consumption - (categoryTotals.consumption || 0) * 0.40);
  }
  if (pledges.digitalReduction) {
    simulatedCategoryTotals.consumption = Math.max(0, simulatedCategoryTotals.consumption - (categoryTotals.consumption || 0) * 0.20);
  }

  const simulatedTotalCo2 = Object.values(simulatedCategoryTotals).reduce((sum, v) => sum + v, 0);
  const co2Saved = Math.max(0, totalCo2 - simulatedTotalCo2);
  const treesSaved = Math.round(co2Saved / 12.5); // 1 tree absorbs ~12.5kg CO2/year

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
      fill: '#10b981',
    },
    {
      name: 'Mit Versprechen',
      value: Math.round(simulatedTotalCo2),
      fill: '#06b6d4',
    },
    {
      name: 'Dein Ergebnis',
      value: Math.round(totalCo2),
      fill: totalCo2 <= NATIONAL_AVERAGE_CO2 ? '#14b8a6' : '#f59e0b',
    },
  ];

  if (results && results.classAverage > 0) {
    comparisonData.push({
      name: `Klasse ${results.className}`,
      value: results.classAverage,
      fill: '#8b5cf6',
    });
  }

  if (results && results.schoolAverage > 0) {
    comparisonData.push({
      name: 'Schule Ø',
      value: results.schoolAverage,
      fill: '#ec4899',
    });
  }

  comparisonData.push({
    name: 'Durchschnitt DE',
    value: NATIONAL_AVERAGE_CO2,
    fill: '#64748b',
  });


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
    <div className="min-h-screen relative pb-20 flex flex-col justify-between">
      {/* Confetti Canvas */}
      <canvas
        id="confetti-canvas"
        className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      />

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto w-full">
        <MagneticButton as="div" className="flex items-center gap-2 cursor-default" strength={5}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">
            CO<span className="text-[10px] align-super">2</span> Ergebnisse
          </span>
        </MagneticButton>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MagneticButton
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground cursor-pointer"
            strength={6}
          >
            <LogOut className="w-4 h-4" />
          </MagneticButton>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero score */}
        <div className="text-center animate-slide-up">
          <p className="text-sm text-muted-foreground mb-2">
            Dein jährlicher CO₂-Fußabdruck
          </p>
          <div className="relative inline-block">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black gradient-text text-glow">
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

        {/* CO₂ Equivalents */}
        <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {[
            {
              icon: <TreePine className="w-5 h-5" />,
              value: Math.round(totalCo2 / 12.5),
              label: 'Bäume nötig',
              desc: 'für 1 Jahr Kompensation',
              gradient: 'from-emerald-500 to-green-600',
              shadow: 'shadow-emerald-500/10',
            },
            {
              icon: <Car className="w-5 h-5" />,
              value: `${(totalCo2 / 0.15 / 1000).toFixed(0)}k`,
              label: 'km Autofahrt',
              desc: 'entsprechende Strecke',
              gradient: 'from-blue-500 to-cyan-500',
              shadow: 'shadow-blue-500/10',
            },
            {
              icon: <Flame className="w-5 h-5" />,
              value: Math.round(totalCo2 / 3.6),
              label: 'Cheeseburger',
              desc: 'gleicher CO₂-Ausstoß',
              gradient: 'from-orange-500 to-red-500',
              shadow: 'shadow-orange-500/10',
            },
          ].map((eq) => (
            <TiltCard key={eq.label} className="rounded-2xl" intensity={12} scale={1.04}>
              <div className="glass-strong rounded-2xl p-4 text-center h-full">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${eq.gradient} flex items-center justify-center mx-auto mb-2 text-white shadow-lg ${eq.shadow}`}>
                  {eq.icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold">{eq.value}</div>
                <div className="text-xs font-semibold">{eq.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{eq.desc}</div>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Daily Climate Tip */}
        {(() => {
          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
          const tipIndex = dayOfYear % CLIMATE_TIPS.length;
          const tip = CLIMATE_TIPS[tipIndex];
          return (
            <TiltCard className="rounded-2xl shadow-lg animate-slide-up" intensity={4} scale={1.01}>
              <div className="glass-strong rounded-2xl p-5 border border-white/20 dark:border-white/10 relative overflow-hidden" style={{ animationDelay: '0.08s' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Klima-Tipp des Tages</h4>
                    <p className="text-sm leading-relaxed">
                      <span className="mr-1">{tip.emoji}</span>
                      {tip.tip}
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          );
        })()}

        {/* Tab Switcher */}
        <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass p-1.5 rounded-2xl flex gap-2 max-w-lg w-full shadow-lg shadow-emerald-500/5">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'analysis'
                  ? 'gradient-primary text-white shadow-md shadow-emerald-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Deine Analyse
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'challenge'
                  ? 'gradient-primary text-white shadow-md shadow-emerald-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Schul-Challenge
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'badges'
                  ? 'gradient-primary text-white shadow-md shadow-emerald-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Klassen-Abzeichen
            </button>
          </div>
        </div>

        {/* Tab 1: Deine Analyse */}
        {activeTab === 'analysis' && (
          <>
            {/* Charts grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie chart */}
              <TiltCard className="rounded-3xl shadow-xl animate-slide-up" intensity={4} scale={1.01}>
                <div
                  className="glass-strong rounded-3xl p-6 h-full"
                  style={{ animationDelay: '0.2s' }}
                >
                  <h3 className="text-lg font-bold mb-4">Aufteilung nach Kategorien</h3>
                  <CategoryPieChart data={pieData} />
                </div>
              </TiltCard>

              {/* Comparison chart */}
              <TiltCard className="rounded-3xl shadow-xl animate-slide-up" intensity={4} scale={1.01}>
                <div
                  className="glass-strong rounded-3xl p-6 h-full"
                  style={{ animationDelay: '0.3s' }}
                >
                  <h3 className="text-lg font-bold mb-4">Vergleich</h3>
                  <ComparisonBarChart data={comparisonData} />
                </div>
              </TiltCard>
            </div>

            {/* Category breakdown */}
            <div
              className="glass-strong rounded-3xl p-6 animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              <h3 className="text-lg font-bold mb-4">
                Detailansicht nach Kategorien
              </h3>
              <CategoryDetailBarChart data={categoryBarData} />
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

            {/* Interactive Climate Simulator */}
            <div
              className="glass-strong rounded-3xl p-6 sm:p-8 shadow-xl animate-slide-up"
              style={{ animationDelay: '0.55s' }}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                  Interaktiver Klima-Simulator
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Wähle Versprechen aus, um zu simulieren, wie sich dein CO₂-Fußabdruck verringern würde.
                </p>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                {/* Left checkboxes: 3/5 width */}
                <div className="md:col-span-3 space-y-4">
                  {/* Category: Ernährung */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                      🥬 Ernährung
                    </h4>
                    <div className="grid gap-2">
                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.vegetarian ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.vegetarian}
                          onChange={(e) => setPledges(prev => ({
                            ...prev,
                            vegetarian: e.target.checked,
                            vegan: e.target.checked ? false : prev.vegan
                          }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Ich ernähre mich vegetarisch</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Spart ca. 33% der CO₂-Emissionen bei der Ernährung ein.</p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.vegan ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.vegan}
                          onChange={(e) => setPledges(prev => ({
                            ...prev,
                            vegan: e.target.checked,
                            vegetarian: e.target.checked ? false : prev.vegetarian
                          }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Ich ernähre mich vegan</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Spart ca. 45% der CO₂-Emissionen bei der Ernährung ein.</p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.bioRegional ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.bioRegional}
                          onChange={(e) => setPledges(prev => ({ ...prev, bioRegional: e.target.checked }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Regionale & saisonale Lebensmittel</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Spart ca. 10% der CO₂-Emissionen bei der Ernährung ein.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Category: Mobilität */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                      🚲 Mobilität
                    </h4>
                    <div className="grid gap-2">
                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.activeTransit ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.activeTransit}
                          onChange={(e) => setPledges(prev => ({ ...prev, activeTransit: e.target.checked }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Schulweg mit Rad / zu Fuß</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Spart ca. 30% deiner alltäglichen Mobilitäts-Emissionen ein.</p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.noFlights ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.noFlights}
                          onChange={(e) => setPledges(prev => ({ ...prev, noFlights: e.target.checked }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Flugreisen im Urlaub vermeiden</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Vermeidet ca. 50% deiner gesamten Mobilitäts-Emissionen.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Category: Energie */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                      ⚡ Energie & Wärme
                    </h4>
                    <div className="grid gap-2">
                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.greenPower ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.greenPower}
                          onChange={(e) => setPledges(prev => ({ ...prev, greenPower: e.target.checked }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Wechsel zu 100% Ökostrom</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Reduziert deine häuslichen Strom-Emissionen um ca. 300 kg CO₂.</p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.lowerHeating ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.lowerHeating}
                          onChange={(e) => setPledges(prev => ({ ...prev, lowerHeating: e.target.checked }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Raumtemperatur um 1-2°C senken</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Spart ca. 12% deiner gesamten Heiz- und Wärme-Emissionen.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Category: Konsum */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                      🛒 Konsum & Digitales
                    </h4>
                    <div className="grid gap-2">
                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.secondHand ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.secondHand}
                          onChange={(e) => setPledges(prev => ({ ...prev, secondHand: e.target.checked }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Kleidung vorzugsweise Second-Hand</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Spart ca. 40% deiner jährlichen Konsum-Emissionen ein.</p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        pledges.digitalReduction ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={pledges.digitalReduction}
                          onChange={(e) => setPledges(prev => ({ ...prev, digitalReduction: e.target.checked }))}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold">Streaming- & Bildschirmzeit reduzieren</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Spart ca. 20% deiner jährlichen Konsum- & Rechenzentrums-Emissionen.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: Simulated Impact stats */}
                <div className="md:col-span-2 space-y-4">
                  <div className="glass rounded-2xl p-5 border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between h-full relative overflow-hidden">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-foreground">Prognose deiner CO₂-Reduktion</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-muted-foreground">Aktueller Fußabdruck:</span>
                          <span className="font-mono text-sm font-bold">{formatCO2(totalCo2)}</span>
                        </div>
                        <div className="flex justify-between items-end pt-1 border-t border-border/30">
                          <span className="text-xs text-muted-foreground">Neue Prognose:</span>
                          <span className="font-mono text-xl font-bold text-emerald-500">{formatCO2(simulatedTotalCo2)}</span>
                        </div>
                        {co2Saved > 0 && (
                          <div className="flex justify-between items-end text-cyan-500 pt-1 border-t border-border/30">
                            <span className="text-xs font-semibold">Du sparst jährlich:</span>
                            <span className="font-mono text-sm font-bold">-{formatCO2(co2Saved)}</span>
                          </div>
                        )}
                      </div>

                      {co2Saved > 0 && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">🌳 Klima-Auswirkung:</span>
                          <p className="text-[10px] text-muted-foreground leading-normal font-sans">
                            Deine Einsparung entspricht dem jährlichen CO₂-Ausgleich von ca. <span className="font-bold text-foreground">{treesSaved} Bäumen</span>!
                          </p>
                        </div>
                      )}

                      {/* Horizontal comparison mini bar */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold block text-foreground">Einordnung</span>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Ziel (2t)</span>
                            <span>Simuliert ({formatCO2(simulatedTotalCo2)})</span>
                            <span>Durchschnitt DE (10.5t)</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-muted overflow-hidden relative">
                            {/* Target line */}
                            <div className="absolute left-[19%] top-0 bottom-0 w-0.5 bg-green-500 z-10" title="Klimaziel 2t" />
                            {/* Average line */}
                            <div className="absolute left-[90%] top-0 bottom-0 w-0.5 bg-red-500 z-10" title="DE Durchschnitt 10.5t" />
                            {/* Sim progress bar */}
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-cyan-500"
                              style={{ width: `${Math.min(100, (simulatedTotalCo2 / 11000) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => {
                          if (co2Saved === 0) {
                            alert("Wähle bitte mindestens ein Klima-Versprechen aus, um eine Urkunde zu erstellen!");
                            return;
                          }
                          setShowCertificate(true);
                        }}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 cursor-pointer ${
                          co2Saved > 0
                            ? 'gradient-primary text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Award className="w-4.5 h-4.5" />
                        Klima-Urkunde erstellen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
          </>
        )}

        {/* Tab 2: Schul-Challenge (Leaderboard) */}
        {activeTab === 'challenge' && (
          <div className="space-y-6 animate-slide-up">
            <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500 animate-bounce animate-duration-1000" />
                    Schul-Challenge Leaderboard
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Welche Klasse hat den geringsten durchschnittlichen CO₂-Fußabdruck? Arbeitet zusammen für die Umwelt!
                  </p>
                </div>
                {results && results.className && (
                  <div className="glass px-4 py-2 rounded-xl text-center self-start sm:self-center">
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">Deine Klasse</span>
                    <span className="font-bold text-sm text-primary">{results.className}</span>
                  </div>
                )}
              </div>

              {/* Leaderboard list */}
              <div className="space-y-3">
                {results && results.schoolLeaderboard?.map((entry, index) => {
                  const isOwnClass = entry.className === results.className;
                  const hasCompletions = entry.completedCount > 0;
                  const rank = index + 1;
                  
                  return (
                    <div
                      key={entry.classId}
                      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                        isOwnClass
                          ? 'border-2 border-primary bg-primary/5 shadow-lg shadow-emerald-500/5 dark:bg-emerald-950/20'
                          : 'glass border border-border/40 hover:border-primary/20'
                      }`}
                    >
                      {/* Left: Rank, Class Name, Badges */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 glass shadow-inner">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base">{entry.className}</span>
                            {isOwnClass && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold gradient-primary text-white uppercase tracking-wider">
                                Deine Klasse
                              </span>
                            )}
                          </div>
                          
                          {/* Badges list */}
                          {hasCompletions && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {entry.badges?.filter((b: any) => b.unlocked).map((b: any) => (
                                <span
                                  key={b.id}
                                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform cursor-help"
                                  title={`${b.title}: ${b.description}`}
                                >
                                  {b.icon}
                                </span>
                              ))}
                              {entry.badges?.filter((b: any) => b.unlocked).length === 0 && (
                                <span className="text-[10px] text-muted-foreground italic">Noch keine Abzeichen</span>
                              )}
                            </div>
                          )}
                          {!hasCompletions && (
                            <span className="text-[10px] text-muted-foreground italic mt-1 block">Warten auf Abschlüsse</span>
                          )}
                        </div>
                      </div>

                      {/* Right: progress and average */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                        <div className="space-y-1">
                          <div className="flex justify-between sm:justify-start items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{entry.completedCount} / {entry.totalCount} abgeschlossen</span>
                          </div>
                          <div className="w-28 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full gradient-primary"
                              style={{ width: `${entry.totalCount > 0 ? (entry.completedCount / entry.totalCount) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-right shrink-0 min-w-[90px]">
                          <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">Ø CO₂</span>
                          <span className="font-mono font-bold text-sm sm:text-base text-foreground">
                            {hasCompletions ? formatCO2(entry.averageCo2) : '---'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Klassen-Abzeichen */}
        {activeTab === 'badges' && (
          <div className="space-y-6 animate-slide-up">
            <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                  Klassen-Abzeichen für Klasse {results && results.className}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Arbeitet als Klasse zusammen, um durch klimafreundliche Gewohnheiten Auszeichnungen freizuschalten.
                </p>
              </div>

              {/* Grid of badges */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results && results.classBadges?.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between ${
                      badge.unlocked
                        ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-md shadow-emerald-500/5'
                        : 'border-border/40 bg-card/45'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-md ${
                          badge.unlocked ? `bg-gradient-to-br ${badge.color}` : 'bg-muted text-muted-foreground grayscale opacity-40'
                        }`}
                      >
                        {badge.icon}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        badge.unlocked
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {badge.unlocked ? '🔓 Freigeschaltet' : '🔒 Gesperrt'}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 mb-4">
                      <h4 className="font-bold text-sm sm:text-base text-foreground">{badge.title}</h4>
                      <p className="text-xs text-muted-foreground leading-normal">{badge.description}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                        <span>Fortschritt:</span>
                        <span>
                          {badge.id === 'co2_saver' || badge.id === 'climate_champions'
                            ? badge.unlocked
                              ? 'Ziel erreicht!'
                              : `${(results.classAverage / 1000).toFixed(1)}t von ${(badge.id === 'co2_saver' ? 8.4 : 6.0)}t`
                            : `${badge.progress}% von ${badge.target}%`}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            badge.unlocked ? 'gradient-primary' : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 animate-slide-up animate-delay-500" style={{ animationDelay: '0.7s' }}>
          <MagneticButton
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-muted/50 transition-all font-medium cursor-pointer"
            strength={6}
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </MagneticButton>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-white print:absolute print:inset-0">
          <div className="w-full max-w-2xl bg-card text-card-foreground rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-border print:border-none print:shadow-none print:p-0 print:my-0 print:mx-auto print:bg-white">
            {/* Close button - hidden on print */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors print:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Config panel: Name input - hidden on print */}
            <div className="mb-6 space-y-2 print:hidden">
              <h3 className="text-lg font-bold">Klimaschutz-Urkunde</h3>
              <p className="text-xs text-muted-foreground">
                Gib deinen Namen ein, um eine personalisierte Urkunde mit deinen Klima-Versprechen auszudrucken oder als PDF zu speichern.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="z.B. Maria Muster"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm focus:outline-none"
                />
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.03] transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Drucken / PDF
                </button>
              </div>
            </div>

            {/* Printable Certificate Template */}
            <div
              id="print-certificate"
              className="border-[6px] border-double border-emerald-500/30 rounded-2xl p-6 sm:p-10 relative overflow-hidden bg-white text-zinc-950 shadow-inner print:border-[12px] print:p-12 print:text-black print:bg-white"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {/* Background watermark leaf */}
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none">
                <Leaf className="w-96 h-96 text-emerald-700" />
              </div>

              <div className="relative z-10 text-center space-y-6">
                {/* Certificate header */}
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto border-2 border-emerald-500/30 print:bg-emerald-50">
                    <Leaf className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h1 className="text-3xl font-serif font-bold tracking-wide text-emerald-800 print:text-emerald-900">
                    KLIMASCHUTZ-URKUNDE
                  </h1>
                </div>

                <p className="text-sm italic font-serif text-zinc-500">
                  Diese Urkunde bescheinigt die erfolgreiche Teilnahme am Schul-CO₂-Rechner.
                </p>

                {/* Student Name */}
                <div className="py-2 border-b-2 border-zinc-200 w-3/4 mx-auto">
                  <span className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-zinc-800">
                    {studentName.trim() || '_______________________'}
                  </span>
                </div>
                {results && results.className && (
                  <div className="text-sm font-serif text-zinc-600 italic">
                    aus der Klasse <span className="font-bold text-zinc-850">{results.className}</span>
                  </div>
                )}

                {/* Score section */}
                <div className="space-y-1 text-sm font-serif">
                  <p>
                    hat den persönlichen CO₂-Fußabdruck analysiert und ein Jahresergebnis von
                  </p>
                  <p className="text-lg font-bold text-zinc-800">
                    {formatCO2(totalCo2)} CO₂/Jahr
                  </p>
                  <p>
                    ermittelt.
                  </p>
                </div>

                {/* Class Achievements / Badges on the Certificate */}
                {results && results.classBadges && results.classBadges.some(b => b.unlocked) && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 max-w-lg mx-auto space-y-1.5 print:bg-zinc-50 print:border-zinc-200">
                    <p className="text-[10px] font-bold text-emerald-800 tracking-wider font-serif uppercase">
                      Gemeinsame Auszeichnungen der Klasse {results.className}:
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {results.classBadges.filter(b => b.unlocked).map((badge) => (
                        <div key={badge.id} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-250 text-[9px] print:bg-white print:border-zinc-300 shadow-sm font-sans" title={badge.description}>
                          <span>{badge.icon}</span>
                          <span className="font-semibold text-emerald-900">{badge.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pledge commitment */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 max-w-lg mx-auto space-y-3 print:bg-zinc-50">
                  <p className="text-sm font-bold text-emerald-800 tracking-wide font-serif">
                    MEIN PERSÖNLICHES KLIMA-VERSPRECHEN:
                  </p>
                  <ul className="text-xs space-y-1.5 text-zinc-700 list-disc list-inside text-left font-sans">
                    {pledges.vegetarian && <li>Ich ernähre mich vegetarisch (weniger Fleischkonsum).</li>}
                    {pledges.vegan && <li>Ich ernähre mich vegan (rein pflanzliche Ernährung).</li>}
                    {pledges.bioRegional && <li>Ich kaufe bevorzugt regionale und saisonale Lebensmittel.</li>}
                    {pledges.activeTransit && <li>Ich bewege mich umweltschonend (Schulweg mit Rad oder zu Fuß).</li>}
                    {pledges.noFlights && <li>Ich vermeide Flugreisen im kommenden Urlaubsjahr.</li>}
                    {pledges.greenPower && <li>Ich engagiere mich zu Hause für die Nutzung von 100% Ökostrom.</li>}
                    {pledges.lowerHeating && <li>Ich spare Wärmeenergie (Heizung im Winter um 1-2°C senken).</li>}
                    {pledges.secondHand && <li>Ich kaufe Kleidung bevorzugt Second-Hand (Konsumreduktion).</li>}
                    {pledges.digitalReduction && <li>Ich reduziere meine Streamingzeit zur Stromeinsparung in Rechenzentren.</li>}
                  </ul>
                </div>

                {/* Simulated Results */}
                <div className="text-sm space-y-1 font-serif leading-relaxed max-w-md mx-auto">
                  <p>
                    Durch diese Maßnahmen verringert sich der ökologische Fußabdruck auf
                    prognostizierte <span className="font-bold text-emerald-700">{formatCO2(simulatedTotalCo2)} CO₂/Jahr</span>.
                  </p>
                  <p className="text-xs text-zinc-500 italic">
                    Das entspricht einer jährlichen Kohlenstoff-Einsparung von{' '}
                    <span className="font-bold text-zinc-750 font-sans">-{formatCO2(co2Saved)}</span> (Kompensation von ca.{' '}
                    <span className="font-bold text-zinc-750 font-sans">{treesSaved} Bäumen</span> pro Jahr!).
                  </p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 max-w-md mx-auto text-xs font-serif">
                  <div className="border-t border-zinc-350 pt-2 text-center text-zinc-500">
                    Datum & Ort
                  </div>
                  <div className="border-t border-zinc-350 pt-2 text-center text-zinc-500">
                    Unterschrift Lehrkraft / Mentor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles are now in globals.css */}

      <LegalFooter />
    </div>
  );
}
