'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Leaf, ArrowRight, TreePine, Zap, ShoppingBag, UtensilsCrossed } from 'lucide-react';

export default function HomePage() {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

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
        setError(data.error || 'Fehler beim Anmelden.');
        setLoading(false);
        return;
      }

      if (data.isCompleted) {
        router.push('/results');
      } else {
        router.push('/quiz');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
      setLoading(false);
    }
  };

  const formatKey = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 4) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    }
    return clean;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-400/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-400/20 dark:bg-teal-400/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-400/15 dark:bg-cyan-400/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-20 dark:opacity-10 animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + i}s`,
            }}
          >
            {['🌿', '🌍', '🌱', '💨', '☀️', '🍃'][i]}
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            CO<span className="text-xs align-super">2</span> Rechner
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-xl glass hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
          >
            Anmelden
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-20 md:pt-20 max-w-4xl mx-auto">
        <div className="animate-slide-up text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Für Umweltmentoren an Schulen
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Was ist dein
            <br />
            <span className="gradient-text">CO₂-Fußabdruck</span>
            <span className="text-emerald-500">?</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Finde in nur 10 Minuten heraus, wie viel CO₂ du pro Jahr verursachst.
            Vergleiche dich mit dem Durchschnitt und entdecke, wo du am meisten bewirken kannst.
          </p>
        </div>

        {/* Access Key Input */}
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="relative">
            <div className="glass-strong rounded-2xl p-2 shadow-2xl shadow-emerald-500/10">
              <div className="flex items-center gap-2">
                <input
                  id="access-key-input"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(formatKey(e.target.value))}
                  maxLength={9}
                  className="flex-1 px-4 py-3.5 text-lg font-mono tracking-widest text-center bg-transparent rounded-xl placeholder:text-muted-foreground/40 focus:outline-none"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={accessKey.length < 9 || loading}
                  className="px-5 py-3.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Start
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-400 text-center animate-fade-in">
              {error}
            </p>
          )}

          <p className="mt-4 text-sm text-muted-foreground text-center">
            Gib deinen Zugangscode ein, den du von deiner Lehrkraft erhalten hast.
          </p>
        </div>

        {/* Category cards */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          {[
            { icon: <TreePine className="w-6 h-6" />, label: 'Mobilität', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
            { icon: <UtensilsCrossed className="w-6 h-6" />, label: 'Ernährung', color: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/20' },
            { icon: <Zap className="w-6 h-6" />, label: 'Energie', color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
            { icon: <ShoppingBag className="w-6 h-6" />, label: 'Konsum', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
          ].map((cat, i) => (
            <div
              key={cat.label}
              className={`glass rounded-2xl p-5 text-center group hover:scale-105 transition-all duration-300 cursor-default`}
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 shadow-lg ${cat.shadow} group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-white">{cat.icon}</span>
              </div>
              <span className="text-sm font-semibold">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div
          className="flex flex-wrap justify-center gap-8 mt-12 animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">60</div>
            <div className="text-xs text-muted-foreground">Fragen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">~10 Min</div>
            <div className="text-xs text-muted-foreground">Dauer</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">4</div>
            <div className="text-xs text-muted-foreground">Kategorien</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">100%</div>
            <div className="text-xs text-muted-foreground">Anonym</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-muted-foreground">
        <p>© 2024 CO₂ Rechner – Ein Projekt der Umweltmentoren</p>
      </footer>
    </div>
  );
}
