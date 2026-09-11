'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowRight, Lock } from 'lucide-react';
import { LegalFooter } from '@/components/legal-footer';

export default function HomePage() {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [guestLoading, setGuestLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col justify-between">
      {/* Editorial Top Bar */}
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Umweltmentoren
            </span>
            <span className="text-border">/</span>
            <span className="font-serif text-sm font-semibold text-foreground">
              CO₂-Rechner
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="/login"
              className="paper-btn-secondary text-xs"
            >
              Lehrkräfte-Login
            </a>
          </div>
        </div>
      </header>

      {/* Main Paper Worksheet */}
      <main className="max-w-xl w-full mx-auto px-4 py-12 sm:py-16 flex-1 flex flex-col justify-center">
        <article className="paper-sheet p-6 sm:p-10 relative">
          {/* Top Document Header Line */}
          <div className="border-b border-border pb-4 mb-6 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Fragebogen · Schuljahr 2025/2026</span>
            <span>Formular UM-CO₂</span>
          </div>

          {/* Document Title */}
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-foreground tracking-tight">
              Erfassung des persönlichen CO₂-Fußabdrucks
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ermittle deinen jährlichen Ausstoß in den Bereichen Mobilität, Ernährung, Energie und Konsum. Die Erhebung erfolgt vollständig anonym.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="access-key-input"
                className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5"
              >
                Schüler-Zugangscode (8 Stellen)
              </label>
              <input
                id="access-key-input"
                type="text"
                placeholder="XXXX-XXXX"
                value={accessKey}
                onChange={(e) => setAccessKey(formatKey(e.target.value))}
                maxLength={9}
                className="w-full px-4 py-3 text-center text-xl font-mono font-semibold tracking-widest bg-muted/40 border border-border rounded-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
                autoComplete="off"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={accessKey.length < 9 || loading}
              className="w-full py-3 paper-btn-primary"
            >
              {loading ? (
                'Überprüfe...'
              ) : (
                <>
                  Fragebogen starten
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 border border-destructive/30 bg-destructive/5 text-destructive text-xs font-mono">
              {error}
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Den 8-stelligen Code erhältst du von deiner Lehrkraft.</span>
          </div>

          {/* Guest Access Callout */}
          <div className="mt-5 pt-4 border-t border-border flex flex-col items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Kein Code vorhanden?
            </span>
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="paper-btn-secondary text-xs w-full sm:w-auto"
            >
              {guestLoading ? 'Bereite Gast-Sitzung vor...' : 'Ohne Code als Gast ausprobieren →'}
            </button>
          </div>

          {/* Subtle Perforation Divider */}
          <div className="my-8 border-t border-dashed border-border" />

          {/* Compact Footnote / Guide */}
          <div className="space-y-2 text-[11px] text-muted-foreground">
            <div className="flex items-center justify-between font-mono">
              <span>Themenbereiche:</span>
              <span className="text-foreground">01 Mobilität · 02 Ernährung · 03 Energie · 04 Konsum</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Dauer:</span>
              <span>ca. 8–10 Minuten</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Abschluss:</span>
              <span>Druckbare Urkunde & Zertifikat</span>
            </div>
          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
