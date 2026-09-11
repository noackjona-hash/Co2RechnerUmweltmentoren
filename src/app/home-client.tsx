'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { ParticleField } from '@/components/particle-field';
import {
  Leaf,
  ArrowRight,
  Bike,
  Utensils,
  Zap,
  ShoppingBag,
  Trophy,
  Award,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { LegalFooter } from '@/components/legal-footer';

const CLIMATE_FACTS = [
  { emoji: '🚲', text: 'Wenn du 5 km mit dem Rad statt mit dem Auto fährst, sparst du rund 1 kg CO₂ ein!' },
  { emoji: '🌳', text: 'Ein einziger großer Baum nimmt pro Jahr etwa 12,5 kg CO₂ auf – ein echter Waldretter.' },
  { emoji: '🥗', text: 'Ein vegetarischer Tag pro Woche spart im Jahr so viel CO₂ wie eine lange Autofahrt quer durch Deutschland.' },
  { emoji: '💡', text: 'Licht ausschalten beim Verlassen des Zimmers spart Strom und hilft sofort dem Klima.' },
  { emoji: '👕', text: 'Lieblingskleidung länger tragen oder Second-Hand kaufen spart wertvolles Wasser und Tonnen CO₂.' },
  { emoji: '📱', text: 'Streaming über WLAN verbraucht deutlich weniger Energie als über mobile Daten unterwegs.' },
  { emoji: '🍎', text: 'Ein Apfel aus der Region hat einen viel kleineren CO₂-Rucksack als Früchte, die um die halbe Welt fliegen.' },
];

export default function HomePage() {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [stats, setStats] = useState({ totalCompleted: 0, totalSchools: 0, totalClasses: 0 });
  const [animatedCount, setAnimatedCount] = useState(0);
  const router = useRouter();

  // Fetch public stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch {
        // ignore
      }
    }
    fetchStats();
  }, []);

  // Animate counter
  useEffect(() => {
    if (stats.totalCompleted === 0) return;
    const target = stats.totalCompleted;
    const duration = 1800;
    const steps = 45;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedCount(target);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [stats.totalCompleted]);

  // Rotate climate facts
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % CLIMATE_FACTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Dieser Zugangscode wurde leider nicht gefunden.');
        setLoading(false);
        return;
      }
      router.push(data.isCompleted ? '/results' : '/quiz');
    } catch {
      setError('Verbindungsfehler. Bitte überprüfe dein Internet und versuche es erneut.');
      setLoading(false);
    }
  };

  const formatKey = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 4) return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    return clean;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      {/* Lightweight background */}
      <ParticleField />

      {/* Navigation */}
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
              Umweltmentoren
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <a
            href="/login"
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-all duration-200 border border-border/60"
          >
            Lehrkräfte-Login
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12 flex flex-col items-center text-center">
        {/* Child-friendly Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          🌱 Für Schulklassen & Umweltmentoren
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">
          Wie groß ist dein{' '}
          <span className="gradient-text">CO₂-Fußabdruck?</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
          Beantworte in rund 10 Minuten einfache Fragen zu deinem Alltag, vergleiche dich mit deiner Klasse und erhalte deine persönliche Klimaschutz-Urkunde!
        </p>

        {/* Access Code Input Box */}
        <div className="w-full max-w-md mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-card rounded-3xl p-3 shadow-xl shadow-emerald-500/5 border-2 border-emerald-500/30 dark:border-emerald-500/20 focus-within:border-emerald-500 transition-all">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full flex-1">
                  <input
                    id="access-key-input"
                    aria-label="Zugangscode für Schüler:innen"
                    type="text"
                    placeholder="XXXX-XXXX"
                    value={accessKey}
                    onChange={(e) => setAccessKey(formatKey(e.target.value))}
                    maxLength={9}
                    className="w-full px-4 py-3.5 text-center sm:text-left text-xl font-mono tracking-widest font-bold bg-transparent text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  disabled={accessKey.length < 9 || loading}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl gradient-primary text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 btn-bounce cursor-pointer shrink-0"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Loslegen
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-3 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs sm:text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Den Zugangscode erhältst du von deiner Lehrkraft.
          </p>
        </div>

        {/* Live Participants Badge */}
        {stats.totalCompleted > 0 && (
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm mb-12">
            <div className="flex -space-x-1.5">
              {['🌱', '🌍', '✨'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[11px] border border-white dark:border-slate-900"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-foreground">
              Schon <span className="text-emerald-600 dark:text-emerald-400 font-bold">{animatedCount}+</span> Schüler:innen haben mitgemacht!
            </p>
          </div>
        )}

        {/* 4 Child-Friendly Category Cards */}
        <div className="w-full max-w-3xl mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
            Die 4 Bereiche deines Alltags
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            In diesen 4 Kategorien finden wir gemeinsam deine Einsparmöglichkeiten:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                icon: <Bike className="w-6 h-6 text-sky-500" />,
                title: 'Mobilität',
                desc: 'Schulweg, Bus, Bahn & Ferien',
                bg: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/40',
              },
              {
                icon: <Utensils className="w-6 h-6 text-emerald-500" />,
                title: 'Ernährung',
                desc: 'Essen, Trinken & Snacks',
                bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40',
              },
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                title: 'Energie',
                desc: 'Heizung, Licht & Strom',
                bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
              },
              {
                icon: <ShoppingBag className="w-6 h-6 text-purple-500" />,
                title: 'Konsum',
                desc: 'Kleidung, Handy & Hobbys',
                bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40',
              },
            ].map((cat) => (
              <div
                key={cat.title}
                className={`p-4 rounded-3xl border text-left card-friendly flex flex-col justify-between ${cat.bg}`}
              >
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900/80 shadow-sm flex items-center justify-center mb-3">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-0.5">{cat.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "So einfach geht's" Step-by-Step */}
        <div className="w-full max-w-3xl mb-16">
          <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground text-center">
              So einfach funktioniert&apos;s
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mb-8">
              In drei Schritten zu deinem Ergebnis:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  icon: <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                  title: 'Code eingeben',
                  desc: 'Schnapp dir den Code von deiner Lehrkraft und tippe ihn oben ein.',
                },
                {
                  step: '2',
                  icon: <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
                  title: 'Fragen beantworten',
                  desc: 'Beantworte kurze Fragen mit Schiebereglern und bunten Kärtchen.',
                },
                {
                  step: '3',
                  icon: <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
                  title: 'Urkunde erhalten',
                  desc: 'Sieh dein Ergebnis, starte die Klassen-Challenge und drucke deine Urkunde!',
                },
              ].map((step) => (
                <div key={step.step} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mb-3">
                    {step.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    Schritt {step.step}
                  </span>
                  <h3 className="font-bold text-base text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rotating Fact Box */}
        <div className="w-full max-w-xl mb-12">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-3xl p-5 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Wusstest du schon?
              </span>
            </div>
            <div className="flex items-start gap-3 min-h-[44px]">
              <span className="text-2xl shrink-0 select-none">
                {CLIMATE_FACTS[currentFact].emoji}
              </span>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed animate-fade-in font-medium" key={currentFact}>
                {CLIMATE_FACTS[currentFact].text}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {CLIMATE_FACTS.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Fakt ${i + 1}`}
                  onClick={() => setCurrentFact(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentFact ? 'w-5 bg-emerald-500' : 'w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">⏱️ ca. 10 Minuten</span>
          <span className="flex items-center gap-1.5">🔒 100% Anonym</span>
          <span className="flex items-center gap-1.5">🎓 Für Schulen & Klassen</span>
          <span className="flex items-center gap-1.5">📜 Mit Klimaschutz-Urkunde</span>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
