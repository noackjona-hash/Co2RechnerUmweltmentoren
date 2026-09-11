'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  ArrowRight,
  Compass,
  CheckCircle2,
  Award,
  Lock,
} from 'lucide-react';
import { LegalFooter } from '@/components/legal-footer';

const CLIMATE_FACTS = [
  { text: '5 km mit dem Rad statt Auto spart rund 1 kg CO₂ ein.' },
  { text: 'Ein großer Baum bindet etwa 12,5 kg CO₂ pro Jahr.' },
  { text: 'Ein fleischfreier Tag pro Woche spart jährlich rund 350 kg CO₂.' },
  { text: 'Licht ausschalten beim Verlassen des Raumes schont sofort Energie.' },
  { text: 'Kleidung länger tragen und Second-Hand kaufen spart Wasser und CO₂.' },
  { text: 'Regionales und saisonales Obst hat einen viel kleineren CO₂-Rucksack.' },
];

export default function HomePage() {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [stats, setStats] = useState({ totalCompleted: 0, totalSchools: 0, totalClasses: 0 });
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch {
        /* ignore */
      }
    }
    fetchStats();
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
        setError(data.error || 'Dieser Code ist leider nicht gültig.');
        setLoading(false);
        return;
      }
      router.push(data.isCompleted ? '/results' : '/quiz');
    } catch {
      setError('Verbindungsfehler. Bitte überprüfe dein Netzwerk.');
      setLoading(false);
    }
  };

  const formatKey = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 4) return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    return clean;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            CO₂
          </div>
          <div>
            <span className="font-bold text-base text-foreground tracking-tight block leading-tight">
              CO₂-Rechner
            </span>
            <span className="text-xs text-muted-foreground block">
              Umweltmentoren an Schulen
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/login"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg paper-btn-secondary"
          >
            Lehrkräfte-Login
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col items-center text-center">
        {/* Paper Tag */}
        <div className="paper-badge mb-6">
          <span>Schuljahr 2025/2026</span>
          <span className="text-muted-foreground">•</span>
          <span>Klimaschutz an Schulen</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
          Dein persönlicher CO₂-Fußabdruck
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mb-8 leading-relaxed">
          Beantworte kurze Fragen zu deinem Alltag. Finde heraus, wie viel CO₂ du verursachst, vergleiche dich mit deiner Klasse und drucke deine Urkunde aus.
        </p>

        {/* Code Input Card */}
        <div className="w-full max-w-md paper-card p-6 text-left mb-8">
          <label
            htmlFor="access-key-input"
            className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
          >
            Zugangscode eingeben
          </label>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              id="access-key-input"
              type="text"
              placeholder="XXXX-XXXX"
              value={accessKey}
              onChange={(e) => setAccessKey(formatKey(e.target.value))}
              maxLength={9}
              className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={accessKey.length < 9 || loading}
              className="w-full py-3 rounded-xl paper-btn-primary text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Überprüfe Code...'
              ) : (
                <>
                  Quiz starten
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Den 8-stelligen Code erhältst du von deiner Lehrkraft.</span>
          </div>
        </div>

        {/* Quick Stats Line */}
        {stats.totalCompleted > 0 && (
          <p className="text-xs text-muted-foreground mb-12">
            Bereits <strong className="text-foreground font-semibold">{stats.totalCompleted}</strong> Schüler:innen haben an diesem Rechner teilgenommen.
          </p>
        )}

        {/* 4 Categories Overview (Notebook style) */}
        <div className="w-full text-left mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
            Die 4 Bereiche des Fragebogens
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { title: 'Mobilität', desc: 'Schulweg & Reisen' },
              { title: 'Ernährung', desc: 'Essen & Trinken' },
              { title: 'Energie', desc: 'Heizung & Strom' },
              { title: 'Konsum', desc: 'Kleidung & Medien' },
            ].map((cat, idx) => (
              <div key={cat.title} className="paper-card p-3.5">
                <span className="text-xs font-mono text-muted-foreground block mb-1">
                  0{idx + 1}
                </span>
                <h3 className="font-bold text-sm text-foreground mb-0.5">{cat.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-snug">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works (Clean minimal 3 steps) */}
        <div className="w-full text-left mb-12 paper-card p-6 sm:p-7">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Ablauf
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                step: '1',
                title: 'Code eingeben',
                desc: 'Tippe deinen 8-stelligen Schüler-Code ein.',
              },
              {
                step: '2',
                title: 'Fragen beantworten',
                desc: 'Dauert ca. 10 Minuten. Alles ist 100% anonym.',
              },
              {
                step: '3',
                title: 'Urkunde erhalten',
                desc: 'Erfahre deinen Wert und drucke deine Urkunde.',
              },
            ].map((s) => (
              <div key={s.step} className="space-y-1">
                <span className="text-xs font-bold text-primary block">
                  Schritt {s.step}
                </span>
                <h3 className="font-bold text-sm text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Climate Note Box */}
        <div className="w-full text-left paper-card p-4 border-l-4 border-l-primary flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-0.5">
              Notiz zum Klimaschutz
            </span>
            <p className="text-xs text-foreground leading-relaxed">
              {CLIMATE_FACTS[currentFact].text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentFact((prev) => (prev + 1) % CLIMATE_FACTS.length)}
            className="text-xs text-muted-foreground hover:text-foreground font-semibold shrink-0 cursor-pointer pt-0.5"
          >
            Nächster Tipp →
          </button>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
