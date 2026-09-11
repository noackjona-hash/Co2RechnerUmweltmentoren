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
      {/* Editorial Header */}
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted-foreground uppercase tracking-widest">Auswertung</span>
            <span className="text-border">/</span>
            <span className="text-foreground uppercase tracking-wider font-semibold">
              {results.isGuest ? 'Gast-Teilnahme (Freier Modus)' : `Klasse: ${results.className || 'Schule'}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="paper-btn-secondary text-xs"
            >
              <LogOut className="w-3 h-3" />
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Paper Score Certificate Banner */}
        <article className="paper-sheet p-6 sm:p-10 text-center space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Umweltmentoren · CO₂-Erfassungsbogen</span>
            <span>Jahresbilanz</span>
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block pt-2">
            Dein persönlicher Jahresausstoß
          </span>

          <div className="text-5xl sm:text-6xl font-mono font-semibold text-foreground tracking-tight">
            {formatCO2(animatedTotal)}
          </div>
          <span className="font-mono text-xs text-muted-foreground block">
            pro Jahr (12 Monate)
          </span>

          <div className="pt-2">
            <span className="paper-stamp">
              {rating.label} — {rating.desc}
            </span>
          </div>
        </article>

        {/* 3 Tabular Equivalents (Notebook Ledger) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 font-mono text-center">
          <div className="paper-sheet p-4">
            <span className="text-[11px] text-muted-foreground block uppercase tracking-wider mb-1">
              Bäume
            </span>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">
              {Math.round(totalCo2 / 12.5)}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1 leading-tight">
              zur Kompensation/Jahr
            </span>
          </div>

          <div className="paper-sheet p-4">
            <span className="text-[11px] text-muted-foreground block uppercase tracking-wider mb-1">
              Auto-Fahrstrecke
            </span>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">
              {(totalCo2 / 0.15 / 1000).toFixed(0)}k km
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1 leading-tight">
              entspricht PKW-Fahrt
            </span>
          </div>

          <div className="paper-sheet p-4">
            <span className="text-[11px] text-muted-foreground block uppercase tracking-wider mb-1">
              Mahlzeiten
            </span>
            <div className="text-xl sm:text-2xl font-semibold text-foreground">
              {Math.round(totalCo2 / 3.6)}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1 leading-tight">
              Fleischmahlzeiten
            </span>
          </div>
        </div>

        {/* Minimalist Editorial Tabs */}
        <div className="flex border-b border-border text-xs font-mono uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-2.5 px-4 cursor-pointer border-b-2 -mb-px transition-colors ${
              activeTab === 'analysis'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            01 Analyse & Details
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 px-4 cursor-pointer border-b-2 -mb-px transition-colors ${
              activeTab === 'simulator'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            02 Versprechen & Urkunde
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`pb-2.5 px-4 cursor-pointer border-b-2 -mb-px transition-colors ${
              activeTab === 'challenge'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            03 Klassen-Vergleich
          </button>
        </div>

        {/* TAB 1: ANALYSE */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="paper-sheet p-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Anteile nach Bereich
                </h3>
                <CategoryPieChart data={pieData} />
              </div>

              <div className="paper-sheet p-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Vergleichswerte
                </h3>
                <ComparisonBarChart data={comparisonData} />
              </div>
            </div>

            {/* 4 Category Ledger Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(categoryTotals).map(([key, value]) => {
                const cat = CATEGORIES[key as Category];
                if (!cat) return null;
                const percent = Math.round((Math.max(0, value) / Math.max(1, totalCo2)) * 100);
                return (
                  <div key={key} className="paper-sheet p-3.5 font-mono">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
                      {cat.label}
                    </span>
                    <span className="text-base font-semibold text-foreground block">
                      {formatCO2(Math.max(0, value))}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {percent}% Anteil
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Practical Notes for highest category */}
            <div className="paper-sheet p-6 space-y-3">
              <div className="border-b border-border pb-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground block">
                  Empfehlungen
                </span>
                <h3 className="text-base font-serif font-normal text-foreground">
                  Gezielte Tipps für den Bereich {CATEGORIES[highestCategory]?.label}
                </h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside font-sans leading-relaxed">
                {tips[highestCategory]?.map((tip, i) => (
                  <li key={i}>
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
            <article className="paper-sheet p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-serif font-normal text-foreground">
                    Klimaschutz-Versprechen
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                    Wähle Maßnahmen aus, die du in deinem Alltag umsetzen möchtest.
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
                  className="paper-btn-primary text-xs shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Urkunde erstellen
                </button>
              </div>

              {/* Savings preview */}
              <div className="p-4 border border-border bg-muted/40 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-muted-foreground block">Mögliche Einsparung:</span>
                  <span className="text-base font-semibold text-foreground">
                    -{formatCO2(co2Saved)} / Jahr
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block">Entspricht ca.:</span>
                  <span className="text-base font-semibold text-foreground">
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
                      className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'border-foreground bg-muted/30 text-foreground'
                          : 'border-border bg-card hover:bg-muted/10 text-foreground'
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
                        className="mt-0.5 accent-stone-800"
                      />
                      <div>
                        <span className="font-semibold block font-sans">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground font-sans">{item.desc}</span>
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
              <div className="border-b border-border pb-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground block">
                  Schul-Übersicht
                </span>
                <h3 className="text-base font-serif font-normal text-foreground">
                  Klassen-Rangliste
                </h3>
              </div>

              {results.isGuest ? (
                <div className="p-4 border border-border bg-muted/20 space-y-1.5 font-sans text-xs">
                  <span className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                    Gast-Teilnahme · Keine Schulklasse zugeordnet
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Da du diesen Rechner im freien Gast-Modus nutzt, nimmst du an keinem internen Klassenwettbewerb teil.
                    Im Reiter <strong>01 Analyse & Details</strong> siehst du den direkten Vergleich deiner Werte mit dem Bundesdurchschnitt (10,8 t) und dem Pariser Klimaziel (unter 2 t).
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border border border-border">
                  {results.schoolLeaderboard?.map((entry, index) => {
                    const isOwn = entry.className === results.className;
                    return (
                      <div
                        key={entry.classId}
                        className={`p-3.5 flex items-center justify-between text-xs font-mono ${
                          isOwn ? 'bg-muted/40 font-bold' : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-muted-foreground">{index + 1}.</span>
                          <div>
                            <span className="text-foreground block">
                              {entry.className} {isOwn && '(Deine Klasse)'}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-sans block">
                              {entry.completedCount} / {entry.totalCount} abgeschlossen
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-semibold text-foreground">
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

      {/* Printable Paper Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="w-full max-w-xl bg-card rounded-sm p-6 sm:p-8 border border-border relative print:border-none print:p-0">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 space-y-3 print:hidden font-mono text-xs">
              <h3 className="uppercase tracking-wider text-muted-foreground">
                Angaben für Urkunde:
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Vor- und Nachname"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="px-3 py-2 text-xs border border-border bg-muted/30 text-foreground focus:outline-none focus:border-foreground"
                />
                <input
                  type="text"
                  placeholder={results.isGuest ? 'Schule / Wohnort (optional)' : results.className || 'Klasse'}
                  value={customSchoolName}
                  onChange={(e) => setCustomSchoolName(e.target.value)}
                  className="px-3 py-2 text-xs border border-border bg-muted/30 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => window.print()}
                  className="paper-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Drucken / Als PDF speichern
                </button>
              </div>
            </div>

            {/* Authentic Printable Paper Certificate */}
            <div
              id="print-certificate"
              className="border-4 border-double border-stone-900 p-8 sm:p-12 text-center bg-white text-stone-900 font-serif"
            >
              <span className="text-[11px] font-mono tracking-widest uppercase text-stone-500 block mb-2">
                Umweltmentoren Baden-Württemberg
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-stone-900 mb-1">
                KLIMASCHUTZ-URKUNDE
              </h2>
              <div className="w-16 h-0.5 bg-stone-900 mx-auto my-4" />

              <p className="text-xs italic text-stone-600 mb-4">
                Hiermit wird bescheinigt, dass
              </p>

              <div className="border-b border-stone-400 max-w-xs mx-auto pb-1 mb-2">
                <span className="text-xl font-bold text-stone-900 font-sans">
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

              <p className="text-xs leading-relaxed max-w-md mx-auto mb-6">
                den persönlichen CO₂-Fußabdruck analysiert und ein Jahresergebnis von{' '}
                <strong className="font-sans text-stone-900">{formatCO2(totalCo2)}</strong> ermittelt hat.
              </p>

              {/* Pledges box */}
              <div className="border border-stone-300 p-4 max-w-md mx-auto text-left mb-6 text-xs font-sans">
                <span className="font-bold text-stone-900 block mb-1 uppercase tracking-wider text-[10px] font-mono">
                  Persönliches Klima-Versprechen:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700 text-[11px]">
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
              </div>

              <p className="text-xs text-stone-600 mb-10">
                Prognostizierte Einsparung:{' '}
                <strong className="font-sans text-stone-900">-{formatCO2(co2Saved)} CO₂/Jahr</strong>{' '}
                (entspricht ca. {treesSaved} Bäumen).
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4 max-w-sm mx-auto text-[10px] font-mono text-stone-500">
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
