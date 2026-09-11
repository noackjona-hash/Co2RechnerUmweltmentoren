'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { LegalFooter } from '@/components/legal-footer';

export function JoinClient({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function directLogin() {
      if (!code) return;
      try {
        const res = await fetch('/api/auth/student-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessKey: code }),
        });
        const data = await res.json();
        if (res.ok) {
          router.push(data.isCompleted ? '/results' : '/quiz');
        } else {
          setError(data.error || 'Ungültiger Zugangscode.');
          setLoading(false);
        }
      } catch {
        setError('Verbindungsfehler beim Einloggen.');
        setLoading(false);
      }
    }
    directLogin();
  }, [code, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-background">
        <header className="w-full border-b border-border bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
            <span className="font-serif text-sm font-semibold text-foreground">CO₂-Rechner</span>
            <span className="text-muted-foreground uppercase tracking-widest text-[11px]">Direktzugang</span>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center text-center">
          <article className="paper-sheet p-8 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider animate-pulse">
              Direktzugang wird geprüft...
            </div>
            <p className="font-mono text-sm text-foreground">
              Code: <strong className="font-semibold">{code}</strong>
            </p>
          </article>
        </main>

        <LegalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
          <Link href="/" className="paper-btn-secondary text-xs">
            <ArrowLeft className="w-3 h-3" />
            <span>Zur Startseite</span>
          </Link>
          <span className="font-serif text-sm font-semibold text-foreground">CO₂-Rechner</span>
        </div>
      </header>

      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <article className="paper-sheet p-6 sm:p-8 space-y-5 text-center">
          <div className="border-b border-border pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Direktzugang</span>
            <span>Status: Fehler</span>
          </div>

          <div className="w-10 h-10 border border-destructive/40 bg-destructive/5 text-destructive rounded-sm mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-serif font-normal text-foreground">
              Ungültiger Einladungslink
            </h1>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              {error || `Der Zugangscode ${code} konnte nicht gefunden werden.`}
            </p>
          </div>

          <div className="pt-2">
            <Link href="/" className="paper-btn-primary w-full text-xs">
              Code manuell eingeben →
            </Link>
          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
