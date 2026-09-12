'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  QrCode,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  BarChart3,
  Home,
} from 'lucide-react';

export default function PresentationClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [guestLink, setGuestLink] = useState<string>('https://lanky-joining-pester.ngrok-free.dev');

  const totalSlides = 6;

  // Determine current live URL and generate QR code
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lanky-joining-pester.ngrok-free.dev';
    setGuestLink(origin);

    QRCode.toDataURL(origin, {
      width: 500,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] text-foreground flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border/80 bg-background/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Zurück zur App</span>
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="font-mono text-xs text-muted-foreground">
            Abschlussveranstaltung 25.09.2026 · Innenministerium
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/materials"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors font-medium hidden sm:inline"
          >
            Stellwand-Materialien (140x120cm)
          </Link>
          <span className="font-mono text-xs text-foreground font-semibold px-2 py-0.5 border border-border rounded bg-card">
            {currentSlide + 1} / {totalSlides}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Vollbild umschalten (Taste F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full h-1 bg-border/60">
        <div
          className="h-full bg-foreground transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Slide Canvas (16:9 Presentation Stage) */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12 max-w-6xl w-full mx-auto">
        {/* SLIDE 1: Titel */}
        {currentSlide === 0 && (
          <div className="space-y-8 text-center max-w-3xl animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-mono text-muted-foreground shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>Umweltmentorenprogramm Baden-Württemberg · Kurs 2025/2026</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                CO₂-Rechner für Schulen
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Der persönliche ökologische Fußabdruck im Schulunterricht: didaktisch greifbar, datenschutzkonform und direkt einsetzbar.
              </p>
            </div>

            <div className="pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground">
              <div>
                <span className="block font-semibold text-foreground text-sm">Jona Noack & Paul Kaiser</span>
                <span>Umweltmentoren-Projekt</span>
              </div>
              <span className="hidden sm:inline text-border">·</span>
              <div>
                <span className="block font-semibold text-foreground text-sm">Innenministerium Stuttgart</span>
                <span>Großer Konferenzraum · 25. September 2026</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Problem & Motivation */}
        {currentSlide === 1 && (
          <div className="space-y-8 max-w-4xl w-full animate-in fade-in duration-200">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Ausgangslage & Herausforderung
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Warum scheitern bisherige CO₂-Rechner im Klassenzimmer?
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="paper-sheet p-6 space-y-3">
                <span className="w-8 h-8 rounded-lg bg-foreground text-background font-mono font-bold flex items-center justify-center text-sm">
                  1
                </span>
                <h3 className="font-semibold text-foreground text-base">Zu kompliziert & adult</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Herkömmliche Rechner fragen nach Heizölmengen, Quadratmetern oder Steuerdaten – Daten, die kein Schüler im Kopf hat.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-3">
                <span className="w-8 h-8 rounded-lg bg-foreground text-background font-mono font-bold flex items-center justify-center text-sm">
                  2
                </span>
                <h3 className="font-semibold text-foreground text-base">Kein Datenschutz</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Schulen können Tools mit Tracking, Werbung oder E-Mail-Pflicht für Minderjährige aus DSGVO-Gründen nicht nutzen.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-3">
                <span className="w-8 h-8 rounded-lg bg-foreground text-background font-mono font-bold flex items-center justify-center text-sm">
                  3
                </span>
                <h3 className="font-semibold text-foreground text-base">Keine Klassen-Auswertung</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lehrkräfte sehen keine gemeinsame Statistik und können die Ergebnisse nicht strukturiert im Unterricht reflektieren.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-foreground/20 bg-foreground/5 text-xs sm:text-sm flex items-center gap-3">
              <span className="font-mono font-bold uppercase text-[11px] text-foreground shrink-0 px-2 py-1 bg-foreground text-background rounded">
                Unser Ziel
              </span>
              <p className="text-foreground font-medium leading-relaxed">
                Ein didaktisch passgenauer, minimalistischer und vollkommen anonymer Rechner, der in jede Schulstunde passt.
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 3: LIVE MITMACHEN (Der Saal testet live) */}
        {currentSlide === 2 && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 max-w-5xl w-full animate-in fade-in duration-200">
            {/* Left: Giant QR Code */}
            <div className="paper-sheet p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 shadow-xl shrink-0 bg-white">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt="QR Code zum Live-Mitmachen"
                  className="w-60 h-60 sm:w-72 sm:h-72 rounded-lg border border-border"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center font-mono text-xs text-muted-foreground border">
                  QR-Code wird generiert...
                </div>
              )}
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-foreground">
                Direktlink: {guestLink.replace(/^https?:\/\//, '')}
              </span>
            </div>

            {/* Right: Step by step live callout */}
            <div className="space-y-6 text-left max-w-lg">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Jetzt live mitmachen
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Smartphone zücken & testen!
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Wir laden alle Mentor*innen und Gäste im Saal ein, den Rechner in den nächsten 2 Minuten live auszuprobieren:
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-foreground text-background font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-foreground text-sm block">Kamera öffnen & QR-Code scannen</strong>
                    <span className="text-xs text-muted-foreground">Oder die URL im Browser öffnen.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-foreground text-background font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-foreground text-sm block">Auf &quot;Als Gast starten&quot; tippen</strong>
                    <span className="text-xs text-muted-foreground">
                      Keine Registrierung, keine persönlichen Daten erforderlich.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-foreground text-background font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-foreground text-sm block">10 Fragen beantworten & Auswertung ansehen</strong>
                    <span className="text-xs text-muted-foreground">
                      Erhalte deinen Wert, teste Einspar-Versprechen und sieh deine Urkunde!
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="/login"
                  target="_blank"
                  rel="noreferrer"
                  className="paper-btn-primary text-xs flex items-center gap-2"
                >
                  <span>App in neuem Tab öffnen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Didaktik & Features */}
        {currentSlide === 3 && (
          <div className="space-y-8 max-w-4xl w-full animate-in fade-in duration-200">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Didaktischer Aufbau
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Die 4 Säulen & flexible Unterrichtsmodi
              </h2>
            </div>

            <div className="grid sm:grid-cols-4 gap-4">
              <div className="paper-sheet p-5 space-y-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">01</span>
                <h3 className="font-semibold text-foreground text-sm">Mobilität</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Schulweg (Fahrrad, ÖPNV, Elterntaxi), Urlaubsreisen und Freizeit.
                </p>
              </div>

              <div className="paper-sheet p-5 space-y-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">02</span>
                <h3 className="font-semibold text-foreground text-sm">Ernährung</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Fleischkonsum, vegetarische/vegane Optionen, regionale Lebensmittel.
                </p>
              </div>

              <div className="paper-sheet p-5 space-y-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">03</span>
                <h3 className="font-semibold text-foreground text-sm">Energie</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Heizverhalten, Duschdauer, Beleuchtung und Standby-Geräte.
                </p>
              </div>

              <div className="paper-sheet p-5 space-y-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">04</span>
                <h3 className="font-semibold text-foreground text-sm">Konsum</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Kleidungskauf, Second-Hand, Smartphone-Nutzungsdauer und Recycling.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="font-mono text-xs font-bold text-foreground">10 Fragen (Kurzcheck)</span>
                <p className="text-xs text-muted-foreground">
                  Perfekt für 5-Minuten-Impulse, Projekttage oder Gast-Vorträge.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="font-mono text-xs font-bold text-foreground">30 Fragen (Standard)</span>
                <p className="text-xs text-muted-foreground">
                  Ideal für eine 45-Minuten Unterrichtsstunde mit vertiefender Diskussion.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="font-mono text-xs font-bold text-foreground">60 Fragen (Ausführlich)</span>
                <p className="text-xs text-muted-foreground">
                  Für Projektwochen, Umwelt-AGs und detaillierte Nachhaltigkeitsaudits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Lehrkräfte-Portal & Urkunden */}
        {currentSlide === 4 && (
          <div className="space-y-8 max-w-4xl w-full animate-in fade-in duration-200">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Schulverwaltung & Motivation
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Dashboard für Lehrkräfte & Offizielle Urkunden
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="paper-sheet p-6 space-y-3">
                <Users className="w-6 h-6 text-foreground" />
                <h3 className="font-semibold text-foreground text-base">Eigene Lehrkräfte-Accounts</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Jede Lehrkraft kann sich für ihre Klassen anmelden, Schüler-Zugangscodes generieren und Direktlinks verteilen.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-3">
                <BarChart3 className="w-6 h-6 text-foreground" />
                <h3 className="font-semibold text-foreground text-base">Klassen- & Schulvergleich</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Anonyme Durchschnittswerte zeigen auf einen Blick: Wo spart die Klasse CO₂? Wo besteht größtes Potenzial?
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-3">
                <Award className="w-6 h-6 text-foreground" />
                <h3 className="font-semibold text-foreground text-base">Klimaschutz-Urkunde</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Jeder Schüler kann eine personalisierte Urkunde mit individuellem Klima-Versprechen drucken oder als PDF mitnehmen.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-muted-foreground">
                  <strong>100% DSGVO-konform:</strong> Schülernamen werden ausschließlich lokal im Browser für die Urkunde eingesetzt – niemals auf dem Server gespeichert!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: Fazit & Mitmachen */}
        {currentSlide === 5 && (
          <div className="space-y-8 text-center max-w-3xl animate-in fade-in duration-200">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Fazit & Ausblick
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Gemeinsam CO₂ senken – an jeder Schule!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Der CO₂-Rechner steht allen Umweltmentorinnen und -mentoren sowie interessierten Schulen in Baden-Württemberg ab sofort kostenfrei zur Verfügung.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
              <div className="paper-sheet p-5 space-y-1">
                <span className="text-xs font-mono text-muted-foreground">Besucht uns am Stand</span>
                <strong className="text-sm font-semibold text-foreground block">
                  Projekte-Markt Stellwand
                </strong>
                <p className="text-xs text-muted-foreground leading-snug">
                  Plakate, Handouts für Lehrkräfte & persönlicher Austausch vor Ort.
                </p>
              </div>

              <div className="paper-sheet p-5 space-y-1">
                <span className="text-xs font-mono text-muted-foreground">Kontakt & Lizenz anfordern</span>
                <strong className="text-sm font-semibold text-foreground block">
                  Jona Noack & Paul Kaiser
                </strong>
                <p className="text-xs text-muted-foreground leading-snug">
                  jona.noack@outlook.de · 75172 Pforzheim
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <Link href="/" className="paper-btn-primary text-xs sm:text-sm">
                <span>Jetzt ausprobieren auf co2rechner.de</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation & Controls */}
      <footer className="w-full px-6 py-4 border-t border-border/80 bg-background/80 backdrop-blur-sm z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="paper-btn-secondary text-xs px-3 py-1.5 min-h-[36px] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Vorherige Folie (Pfeiltaste links)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zurück</span>
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="paper-btn-primary text-xs px-4 py-1.5 min-h-[36px] disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
              title="Nächste Folie (Pfeiltaste rechts / Leertaste)"
            >
              <span>Weiter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slide Dots Indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx
                    ? 'bg-foreground scale-125'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground'
                }`}
                title={`Folie ${idx + 1}`}
              />
            ))}
          </div>

          <div className="text-xs text-muted-foreground font-mono hidden md:block">
            Tastatur: ← / → / Leertaste · F = Vollbild
          </div>
        </div>
      </footer>
    </div>
  );
}
