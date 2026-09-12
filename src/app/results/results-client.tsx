'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES,
  NATIONAL_AVERAGE_CO2,
  CLIMATE_TARGET_CO2,
  CO2_BASE_PAUSCHALEN,
  TOTAL_BASE_PAUSCHALE,
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

  const simulatedCategoryTotals: Record<string, number> = {
    mobility: categoryTotals.mobility || CO2_BASE_PAUSCHALEN.mobility,
    food: categoryTotals.food || CO2_BASE_PAUSCHALEN.food,
    energy: categoryTotals.energy || CO2_BASE_PAUSCHALEN.energy,
    consumption: categoryTotals.consumption || CO2_BASE_PAUSCHALEN.consumption,
    public: categoryTotals.public || CO2_BASE_PAUSCHALEN.public,
  };

  const variableFood = Math.max(0, (categoryTotals.food || 0) - CO2_BASE_PAUSCHALEN.food);
  const variableMobility = Math.max(0, (categoryTotals.mobility || 0) - CO2_BASE_PAUSCHALEN.mobility);
  const variableEnergy = Math.max(0, (categoryTotals.energy || 0) - CO2_BASE_PAUSCHALEN.energy);
  const variableConsumption = Math.max(0, (categoryTotals.consumption || 0) - CO2_BASE_PAUSCHALEN.consumption);

  let foodReduction = 0;
  if (pledges.vegan) foodReduction = Math.max(350, variableFood * 0.55);
  else if (pledges.vegetarian) foodReduction = Math.max(250, variableFood * 0.38);
  if (pledges.bioRegional) foodReduction += Math.max(80, variableFood * 0.12);
  simulatedCategoryTotals.food = Math.max(CO2_BASE_PAUSCHALEN.food, (categoryTotals.food || 0) - foodReduction);

  let mobilityReduction = 0;
  if (pledges.activeTransit) mobilityReduction += Math.max(140, variableMobility * 0.35);
  if (pledges.noFlights) mobilityReduction += Math.max(400, variableMobility * 0.6);
  simulatedCategoryTotals.mobility = Math.max(CO2_BASE_PAUSCHALEN.mobility, (categoryTotals.mobility || 0) - mobilityReduction);

  let energyReduction = 0;
  if (pledges.greenPower) energyReduction += Math.max(280, variableEnergy * 0.3);
  if (pledges.lowerHeating) energyReduction += Math.max(120, variableEnergy * 0.15);
  simulatedCategoryTotals.energy = Math.max(CO2_BASE_PAUSCHALEN.energy, (categoryTotals.energy || 0) - energyReduction);

  let consumptionReduction = 0;
  if (pledges.secondHand) consumptionReduction += Math.max(180, variableConsumption * 0.35);
  if (pledges.digitalReduction) consumptionReduction += Math.max(80, variableConsumption * 0.18);
  simulatedCategoryTotals.consumption = Math.max(CO2_BASE_PAUSCHALEN.consumption, (categoryTotals.consumption || 0) - consumptionReduction);

  const simulatedTotalCo2 = Object.values(simulatedCategoryTotals).reduce((sum, v) => sum + v, 0);
  const co2Saved = Math.max(0, totalCo2 - simulatedTotalCo2);
  const treesSaved = Math.round(co2Saved / 12.5);

  const getRating = () => {
    if (totalCo2 <= CLIMATE_TARGET_CO2) {
      return { label: 'Klimaziel erreicht', desc: 'Vorbildlich · Unter 2.000 kg CO₂ pro Jahr' };
    }
    if (totalCo2 <= 6500) {
      return { label: 'Sehr sparsam', desc: 'Deutlich unter dem Bundesdurchschnitt' };
    }
    if (totalCo2 <= NATIONAL_AVERAGE_CO2) {
      return { label: 'Unter Bundesdurchschnitt', desc: `Unter den durchschnittlichen ${formatCO2(NATIONAL_AVERAGE_CO2)}` };
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
    public: [
      'Gemeinsame Klimaschutz-Aktionen an der Schule planen.',
      'Fahrradfreundliche Schulwege bei der Gemeinde anregen.',
      'Kommunale Nachhaltigkeitsprojekte und Energiewende unterstützen.',
    ],
  };

  const renderCertificateMarkup = () => (
    <div className="border-2 sm:border-4 border-double border-stone-800 p-4 sm:p-12 text-center bg-white text-stone-900 font-serif">
      <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-stone-600 block mb-1.5 sm:mb-2">
        Umweltmentoren Baden-Württemberg
      </span>
      <h2 className="text-xl sm:text-3xl font-bold tracking-wider text-stone-900 mb-1">
        KLIMASCHUTZ-URKUNDE
      </h2>
      <div className="w-12 sm:w-16 h-0.5 bg-stone-900 mx-auto my-2 sm:my-4" />

      <p className="text-[11px] sm:text-xs italic text-stone-700 mb-2.5 sm:mb-4">
        Hiermit wird bescheinigt, dass
      </p>

      <div className="border-b-2 border-stone-400 max-w-xs mx-auto pb-1 mb-1.5 sm:mb-2">
        <span className="text-base sm:text-xl font-bold text-stone-900 font-sans tracking-wide">
          {studentName.trim() || '_______________________'}
        </span>
      </div>
      <p className="text-[11px] sm:text-xs text-stone-600 mb-4 sm:mb-6 font-sans">
        {customSchoolName.trim()
          ? customSchoolName.trim()
          : results.isGuest
          ? 'Freie Gast-Teilnahme'
          : results.className ? `Klasse: ${results.className}` : 'Schulgemeinschaft'}
      </p>

      <p className="text-[11px] sm:text-xs leading-relaxed max-w-md mx-auto mb-4 sm:mb-6 text-stone-800">
        den persönlichen CO₂-Fußabdruck analysiert und ein Jahresergebnis von{' '}
        <strong className="font-sans text-stone-900 font-bold">{formatCO2(totalCo2)}</strong> ermittelt hat.
      </p>

      {/* Pledges box */}
      {Object.values(pledges).some(Boolean) ? (
        <div className="border border-stone-400 p-3 sm:p-4 max-w-md mx-auto text-left mb-4 sm:mb-6 text-xs font-sans bg-stone-50/50">
          <span className="font-bold text-stone-900 block mb-1 uppercase tracking-wider text-[10px] font-mono">
            Persönliches Klima-Versprechen:
          </span>
          <ul className="list-disc list-inside space-y-1 text-stone-800 text-[10px] sm:text-[11px]">
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
            <p className="text-[11px] sm:text-xs text-stone-700 mt-2.5 pt-2 border-t border-stone-300 font-medium">
              Prognostizierte Einsparung:{' '}
              <strong className="font-bold text-stone-900">-{formatCO2(co2Saved)} CO₂/Jahr</strong>{' '}
              (ca. {treesSaved} {treesSaved === 1 ? 'Baum' : 'Bäume'}).
            </p>
          )}
        </div>
      ) : (
        <div className="border border-stone-400 p-3 sm:p-4 max-w-md mx-auto text-center mb-4 sm:mb-6 text-xs font-sans bg-stone-50/50">
          <span className="font-bold text-stone-900 block mb-1 uppercase tracking-wider text-[10px] font-mono">
            Auszeichnung für Engagement
          </span>
          <p className="text-[10px] sm:text-[11px] text-stone-700 leading-relaxed">
            Ausgezeichnet für die erfolgreiche Reflexion des Alltagsverbrauchs und den aktiven Beitrag zum Klimabewusstsein an der Schule.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-4 sm:pt-6 max-w-sm mx-auto text-[9px] sm:text-[10px] font-mono text-stone-600">
        <div className="border-t border-stone-400 pt-1">
          Datum: {new Date().toLocaleDateString('de-DE')}
        </div>
        <div className="border-t border-stone-400 pt-1">Unterschrift Lehrkraft / Mentor:in</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col justify-between pb-12 bg-background">
      {/* Minimal Header */}
      <header className="w-full border-b border-border bg-background sticky top-0 z-30 print:hidden">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-foreground truncate">
              CO₂-Auswertung
            </span>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs text-muted-foreground truncate max-w-[85px] min-[360px]:max-w-[120px] sm:max-w-none">
              {results.isGuest ? 'Gast' : results.className ? `Klasse ${results.className}` : 'Schüler'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowCertificate(true)}
              className="paper-btn-primary text-xs flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[44px]"
              title="Urkunde erstellen & drucken"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Urkunde drucken</span>
              <span className="sm:hidden">Urkunde</span>
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="paper-btn-secondary text-xs px-2 sm:px-2.5 py-1.5 min-h-[36px] sm:min-h-[44px]"
              title="Abmelden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-10 flex-1 w-full space-y-4 sm:space-y-6">
        {/* Scorecard Hero Banner */}
        <article className="paper-sheet p-5 sm:p-12 text-center space-y-3 sm:space-y-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-mono block">
            Dein persönlicher CO₂-Fußabdruck
          </span>

          <div className="text-3xl min-[360px]:text-4xl sm:text-6xl font-mono font-semibold text-foreground tracking-tight py-1">
            {formatCO2(animatedTotal)}
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-foreground">
              {rating.label}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground max-w-sm mx-auto">
              {rating.desc}
            </p>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full sm:w-auto paper-btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 font-medium min-h-[42px] sm:min-h-[44px]"
            >
              <Award className="w-4 h-4" />
              <span>Urkunde erstellen & anpassen</span>
            </button>
          </div>
        </article>

        {/* 3 Meaningful Equivalents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="paper-sheet p-3.5 sm:p-5 space-y-1 text-left">
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Kompensation
            </span>
            <div className="text-xl sm:text-2xl font-mono font-semibold text-foreground tracking-tight">
              {Math.round(totalCo2 / 12.5)} Bäume
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
              notwendig zur jährlichen Bindung dieser Emissionen
            </p>
          </div>

          <div className="paper-sheet p-3.5 sm:p-5 space-y-1 text-left">
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Mobilität
            </span>
            <div className="text-xl sm:text-2xl font-mono font-semibold text-foreground tracking-tight">
              {(totalCo2 / 0.15 / 1000).toFixed(0)}.000 km
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
              Fahrtstrecke mit einem durchschnittlichen Benziner-PKW
            </p>
          </div>

          <div className="paper-sheet p-3.5 sm:p-5 space-y-1 text-left">
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Ernährung
            </span>
            <div className="text-xl sm:text-2xl font-mono font-semibold text-foreground tracking-tight">
              {Math.round(totalCo2 / 3.6)} Portionen
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
              äquivalente durchschnittliche Fleischmahlzeiten
            </p>
          </div>
        </div>

        {/* Mobile First Segmented Navigation Tabs */}
        <div className="grid grid-cols-3 p-1 bg-muted/60 rounded-xl border border-border text-[11px] sm:text-xs text-center font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`py-2 px-0.5 sm:px-1 rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'analysis'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analyse
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`py-2 px-0.5 sm:px-1 rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'simulator'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('challenge')}
            className={`py-2 px-0.5 sm:px-1 rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'challenge'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Vergleich
          </button>
        </div>

        {/* TAB 1: ANALYSE */}
        {activeTab === 'analysis' && (
          <div className="space-y-4 sm:space-y-6">
            {/* UBA Pauschale Explanatory Banner */}
            <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-start sm:items-center gap-2.5">
                <span className="font-mono text-[10px] font-bold text-foreground bg-background border border-border px-2 py-0.5 rounded shrink-0 uppercase tracking-wide">
                  UBA-Standard
                </span>
                <span className="text-[11px] sm:text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  Dein Gesamtergebnis enthält eine <strong>wissenschaftliche Grundpauschale (4,4 t)</strong>: 1.200 kg für öffentliche Infrastruktur (Straßen, Schulen, Krankenhäuser) sowie Sockelbeträge für Grundbedarfe in Wohnen, Ernährung und Konsum.
                </span>
              </div>
              <span className="font-mono text-xs text-foreground font-semibold shrink-0 bg-background/80 px-2 py-1 rounded border border-border">
                +4.400 kg Pauschale
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              <div className="paper-sheet p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Anteile nach Bereich
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Tortendiagramm</span>
                </div>
                <CategoryPieChart data={pieData} />
              </div>

              <div className="paper-sheet p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Vergleichswerte
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Benchmark</span>
                </div>
                <ComparisonBarChart data={comparisonData} />
              </div>
            </div>

            {/* 5 Category Cards with Clean Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {Object.entries(categoryTotals).map(([key, value]) => {
                const cat = CATEGORIES[key as Category];
                if (!cat) return null;
                const percent = Math.round((Math.max(0, value) / Math.max(1, totalCo2)) * 100);

                return (
                  <div key={key} className="paper-sheet p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                        {cat.label}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground ml-1 shrink-0">{percent}%</span>
                    </div>
                    <div className="text-base sm:text-lg font-mono font-semibold text-foreground">
                      {formatCO2(Math.max(0, value))}
                    </div>
                    <div>
                      <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Practical Recommendations */}
            <div className="paper-sheet p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="border-b border-border pb-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Empfehlungen
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                    Gezielte Praxistipps für {CATEGORIES[highestCategory]?.label}
                  </h3>
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-muted-foreground shrink-0 ml-2">
                  Größter Hebel
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 sm:gap-3">
                {tips[highestCategory]?.map((tip, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-border bg-background text-xs text-foreground leading-relaxed flex items-start gap-2"
                  >
                    <span className="font-mono text-muted-foreground text-xs">{i + 1}.</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Call-to-Action */}
            <article className="paper-sheet p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Offizieller Nachweis
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  Deine persönliche Klimaschutz-Urkunde
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground max-w-lg">
                  Erstelle dein Zertifikat mit deinen Ergebnissen und deinen Zielen zum Ausdrucken oder als PDF.
                </p>
              </div>
              <button
                onClick={() => setShowCertificate(true)}
                className="paper-btn-primary text-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] sm:min-h-[44px]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Urkunde erstellen & drucken</span>
              </button>
            </article>
          </div>
        )}

        {/* TAB 2: SIMULATOR & URKUNDE */}
        {activeTab === 'simulator' && (
          <div className="space-y-4 sm:space-y-6">
            <article className="paper-sheet p-4 sm:p-8 space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-3 sm:pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                    Klimaschutz-Versprechen & Simulator
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                    Wähle Maßnahmen aus, die du im Alltag umsetzen möchtest, und sieh den Effekt live.
                  </p>
                </div>

                <button
                  onClick={() => setShowCertificate(true)}
                  className="paper-btn-primary text-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] sm:min-h-[44px]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Urkunde drucken</span>
                </button>
              </div>

              {/* Dynamic Savings Display */}
              <div className="p-3.5 sm:p-5 rounded-lg border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-0.5">
                    Prognostizierte Einsparung
                  </span>
                  <div className="text-xl sm:text-2xl font-mono font-semibold text-foreground">
                    -{formatCO2(co2Saved)} / Jahr
                  </div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground block mt-0.5">
                    Neuer Ausstoß: {formatCO2(simulatedTotalCo2)} (Ausgang: {formatCO2(totalCo2)})
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 rounded-lg bg-background border border-border text-center flex-1 sm:flex-initial sm:min-w-[110px]">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block uppercase font-mono">
                      Entlastung
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-foreground">
                      ca. {treesSaved} {treesSaved === 1 ? 'Baum' : 'Bäume'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="paper-btn-primary text-xs flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-3 min-h-[38px]"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Auf Urkunde</span>
                  </button>
                </div>
              </div>

              {/* Interactive Checklist */}
              <div className="space-y-1.5 sm:space-y-2 pt-1">
                {[
                  { key: 'vegetarian', title: 'Vegetarische Ernährung', desc: 'Ca. 33% weniger Emissionen bei Lebensmitteln.' },
                  { key: 'vegan', title: 'Vegane Ernährung', desc: 'Ca. 45% weniger Emissionen bei Lebensmitteln.' },
                  { key: 'bioRegional', title: 'Regionale & saisonale Lebensmittel', desc: 'Ca. 10% Einsparung durch kurze Transportwege.' },
                  { key: 'activeTransit', title: 'Schulweg zu Fuß oder mit dem Rad', desc: 'Ca. 30% weniger Alltagsmobilität.' },
                  { key: 'noFlights', title: 'Urlaub ohne Flugreisen', desc: 'Bis zu 50% weniger persönliche Mobilitätsemissionen.' },
                  { key: 'greenPower', title: '100% Ökostrom zu Hause', desc: 'Spart durchschnittlich 300 kg CO₂.' },
                  { key: 'lowerHeating', title: 'Heizung um 1–2 Grad senken', desc: 'Spart rund 12% der persönlichen Heizenergie.' },
                  { key: 'secondHand', title: 'Second-Hand-Kleidung bevorzugen', desc: 'Spart bis zu 40% der textilen Konsum-Emissionen.' },
                  { key: 'digitalReduction', title: 'Bewusster Umgang mit Geräten', desc: 'Spart ca. 20% digitaler Emissionen.' },
                ].map((item) => {
                  const isChecked = (pledges as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`p-2.5 sm:p-3.5 rounded-lg border flex items-start gap-2.5 sm:gap-3.5 cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'border-foreground bg-muted font-medium text-foreground'
                          : 'border-border bg-background hover:bg-muted/40 text-foreground'
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
                        className="mt-0.5 accent-foreground rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block text-xs">{item.title}</span>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground block mt-0.5 leading-snug">{item.desc}</span>
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
          <div className="space-y-4 sm:space-y-6">
            <article className="paper-sheet p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="border-b border-border pb-2.5">
                <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Schul-Übersicht
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  Klassen-Rangliste der Schule
                </h3>
              </div>

              {results.isGuest ? (
                <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-muted/40 space-y-1.5 text-xs">
                  <span className="font-medium text-foreground block">
                    Gast-Teilnahme · Keine Schulklasse zugeordnet
                  </span>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                    Da du diesen Rechner im freien Gast-Modus nutzt, nimmst du an keinem internen Klassenwettbewerb teil.
                    Im Reiter <strong>Analyse</strong> siehst du den direkten Vergleich deiner Werte mit dem Bundesdurchschnitt (10,8 t) und dem Pariser Klimaziel (unter 2 t).
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {results.schoolLeaderboard?.map((entry, index) => {
                    const isOwn = entry.className === results.className;
                    const rankMedal = index === 0 ? '1.' : index === 1 ? '2.' : index === 2 ? '3.' : `${index + 1}.`;

                    return (
                      <div
                        key={entry.classId}
                        className={`p-2.5 sm:p-3.5 flex items-center justify-between text-xs transition-colors ${
                          isOwn ? 'bg-muted font-medium text-foreground' : 'bg-background hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <span className="w-5 sm:w-6 text-center font-mono font-semibold text-xs text-muted-foreground shrink-0">
                            {rankMedal}
                          </span>
                          <div className="min-w-0">
                            <span className="text-foreground block font-medium truncate">
                              {entry.className} {isOwn && '(Deine Klasse)'}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-muted-foreground block truncate">
                              {entry.completedCount} von {entry.totalCount} abgeschlossen
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono font-medium text-foreground shrink-0 ml-2">
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

      {/* Dedicated Print-Only Document - Always in DOM for Ctrl+P and print dialogs */}
      <div id="print-certificate-document" className="hidden print:block">
        {renderCertificateMarkup()}
      </div>

      {/* On-Screen Interactive Certificate Modal */}
      {showCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCertificate(false);
          }}
        >
          <div className="w-full max-w-xl bg-card p-3.5 sm:p-8 border border-border rounded-2xl relative shadow-2xl my-auto">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute right-3 top-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Customization controls */}
            <div className="mb-4 space-y-3 text-xs pr-6 sm:pr-0">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-foreground shrink-0" />
                  <h3 className="font-semibold text-foreground text-xs sm:text-sm truncate">
                    Urkunde anpassen & drucken
                  </h3>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground shrink-0">Vorschau live</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-muted-foreground mb-1">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Vor- und Nachname"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full h-9 sm:h-10 px-2.5 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-muted-foreground mb-1">
                    Schule / Klasse (optional)
                  </label>
                  <input
                    type="text"
                    placeholder={results.isGuest ? 'Schule / Wohnort' : results.className || 'Klasse'}
                    value={customSchoolName}
                    onChange={(e) => setCustomSchoolName(e.target.value)}
                    className="w-full h-9 sm:h-10 px-2.5 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setShowCertificate(false)}
                  className="paper-btn-secondary text-xs px-3 min-h-[38px]"
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="paper-btn-primary text-xs flex items-center gap-1.5 px-3 min-h-[38px] cursor-pointer font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Drucken / PDF</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="overflow-x-auto rounded-xl border border-border">
              {renderCertificateMarkup()}
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <LegalFooter />
      </div>
    </div>
  );
}
