'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
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
      {/* Minimal Top Bar */}
      <header className="w-full border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              CO₂-Rechner
            </span>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs text-muted-foreground">
              Umweltmentoren
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Schulportal
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="max-w-xl w-full mx-auto px-4 py-16 sm:py-24 flex-1 flex flex-col justify-center space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            CO₂-Rechner für Schulen
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Erfasse deinen persönlichen ökologischen Fußabdruck in Mobilität, Ernährung, Energie und Konsum.
          </p>
        </div>

        {/* Central Clean Code Input Box */}
        <div className="paper-sheet p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label htmlFor="access-key-input" className="block text-xs font-medium text-foreground">
                Schüler-Zugangscode
              </label>
              <input
                id="access-key-input"
                type="text"
                placeholder="XXXX-XXXX"
                value={accessKey}
                onChange={(e) => setAccessKey(formatKey(e.target.value))}
                maxLength={9}
                autoFocus
                className="w-full px-4 py-3 text-center text-lg font-mono font-medium tracking-widest bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground transition-colors"
                autoComplete="off"
              />
              <span className="text-[11px] text-muted-foreground block text-center">
                Den 8-stelligen Code erhältst du von deiner Lehrkraft.
              </span>
            </div>

            {error && (
              <p className="text-xs text-destructive text-center font-medium p-2 rounded-md bg-destructive/10 border border-destructive/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={accessKey.length < 9 || loading}
              className="w-full py-2.5 paper-btn-primary text-xs"
            >
              {loading ? 'Wird geprüft...' : 'Fragebogen starten →'}
            </button>
          </form>

          <div className="pt-4 border-t border-border text-center space-y-2">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {guestLoading ? 'Gast-Sitzung startet...' : 'Kein Code vorhanden? Als Gast ausprobieren →'}
            </button>
          </div>
        </div>

        {/* Quiet 4 Categories Overview */}
        <div className="pt-6 border-t border-border/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground block">01</span>
              <h3 className="text-xs font-semibold text-foreground">Mobilität</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Schulweg, Fahrrad, ÖPNV und Reisen.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground block">02</span>
              <h3 className="text-xs font-semibold text-foreground">Ernährung</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Mahlzeiten, Fleisch, pflanzliche Kost.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground block">03</span>
              <h3 className="text-xs font-semibold text-foreground">Energie</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Strom, Heizung und Warmwasser im Alltag.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground block">04</span>
              <h3 className="text-xs font-semibold text-foreground">Konsum</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Kleidung, Geräte, Streaming und Hobbys.
              </p>
            </div>
          </div>
        </div>

        {/* Small School Teacher Note */}
        <div className="text-center text-xs text-muted-foreground">
          Für Lehrkräfte: Im{' '}
          <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-muted-foreground">
            Schulportal
          </Link>{' '}
          kannst du Klassen anlegen, Lehrkräfte zuweisen und Codes exportieren.
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
