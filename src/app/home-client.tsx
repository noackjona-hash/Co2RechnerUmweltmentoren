'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  ArrowRight,
  Sparkles,
  School,
  Compass,
  Bike,
  Utensils,
  Zap,
  ShoppingBag,
  Award,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { LegalFooter } from '@/components/legal-footer';

export default function HomePage() {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const router = useRouter();

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/guest-login', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Starten der Gast-Sitzung.');
        setGuestLoading(false);
        return;
      }
      router.push('/quiz');
    } catch {
      setError('Verbindungsfehler.');
      setGuestLoading(false);
    }
  };

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
        setError(data.error || 'Dieser Code ist leider nicht gültig. Bitte überprüfe deine Eingabe.');
        setLoading(false);
        return;
      }
      router.push(data.isCompleted ? '/results' : '/quiz');
    } catch {
      setError('Verbindungsfehler. Bitte überprüfe deine Internetverbindung.');
      setLoading(false);
    }
  };

  const formatKey = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 4) return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    return clean;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      {/* Modern Top Navigation Bar */}
      <header className="w-full border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              UM
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground tracking-tight block">
                Umweltmentoren
              </span>
              <span className="text-[11px] text-muted-foreground block">
                CO₂-Rechner für Schulen & Jugendliche
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="paper-btn-secondary text-xs flex items-center gap-1.5"
            >
              <School className="w-3.5 h-3.5 text-emerald-600" />
              <span>Schul- & Lehrkräfteportal</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 space-y-12">
        {/* Welcome Headline & Tag */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Klimabildung · 100% Anonym & Kostenfrei</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Wie groß ist dein persönlicher <span className="text-emerald-600 dark:text-emerald-400">CO₂-Fußabdruck?</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Finde spielerisch heraus, wie viel CO₂ dein Alltag in Mobilität, Ernährung, Energie und Konsum verursacht – und erhalte eine persönliche Klimaschutz-Urkunde.
          </p>
        </div>

        {/* Action Cards (Student Access & Guest Mode) */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card A: Student Login with Code */}
          <article className="paper-sheet p-6 sm:p-8 space-y-5 border-emerald-500/30 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-mono">
                  Für Schüler:innen
                </span>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Schulklasse
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Mit Schulcode teilnehmen
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gib den 8-stelligen Code ein, den du von deiner Lehrkraft oder Mentor:in erhalten hast.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  id="access-key-input"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(formatKey(e.target.value))}
                  maxLength={9}
                  className="w-full px-4 py-3 text-center text-xl font-mono font-bold tracking-widest bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoComplete="off"
                />
              </div>

              {error && (
                <p className="text-xs text-destructive text-center font-medium bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={accessKey.length < 9 || loading}
                className="w-full py-3 paper-btn-primary"
              >
                {loading ? 'Wird geprüft...' : 'Quiz jetzt starten →'}
              </button>
            </form>
          </article>

          {/* Card B: Free Guest Mode & Exploration */}
          <article className="paper-sheet p-6 sm:p-8 space-y-5 flex flex-col justify-between bg-card">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Gast-Zugang
                </span>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Ohne Registrierung
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Frei & ohne Code ausprobieren
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ideal für Lehrkräfte zur Unterrichtsvorbereitung, Eltern oder Interessierte, die keinen Schulcode besitzen.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground space-y-1.5 font-sans">
                <div className="flex items-center gap-2 text-foreground font-medium text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vollständiger Zugriff auf alle Fragen</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jahresbilanz, Tipps & Urkunde drucken</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={guestLoading}
                className="w-full py-3 paper-btn-secondary"
              >
                {guestLoading ? 'Gast-Sitzung startet...' : 'Ohne Code als Gast testen →'}
              </button>
            </div>
          </article>
        </div>

        {/* 4 Life Categories Grid */}
        <div className="space-y-4 pt-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-wider font-mono">
              Die 4 Säulen deines Fußabdrucks
            </h3>
            <p className="text-xs text-muted-foreground">
              Der Rechner erfasst deinen Alltag fundiert und jugendgerecht in vier Kernbereichen.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="paper-sheet p-4 space-y-2 hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Mobilität</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Schulweg, Fahrrad, ÖPNV, Moped, Eltern-Taxi und Urlaubsreisen.
              </p>
            </div>

            <div className="paper-sheet p-4 space-y-2 hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Ernährung</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fleisch, vegetarisch, vegan, regionale Lebensmittel und Essensverschwendung.
              </p>
            </div>

            <div className="paper-sheet p-4 space-y-2 hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Energie</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Heizung, Warmwasser, Zimmerbeleuchtung und Ökostrom im Haushalt.
              </p>
            </div>

            <div className="paper-sheet p-4 space-y-2 hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Konsum</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kleidung, Elektronik, Smartphones, Streaming-Zeit und Hobbys.
              </p>
            </div>
          </div>
        </div>

        {/* Teacher & School Banner */}
        <div className="paper-sheet p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-emerald-500/20 bg-linear-to-r from-emerald-500/5 via-card to-card">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <Award className="w-3 h-3" />
              <span>Für Schulen & Umweltmentor:innen</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Eigene Klassen anlegen & Auswertungen durchführen
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Erstelle Klassen, weise Lehrkräfte zu, erzeuge Zugangscodes oder Direktlinks und sieh anonyme Statistiken im Klassen- und Schulvergleich ein.
            </p>
          </div>

          <Link
            href="/login"
            className="paper-btn-primary text-xs shrink-0 flex items-center gap-2"
          >
            <School className="w-3.5 h-3.5" />
            <span>Zum Schulportal</span>
          </Link>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
