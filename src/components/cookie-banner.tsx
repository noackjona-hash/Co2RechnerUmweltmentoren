'use client';

import { useState, useEffect } from 'react';
import { Settings, Check, X } from 'lucide-react';

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
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-2xl paper-sheet p-5 sm:p-6 space-y-4 border border-border bg-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border pb-3">
          <div className="space-y-1 flex-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
              Datenschutz-Hinweis
            </span>
            <p className="text-xs text-foreground font-sans leading-relaxed">
              Wir verwenden ausschließlich notwendige lokale Speicherungen, um deine Antworten während des Fragebogens zwischenzuspeichern. Keine Daten werden zu Werbezwecken weitergegeben.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleAcceptEssential}
              className="paper-btn-secondary text-xs"
            >
              Nur notwendige
            </button>
            <button
              onClick={handleAcceptAll}
              className="paper-btn-primary text-xs"
            >
              Einverstanden
            </button>
          </div>
        </div>

        {/* Settings details panel */}
        {showDetails && (
          <div className="space-y-3 font-sans text-xs">
            <div className="p-3 border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-semibold text-foreground">Technisch notwendige Cookies / Storage</span>
                <span className="text-muted-foreground">[ IMMER AKTIV ]</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-snug">
                Notwendig für die Authentifizierung und das Zwischenspeichern des Fragebogens.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowDetails(false)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Schließen
              </button>
              <button
                onClick={handleSaveSelection}
                className="paper-btn-primary text-xs"
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
