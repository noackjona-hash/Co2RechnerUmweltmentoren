'use client';

import { useState, useEffect } from 'react';
import { Shield, Settings, Check, X } from 'lucide-react';

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
}

const COOKIE_KEY = 'co2rechner_cookie_consent';

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: false,
  });

  useEffect(() => {
    // Check if consent has already been given
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) {
      // Delay presentation slightly for visual excellence
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // ignore errors
      }
    }
  }, []);

  useEffect(() => {
    // Listen for custom event to reopen the banner
    const handleReopen = () => {
      setIsOpen(true);
      setShowDetails(true);
    };

    window.addEventListener('open-cookie-banner', handleReopen);
    return () => window.removeEventListener('open-cookie-banner', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const newSettings = { essential: true, analytics: true };
    setSettings(newSettings);
    localStorage.setItem(COOKIE_KEY, JSON.stringify(newSettings));
    setIsOpen(false);
  };

  const handleAcceptEssential = () => {
    const newSettings = { essential: true, analytics: false };
    setSettings(newSettings);
    localStorage.setItem(COOKIE_KEY, JSON.stringify(newSettings));
    setIsOpen(false);
  };

  const handleSaveSelection = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(settings));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 md:p-8 flex justify-center animate-slide-up">
      <div className="w-full max-w-3xl glass-strong rounded-3xl p-5 sm:p-6 shadow-2xl border-emerald-500/20 shadow-emerald-500/5 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-foreground">Wir achten auf deinen Datenschutz</h4>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Um deinen CO₂-Fußabdruck präzise berechnen und simulieren zu können, verwenden wir ausschließlich essenzielle und optionale Cookies, um deine Eingaben lokal zu sichern. Keine Daten werden zu Werbezwecken weitergegeben.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Einstellungen
            </button>
            <button
              onClick={handleAcceptEssential}
              className="px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-muted text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer"
            >
              Nur notwendige
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all duration-300 cursor-pointer"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>

        {/* Settings details panel */}
        {showDetails && (
          <div className="mt-5 pt-5 border-t border-border/50 space-y-4 animate-fade-in">
            <h5 className="font-bold text-xs sm:text-sm text-foreground">Individuelle Cookie-Einstellungen</h5>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Essential cookie item */}
              <div className="flex items-start justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/40">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">Essenzielle Cookies</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Notwendig</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
                    Erforderlich für den Login, die Sitzungsverwaltung der Schule und deine Sprache/Theme-Einstellungen.
                  </p>
                </div>
                <div className="w-9 h-6 rounded-full bg-emerald-500/20 flex items-center justify-end px-1 border border-emerald-500/20 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Simulation/Analytics cookie item */}
              <div
                onClick={() => setSettings((prev) => ({ ...prev, analytics: !prev.analytics }))}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/40 hover:border-emerald-500/20 transition-all cursor-pointer"
              >
                <div className="space-y-1 pr-4">
                  <span className="text-xs font-bold text-foreground">Klima-Simulation & Zwischenstand</span>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
                    Erlaubt es, deine unvollständigen Eingaben im Quiz sowie deine Anpassungen im Was-wäre-wenn-Simulator lokal zu speichern.
                  </p>
                </div>
                <div className={`w-9 h-6 rounded-full transition-colors flex items-center px-1 border shrink-0 ${
                  settings.analytics
                    ? 'bg-emerald-500/20 border-emerald-500/20 justify-end'
                    : 'bg-muted-foreground/10 border-border/50 justify-start'
                }`}>
                  <div className={`w-4 h-4 rounded-full transition-transform flex items-center justify-center ${
                    settings.analytics ? 'bg-emerald-50' : 'bg-muted-foreground/30'
                  }`}>
                    {settings.analytics ? (
                      <Check className="w-2.5 h-2.5 text-emerald-500" />
                    ) : (
                      <X className="w-2.5 h-2.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveSelection}
                className="px-5 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                Auswahl speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
