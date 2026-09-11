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
      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
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
      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
        Diagramm wird geladen...
      </div>
    ),
  }
);

import {
  LogOut,
  Printer,
  X,
  Trophy,
  TreePine,
  Bike,
  Flame,
  Check,
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
    const duration = 1200;
    const steps = 30;
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
        <p className="text-sm font-semibold text-muted-foreground">Ergebnisse werden geladen...</p>
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
      return { label: 'Klimaziel erreicht', desc: 'Unter 2 Tonnen pro Jahr' };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2 * 0.7) {
      return { label: 'Deutlich unter Durchschnitt', desc: 'Sehr sparsam im Alltag' };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2) {
      return { label: 'Unter dem Durchschnitt', desc: 'Unter den bundesweiten 9,1 Tonnen' };
    }
    return { label: 'Verbesserungspotenzial', desc: 'Mit kleinen Schritten viel einsparen' };
  };

  const rating = getRating();

  const pieData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: CATEGORIES[key as Category]?.label || key,
    value: Math.max(0, Math.round(value)),
    color: CATEGORIES[key as Category]?.color || '#444',
  }));

  const comparisonData = [
    { name: 'Klimaziel', value: CLIMATE_TARGET_CO2, fill: '#245037' },
    { name: 'Mit Versprechen', value: Math.round(simulatedTotalCo2), fill: '#059669' },
    { name: 'Dein Wert', value: Math.round(totalCo2), fill: '#d97706' },
  ];

  if (results.classAverage > 0) {
    comparisonData.push({
      name: `Klasse ${results.className}`,
      value: results.classAverage,
      fill: '#4f46e5',
    });
  }

  comparisonData.push({
    name: 'Durchschnitt DE',
    value: NATIONAL_AVERAGE_CO2,
    fill: '#78716c',
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
    <div className="min-h-screen flex flex-col justify-between pb-12 selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border/80">
        <div>
          <span className="font-bold text-base text-foreground block">
            CO₂-Rechner Auswertung
          </span>
          <span className="text-xs text-muted-foreground block">
            Klasse: {results.className || 'Schule'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg paper-btn-secondary text-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Abmelden
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Score Sheet */}
        <div className="paper-card p-6 sm:p-8 text-center space-y-3">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
            Dein Jahresergebnis
          </span>

          <div className="text-5xl sm:text-6xl font-black font-mono text-foreground tracking-tight">
            {formatCO2(animatedTotal)}
          </div>
          <span className="text-xs text-muted-foreground block">pro Jahr</span>

          <div className="pt-2">
            <span className="paper-badge text-xs font-mono">
              {rating.label} • {rating.desc}
            </span>
          </div>
        </div>

        {/* 3 Real-World Equivalents */}
        <div className="grid grid-cols-3 gap-3">
          <div className="paper-card p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <TreePine className="w-3.5 h-3.5" />
              <span>Bäume</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {Math.round(totalCo2 / 12.5)}
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
              zur jährlichen Kompensation
            </span>
          </div>

          <div className="paper-card p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Bike className="w-3.5 h-3.5" />
              <span>Auto-km</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {(totalCo2 / 0.15 / 1000).toFixed(0)}k
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
              Fahrstrecke in Kilometern
            </span>
          </div>

          <div className="paper-card p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Burger</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {Math.round(totalCo2 / 3.6)}
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
              entsprechende Mahlzeiten
            </span>
          </div>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex border-b border-border text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-2.5 px-4 cursor-pointer border-b-2 -mb-px transition-colors ${
              activeTab === 'analysis'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Analyse
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 px-4 cursor-pointer border-b-2 -mb-px transition-colors ${
              activeTab === 'simulator'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Versprechen & Urkunde
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`pb-2.5 px-4 cursor-pointer border-b-2 -mb-px transition-colors ${
              activeTab === 'challenge'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Klassen-Challenge
          </button>
        </div>

        {/* TAB 1: ANALYSE */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="paper-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Verteilung nach Kategorien
                </h3>
                <CategoryPieChart data={pieData} />
              </div>

              <div className="paper-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Vergleich
                </h3>
                <ComparisonBarChart data={comparisonData} />
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(categoryTotals).map(([key, value]) => {
                const cat = CATEGORIES[key as Category];
                if (!cat) return null;
                const percent = Math.round((Math.max(0, value) / Math.max(1, totalCo2)) * 100);
                return (
                  <div key={key} className="paper-card p-3.5">
                    <span className="text-xs font-bold text-foreground block mb-0.5">{cat.label}</span>
                    <span className="text-base font-bold font-mono text-foreground block">
                      {formatCO2(Math.max(0, value))}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">{percent}% Anteil</span>
                  </div>
                );
              })}
            </div>

            {/* Tips for highest category */}
            <div className="paper-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Tipps für den Bereich {CATEGORIES[highestCategory]?.label}
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                {tips[highestCategory]?.map((tip, i) => (
                  <li key={i} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATOR & URKUNDE */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="paper-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Klima-Versprechen (Pledges)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Wähle Vorsätze aus, um deine Einsparung zu simulieren.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (co2Saved === 0) {
                      alert('Wähle bitte mindestens ein Versprechen aus, um eine Urkunde zu drucken.');
                      return;
                    }
                    setShowCertificate(true);
                  }}
                  className="px-4 py-2 rounded-xl paper-btn-primary text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Urkunde erstellen
                </button>
              </div>

              {/* Savings preview */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground block">Mögliche Einsparung:</span>
                  <span className="text-base font-bold font-mono text-primary">
                    -{formatCO2(co2Saved)} / Jahr
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block">Entspricht ca.:</span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {treesSaved} Bäumen
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-2">
                {[
                  { key: 'vegetarian', title: 'Vegetarische Ernährung', desc: 'Ca. 33% weniger Emissionen bei Lebensmitteln.' },
                  { key: 'vegan', title: 'Vegane Ernährung', desc: 'Ca. 45% weniger Emissionen bei Lebensmitteln.' },
                  { key: 'bioRegional', title: 'Regionale & saisonale Lebensmittel', desc: 'Ca. 10% Einsparung.' },
                  { key: 'activeTransit', title: 'Schulweg zu Fuß / mit dem Rad', desc: 'Ca. 30% weniger Alltagsmobilität.' },
                  { key: 'noFlights', title: 'Urlaub ohne Flugreisen', desc: 'Bis zu 50% weniger Mobilitätsemissionen.' },
                  { key: 'greenPower', title: '100% Ökostrom zu Hause', desc: 'Spart rund 300 kg CO₂.' },
                  { key: 'lowerHeating', title: 'Heizung um 1–2 Grad senken', desc: 'Spart rund 12% Heizenergie.' },
                  { key: 'secondHand', title: 'Second-Hand-Kleidung bevorzugen', desc: 'Spart bis zu 40% Konsum-Emissionen.' },
                  { key: 'digitalReduction', title: 'Bildschirmzeit & Streaming bewusst drosseln', desc: 'Spart ca. 20% digitale Emissionen.' },
                ].map((item) => {
                  const isChecked = (pledges as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-card text-foreground'
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
                        className="mt-0.5 accent-stone-700"
                      />
                      <div>
                        <span className="font-semibold block">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHALLENGE */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <div className="paper-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Klassen-Rangliste
                </h3>
              </div>

              <div className="space-y-2">
                {results.schoolLeaderboard?.map((entry, index) => {
                  const isOwn = entry.className === results.className;
                  return (
                    <div
                      key={entry.classId}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        isOwn ? 'border-primary bg-primary/5' : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold w-4">{index + 1}.</span>
                        <div>
                          <span className="font-bold text-foreground block">
                            {entry.className} {isOwn && '(Deine Klasse)'}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {entry.completedCount} / {entry.totalCount} abgeschlossen
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-sm text-foreground">
                        {entry.completedCount > 0 ? formatCO2(entry.averageCo2) : '---'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Printable Paper Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="w-full max-w-xl bg-card rounded-2xl p-6 border border-border shadow-xl relative print:border-none print:shadow-none print:p-0">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 space-y-2 print:hidden">
              <h3 className="text-sm font-bold text-foreground">Name für Urkunde eintragen:</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Vor- und Nachname"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-muted/40 text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg paper-btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Drucken / PDF
                </button>
              </div>
            </div>

            {/* Printable Paper Certificate */}
            <div
              id="print-certificate"
              className="border-2 border-stone-800 p-8 sm:p-10 text-center bg-white text-stone-900 font-serif"
            >
              <span className="text-[11px] font-mono tracking-widest uppercase text-stone-500 block mb-2">
                Umweltmentoren an Schulen in Baden-Württemberg
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-stone-900 mb-1">
                KLIMASCHUTZ-URKUNDE
              </h2>
              <div className="w-16 h-0.5 bg-stone-800 mx-auto my-4" />

              <p className="text-xs italic text-stone-600 mb-4">
                Hiermit wird bescheinigt, dass
              </p>

              <div className="border-b border-stone-400 max-w-xs mx-auto pb-1 mb-2">
                <span className="text-xl font-bold text-stone-900 font-sans">
                  {studentName.trim() || '_______________________'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mb-6">
                aus der Klasse <strong>{results.className || 'Schule'}</strong>
              </p>

              <p className="text-xs leading-relaxed max-w-md mx-auto mb-6">
                den persönlichen CO₂-Fußabdruck analysiert und ein Jahresergebnis von{' '}
                <strong className="font-sans text-stone-900">{formatCO2(totalCo2)}</strong> ermittelt hat.
              </p>

              {/* Pledges box */}
              <div className="border border-stone-300 p-4 max-w-md mx-auto text-left mb-6 text-xs font-sans">
                <span className="font-bold text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
                  Persönliches Klima-Versprechen:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700 text-[11px]">
                  {pledges.vegetarian && <li>Vegetarische Ernährung</li>}
                  {pledges.vegan && <li>Vegane Ernährung</li>}
                  {pledges.bioRegional && <li>Regionale & saisonale Lebensmittel</li>}
                  {pledges.activeTransit && <li>Schulweg zu Fuß oder mit dem Fahrrad</li>}
                  {pledges.noFlights && <li>Verzicht auf Urlaubs-Flugreisen</li>}
                  {pledges.greenPower && <li>Einsatz für Ökostrom zu Hause</li>}
                  {pledges.lowerHeating && <li>Heizung um 1–2 Grad absenken</li>}
                  {pledges.secondHand && <li>Kleidung bevorzugt Second-Hand kaufen</li>}
                  {pledges.digitalReduction && <li>Bewusster Umgang mit Streaming & Geräten</li>}
                </ul>
              </div>

              <p className="text-xs text-stone-600 mb-10">
                Prognostizierte Einsparung:{' '}
                <strong className="font-sans text-stone-900">-{formatCO2(co2Saved)} CO₂/Jahr</strong>{' '}
                (entspricht dem Ausgleich von ca. {treesSaved} Bäumen).
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4 max-w-sm mx-auto text-[10px] font-sans text-stone-500">
                <div className="border-t border-stone-400 pt-1">Datum & Ort</div>
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
