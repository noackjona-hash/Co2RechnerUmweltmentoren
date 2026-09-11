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
import dynamic from 'next/dynamic';

const CategoryPieChart = dynamic(
  () => import('@/components/results-charts').then((mod) => mod.CategoryPieChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] flex items-center justify-center font-mono text-xs text-muted-foreground">
        Diagramm wird geladen...
      </div>
    ),
  }
);
const ComparisonBarChart = dynamic(
  () => import('@/components/results-charts').then((mod) => mod.ComparisonBarChart),
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
  Printer,
  X,
  Check,
  Award,
  TreePine,
  Car,
  Utensils,
  Zap,
  ShoppingBag,
  Sparkles,
  Trophy,
  BarChart3,
  Leaf,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

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
  isGuest?: boolean;
  accessKey?: string;
}

export default function ResultsClient() {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'analysis' | 'simulator' | 'challenge'>('analysis');
  const [customSchoolName, setCustomSchoolName] = useState('');
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

  useEffect(() => {
    const saved = localStorage.getItem('co2rechner_pledges');
    if (saved) {
      try {
        setPledges(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

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

  useEffect(() => {
    if (!results) return;
    const target = results.totalCo2;
    const duration = 1000;
    const steps = 25;
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Ergebnisse werden geladen...
        </p>
      </div>
    );
  }

  if (!results) return null;

  const { totalCo2, categoryTotals } = results;

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

  const getRating = () => {
    if (totalCo2 <= CLIMATE_TARGET_CO2) {
      return { label: 'Klimaziel erreicht', desc: 'Vorbildlich · Unter 2.000 kg CO₂ pro Jahr' };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2 * 0.7) {
      return { label: 'Sehr sparsam', desc: 'Deutlich unter dem Bundesdurchschnitt' };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2) {
      return { label: 'Unter Bundesdurchschnitt', desc: 'Unter den durchschnittlichen 10.800 kg' };
    }
    return { label: 'Einsparpotenzial vorhanden', desc: 'Mit gezielten Alltagsänderungen viel bewegen' };
  };

  const rating = getRating();

  const pieData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: CATEGORIES[key as Category]?.label || key,
    value: Math.max(0, Math.round(value)),
    color: CATEGORIES[key as Category]?.color || '#444',
  }));

  const comparisonData = [
    { name: 'Klimaziel', value: CLIMATE_TARGET_CO2, fill: '#245037' },
    { name: 'Mit Versprechen', value: Math.round(simulatedTotalCo2), fill: '#3d7a57' },
    { name: 'Dein Wert', value: Math.round(totalCo2), fill: '#1c1917' },
  ];

  if (results.classAverage > 0) {
    comparisonData.push({
      name: `Klasse ${results.className}`,
      value: results.classAverage,
      fill: '#57534e',
    });
  }

  comparisonData.push({
    name: 'Durchschnitt DE',
    value: NATIONAL_AVERAGE_CO2,
    fill: '#a8a29e',
  });

  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  const highestCategory = sortedCategories[0]?.[0] as Category;

  const tips: Record<string, string[]> = {
    mobility: [
      'Schulweg öfter zu Fuß oder mit dem Rad zurücklegen.',
      'Öffentliche Verkehrsmittel statt Elterntaxi nutzen.',
      'Für Urlaubsreisen den Zug dem Flugzeug vorziehen.',
    ],
    food: [
      'Ein bis zwei fleischfreie Tage pro Woche einlegen.',
      'Regionales und saisonales Obst und Gemüse bevorzugen.',
      'Reste in einer Dose mitnehmen statt wegwerfen.',
    ],
    energy: [
      'Heizung im Zimmer um 1–2 Grad senken.',
      'Duschzeit verkürzen (5 statt 10 Minuten).',
      'Geräte und Beleuchtung bei Nichtgebrauch ausschalten.',
    ],
    consumption: [
      'Kleidung Second-Hand kaufen oder im Freundeskreis tauschen.',
      'Smartphones und Elektronik länger nutzen.',
      'Müll sorgfältig trennen (Papier, Glas, Wertstoff).',
    ],
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pb-12 bg-background">
      {/* Modern Sticky Header */}
      <header className="w-full border-b border-border/70 bg-card/75 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              UM
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground tracking-tight block">
                CO₂-Auswertung
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {results.isGuest ? 'Gast-Teilnahme (Freier Modus)' : `Klasse: ${results.className || 'Schule'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCertificate(true)}
              className="paper-btn-primary text-xs flex items-center gap-1.5 shadow-xs"
              title="Urkunde erstellen & drucken"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Urkunde drucken</span>
              <span className="sm:hidden">Urkunde</span>
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="paper-btn-secondary text-xs"
              title="Abmelden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6 animate-fade-in">
        {/* Scorecard Hero Banner */}
        <article className="paper-sheet p-6 sm:p-10 text-center relative overflow-hidden bg-gradient-to-b from-card via-card to-emerald-500/[0.04]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-500/20 mb-3">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Dein persönlicher CO₂-Fußabdruck</span>
          </div>

          <div className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight py-1 font-sans">
            {formatCO2(animatedTotal)}
          </div>
          <span className="text-xs text-muted-foreground font-medium block mb-4">
            geschätzte Treibhausgas-Emissionen pro Jahr
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {rating.label} — {rating.desc}
            </span>

            <button
              onClick={() => setShowCertificate(true)}
              className="paper-btn-primary text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Urkunde öffnen & anpassen</span>
            </button>
          </div>
        </article>

        {/* 3 Meaningful Equivalents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="paper-sheet p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground tracking-tight">
                {Math.round(totalCo2 / 12.5)} Bäume
              </div>
              <span className="text-xs text-muted-foreground block leading-tight">
                nötig zur jährlichen Bindung
              </span>
            </div>
          </div>

          <div className="paper-sheet p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground tracking-tight">
                {(totalCo2 / 0.15 / 1000).toFixed(0)}k km
              </div>
              <span className="text-xs text-muted-foreground block leading-tight">
                PKW-Fahrtstrecke im Vergleich
              </span>
            </div>
          </div>

          <div className="paper-sheet p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground tracking-tight">
                {Math.round(totalCo2 / 3.6)}
              </div>
              <span className="text-xs text-muted-foreground block leading-tight">
                typische Fleischmahlzeiten
              </span>
            </div>
          </div>
        </div>

        {/* Modern Segmented Navigation Tabs */}
        <div className="p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl flex gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>01 Detail-Analyse</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>02 Versprechen & Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'challenge'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>03 Klassen-Vergleich</span>
          </button>
        </div>

        {/* TAB 1: ANALYSE */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="paper-sheet p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Anteile nach Bereich
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Tortendiagramm</span>
                </div>
                <CategoryPieChart data={pieData} />
              </div>

              <div className="paper-sheet p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vergleichswerte
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Benchmark</span>
                </div>
                <ComparisonBarChart data={comparisonData} />
              </div>
            </div>

            {/* 4 Category Cards with Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(categoryTotals).map(([key, value]) => {
                const cat = CATEGORIES[key as Category];
                if (!cat) return null;
                const percent = Math.round((Math.max(0, value) / Math.max(1, totalCo2)) * 100);

                const getIcon = () => {
                  switch (key) {
                    case 'mobility':
                      return <Car className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
                    case 'food':
                      return <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
                    case 'energy':
                      return <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
                    default:
                      return <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
                  }
                };

                return (
                  <div key={key} className="paper-sheet p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {cat.label}
                      </span>
                      {getIcon()}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {formatCO2(Math.max(0, value))}
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Anteil</span>
                        <span className="font-semibold">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Practical Recommendations */}
            <div className="paper-sheet p-6 space-y-3">
              <div className="border-b border-border/70 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Empfehlungen
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    Gezielte Praxistipps für {CATEGORIES[highestCategory]?.label}
                  </h3>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  Größter Hebel
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                {tips[highestCategory]?.map((tip, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-border/80 bg-card/60 text-xs text-foreground leading-relaxed flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Call-to-Action */}
            <article className="paper-sheet p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-emerald-500/[0.05]">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Offizieller Nachweis
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Deine persönliche Klimaschutz-Urkunde
                </h3>
                <p className="text-xs text-muted-foreground max-w-lg">
                  Drucke dein Zertifikat mit deinem Ergebnis und deinen Zielen aus oder speichere es als PDF.
                </p>
              </div>
              <button
                onClick={() => setShowCertificate(true)}
                className="paper-btn-primary text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Urkunde erstellen & drucken</span>
              </button>
            </article>
          </div>
        )}

        {/* TAB 2: SIMULATOR & URKUNDE */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <article className="paper-sheet p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Klimaschutz-Versprechen & Simulator
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Wähle Maßnahmen aus, die du in deinem Alltag umsetzen möchtest, und beobachte den Effekt live.
                  </p>
                </div>

                <button
                  onClick={() => setShowCertificate(true)}
                  className="paper-btn-primary text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Urkunde mit Versprechen drucken</span>
                </button>
              </div>

              {/* Dynamic Savings Display */}
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Deine prognostizierte Einsparung:
                  </span>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    -{formatCO2(co2Saved)} pro Jahr
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Neuer Ausstoß: {formatCO2(simulatedTotalCo2)} (vorher: {formatCO2(totalCo2)})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-card border border-border/80 text-center min-w-[110px]">
                    <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                      Entlastung
                    </span>
                    <span className="text-base font-bold text-foreground">
                      ca. {treesSaved} {treesSaved === 1 ? 'Baum' : 'Bäume'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="paper-btn-primary text-xs flex items-center gap-1.5 self-center"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Auf Urkunde übernehmen</span>
                  </button>
                </div>
              </div>

              {/* Interactive Checklist */}
              <div className="space-y-2.5 pt-1">
                {[
                  { key: 'vegetarian', title: 'Vegetarische Ernährung', desc: 'Ca. 33% weniger Emissionen bei Lebensmitteln.' },
                  { key: 'vegan', title: 'Vegane Ernährung', desc: 'Ca. 45% weniger Emissionen bei Lebensmitteln.' },
                  { key: 'bioRegional', title: 'Regionale & saisonale Lebensmittel', desc: 'Ca. 10% Einsparung durch kurze Transportwege.' },
                  { key: 'activeTransit', title: 'Schulweg zu Fuß oder mit dem Rad', desc: 'Ca. 30% weniger Alltagsmobilität.' },
                  { key: 'noFlights', title: 'Urlaub ohne Flugreisen', desc: 'Bis zu 50% weniger persönliche Mobilitätsemissionen.' },
                  { key: 'greenPower', title: '100% Ökostrom zu Hause', desc: 'Spart durchschnittlich 300 kg CO₂.' },
                  { key: 'lowerHeating', title: 'Heizung um 1–2 Grad senken', desc: 'Spart rund 12% der persönlichen Heizenergie.' },
                  { key: 'secondHand', title: 'Second-Hand-Kleidung bevorzugen', desc: 'Spart bis zu 40% der textilen Konsum-Emissionen.' },
                  { key: 'digitalReduction', title: 'Bewusster Umgang mit Streaming & Geräten', desc: 'Spart ca. 20% digitaler Emissionen.' },
                ].map((item) => {
                  const isChecked = (pledges as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer text-xs transition-all ${
                        isChecked
                          ? 'border-emerald-500/50 bg-emerald-500/[0.06] text-foreground font-medium shadow-xs'
                          : 'border-border/80 bg-card hover:bg-stone-50 dark:hover:bg-stone-900/40 text-foreground'
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
                        className="mt-0.5 accent-emerald-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="font-semibold block text-xs">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">{item.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </article>
          </div>
        )}

        {/* TAB 3: CHALLENGE */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <article className="paper-sheet p-6 space-y-4">
              <div className="border-b border-border/70 pb-3">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Schul-Übersicht
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Klassen-Rangliste der Schule
                </h3>
              </div>

              {results.isGuest ? (
                <div className="p-4 rounded-xl border border-border/80 bg-stone-50 dark:bg-stone-900/30 space-y-2 text-xs">
                  <span className="font-semibold text-foreground block">
                    Gast-Teilnahme · Keine Schulklasse zugeordnet
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Da du diesen Rechner im freien Gast-Modus nutzt, nimmst du an keinem internen Klassenwettbewerb teil.
                    Im Reiter <strong>01 Detail-Analyse</strong> siehst du den direkten Vergleich deiner Werte mit dem Bundesdurchschnitt (10,8 t) und dem Pariser Klimaziel (unter 2 t).
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden">
                  {results.schoolLeaderboard?.map((entry, index) => {
                    const isOwn = entry.className === results.className;
                    const rankMedal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

                    return (
                      <div
                        key={entry.classId}
                        className={`p-3.5 flex items-center justify-between text-xs transition-colors ${
                          isOwn ? 'bg-emerald-500/10 font-semibold' : 'bg-card hover:bg-stone-50/50 dark:hover:bg-stone-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-bold text-sm">
                            {rankMedal}
                          </span>
                          <div>
                            <span className="text-foreground block font-medium">
                              {entry.className} {isOwn && '(Deine Klasse)'}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {entry.completedCount} von {entry.totalCount} Schüler:innen abgeschlossen
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-bold text-foreground">
                          {entry.completedCount > 0 ? formatCO2(entry.averageCo2) : '---'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </div>
        )}
      </main>

      {/* Printable Certificate Modal */}
      {showCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCertificate(false);
          }}
        >
          <div className="w-full max-w-xl bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-xl relative print:border-none print:p-0">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer print:hidden transition-colors"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Customization controls on top */}
            <div className="mb-6 space-y-3.5 print:hidden text-xs">
              <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-foreground">
                    Urkunde anpassen & drucken
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">Vorschau live</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Name der Schülerin / des Schülers (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Vor- und Nachname"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Schule / Klasse (optional)
                  </label>
                  <input
                    type="text"
                    placeholder={results.isGuest ? 'Schule / Wohnort' : results.className || 'Klasse'}
                    value={customSchoolName}
                    onChange={(e) => setCustomSchoolName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertificate(false)}
                  className="paper-btn-secondary text-xs"
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="paper-btn-primary text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Jetzt drucken / Als PDF speichern</span>
                </button>
              </div>
            </div>

            {/* Authentic Printable Certificate */}
            <div
              id="print-certificate"
              className="border-4 border-double border-stone-800 p-8 sm:p-12 text-center bg-white text-stone-900 font-serif"
            >
              <span className="text-[11px] font-mono tracking-widest uppercase text-stone-600 block mb-2">
                Umweltmentoren Baden-Württemberg
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-stone-900 mb-1">
                KLIMASCHUTZ-URKUNDE
              </h2>
              <div className="w-16 h-0.5 bg-stone-900 mx-auto my-4" />

              <p className="text-xs italic text-stone-700 mb-4">
                Hiermit wird bescheinigt, dass
              </p>

              <div className="border-b-2 border-stone-400 max-w-xs mx-auto pb-1 mb-2">
                <span className="text-xl font-bold text-stone-900 font-sans tracking-wide">
                  {studentName.trim() || '_______________________'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mb-6 font-sans">
                {customSchoolName.trim()
                  ? customSchoolName.trim()
                  : results.isGuest
                  ? 'Freie Gast-Teilnahme'
                  : `Klasse: ${results.className || 'Schule'}`}
              </p>

              <p className="text-xs leading-relaxed max-w-md mx-auto mb-6 text-stone-800">
                den persönlichen CO₂-Fußabdruck analysiert und ein Jahresergebnis von{' '}
                <strong className="font-sans text-stone-900 font-bold">{formatCO2(totalCo2)}</strong> ermittelt hat.
              </p>

              {/* Pledges box */}
              {Object.values(pledges).some(Boolean) ? (
                <div className="border border-stone-400 p-4 max-w-md mx-auto text-left mb-6 text-xs font-sans bg-stone-50/50">
                  <span className="font-bold text-stone-900 block mb-1 uppercase tracking-wider text-[10px] font-mono">
                    Persönliches Klima-Versprechen:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-stone-800 text-[11px]">
                    {pledges.vegetarian && <li>Vegetarische Ernährung</li>}
                    {pledges.vegan && <li>Vegane Ernährung</li>}
                    {pledges.bioRegional && <li>Regionale & saisonale Lebensmittel</li>}
                    {pledges.activeTransit && <li>Schulweg zu Fuß oder mit dem Fahrrad</li>}
                    {pledges.noFlights && <li>Verzicht auf Flugreisen</li>}
                    {pledges.greenPower && <li>Einsatz für 100% Ökostrom</li>}
                    {pledges.lowerHeating && <li>Heizung um 1–2 Grad senken</li>}
                    {pledges.secondHand && <li>Second-Hand bevorzugen</li>}
                    {pledges.digitalReduction && <li>Bewusster Umgang mit Streaming & Geräten</li>}
                  </ul>
                  {co2Saved > 0 && (
                    <p className="text-xs text-stone-700 mt-3 pt-2 border-t border-stone-300 font-medium">
                      Prognostizierte Einsparung:{' '}
                      <strong className="font-bold text-stone-900">-{formatCO2(co2Saved)} CO₂/Jahr</strong>{' '}
                      (ca. {treesSaved} {treesSaved === 1 ? 'Baum' : 'Bäume'}).
                    </p>
                  )}
                </div>
              ) : (
                <div className="border border-stone-400 p-4 max-w-md mx-auto text-center mb-6 text-xs font-sans bg-stone-50/50">
                  <span className="font-bold text-stone-900 block mb-1 uppercase tracking-wider text-[10px] font-mono">
                    Auszeichnung für Engagement
                  </span>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    Ausgezeichnet für die erfolgreiche Reflexion des Alltagsverbrauchs und den aktiven Beitrag zum Klimabewusstsein an der Schule.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8 pt-6 max-w-sm mx-auto text-[10px] font-mono text-stone-600">
                <div className="border-t border-stone-400 pt-1">
                  Datum: {new Date().toLocaleDateString('de-DE')}
                </div>
                <div className="border-t border-stone-400 pt-1">Unterschrift Lehrkraft / Mentor:in</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LegalFooter />
    </div>
  );
}
