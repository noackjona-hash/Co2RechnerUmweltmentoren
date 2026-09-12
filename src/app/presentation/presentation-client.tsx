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
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  BarChart3,
  Home,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function PresentationClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [guestLink, setGuestLink] = useState<string>('https://lanky-joining-pester.ngrok-free.dev');

  const totalSlides = 6;

  // Determine current live URL and generate high-res QR code
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lanky-joining-pester.ngrok-free.dev';
    setGuestLink(origin);

    QRCode.toDataURL(origin, {
      width: 700,
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
      setShowControls(false);
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
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowControls((prev) => !prev);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [nextSlide, prevSlide]);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] text-foreground flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Top Header Bar (Only visible if not in fullscreen OR if controls explicitly toggled on) */}
      {(!isFullscreen || showControls) && (
        <header className="w-full px-6 py-3.5 flex items-center justify-between border-b border-border/80 bg-background/90 backdrop-blur-sm z-30 transition-all">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Startseite</span>
            </Link>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <span className="font-mono text-xs text-muted-foreground">
              Abschlussveranstaltung Umweltmentoren · 25.09.2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-foreground font-semibold px-2.5 py-0.5 border border-border rounded-md bg-card shadow-xs">
              {currentSlide + 1} / {totalSlides}
            </span>
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Steuerung ein-/ausblenden"
            >
              {showControls ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Vollbild umschalten"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>
      )}

      {/* Discreet Slide Progress Line */}
      <div className="w-full h-1 bg-border/40 fixed top-0 left-0 z-40">
        <div
          className="h-full bg-foreground transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Main Slide Stage (Optimized for 16:9 Beamer Projections) */}
      <main
        className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 max-w-7xl w-full mx-auto relative cursor-pointer"
        onClick={(e) => {
          // If user clicks on the right side of the screen, advance slide
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x > rect.width * 0.75) {
            nextSlide();
          } else if (x < rect.width * 0.25) {
            prevSlide();
          }
        }}
      >
        {/* SLIDE 1: Titel */}
        {currentSlide === 0 && (
          <div className="space-y-8 text-center max-w-4xl w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs sm:text-sm font-mono text-muted-foreground shadow-xs">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span>Umweltmentorenprogramm Baden-Württemberg · Kurs 2025/2026</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-foreground leading-[1.05]">
                CO₂-Rechner für Schulen
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light">
                Der persönliche ökologische Fußabdruck im Unterricht: modular, jugendgerecht und 100% datenschutzkonform.
              </p>
            </div>

            <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <span className="block font-bold text-foreground text-base font-serif">Jona Noack & Paul Kaiser</span>
                <span className="text-xs">Schüler & Umweltmentoren</span>
              </div>
              <span className="hidden sm:inline text-border">·</span>
              <div>
                <span className="block font-bold text-foreground text-base font-serif">Innenministerium Baden-Württemberg</span>
                <span className="text-xs">Konferenzsaal Stuttgart · 25. September 2026</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Problem & Motivation */}
        {currentSlide === 1 && (
          <div className="space-y-10 max-w-5xl w-full animate-in fade-in duration-200">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                Ausgangslage & Herausforderung
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
                Warum scheitern bisherige CO₂-Rechner im Unterricht?
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="paper-sheet p-6 sm:p-8 space-y-4 shadow-sm border-2">
                <span className="w-10 h-10 rounded-xl bg-foreground text-background font-mono font-bold flex items-center justify-center text-base">
                  01
                </span>
                <h3 className="font-serif font-bold text-foreground text-lg">Zu komplex & überfordernd</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Herkömmliche Rechner fragen nach Heizöl-Litern, Quadratmetern oder Dämmwerten – Daten, die kein Jugendlicher im Kopf hat.
                </p>
              </div>

              <div className="paper-sheet p-6 sm:p-8 space-y-4 shadow-sm border-2">
                <span className="w-10 h-10 rounded-xl bg-foreground text-background font-mono font-bold flex items-center justify-center text-base">
                  02
                </span>
                <h3 className="font-serif font-bold text-foreground text-lg">Datenschutz-Barrieren</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Schulen können Tools mit Tracking, Cookies oder Registrierungspflicht für Minderjährige aus DSGVO-Gründen nicht nutzen.
                </p>
              </div>

              <div className="paper-sheet p-6 sm:p-8 space-y-4 shadow-sm border-2">
                <span className="w-10 h-10 rounded-xl bg-foreground text-background font-mono font-bold flex items-center justify-center text-base">
                  03
                </span>
                <h3 className="font-serif font-bold text-foreground text-lg">Kein Klassenverbund</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lehrkräfte sehen keine gemeinsame Statistik und können die Ergebnisse nicht strukturiert im Unterricht reflektieren.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border-2 border-foreground/20 bg-card text-sm sm:text-base flex items-center gap-4 shadow-sm">
              <span className="font-mono font-bold uppercase text-xs text-background bg-foreground px-3 py-1.5 rounded-lg shrink-0">
                Unsere Vision
              </span>
              <p className="text-foreground font-medium leading-relaxed">
                Ein didaktisch passgenauer, minimalistischer und vollkommen anonymer Rechner, der perfekt in jede 45-Minuten-Stunde passt.
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 3: LIVE MITMACHEN (Der Saal testet live) - REDESIGNED & LARGE */}
        {currentSlide === 2 && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 max-w-6xl w-full animate-in fade-in duration-200">
            {/* Left: Enormous, Crisp QR Code */}
            <div className="paper-sheet p-8 sm:p-10 flex flex-col items-center justify-center space-y-5 shadow-2xl shrink-0 bg-white border-4 border-foreground rounded-3xl">
              <div className="inline-block bg-zinc-950 text-white font-mono text-[11px] uppercase tracking-widest px-3.5 py-1 rounded-full font-bold">
                Jetzt Smartphone zücken 📲
              </div>

              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt="QR Code zum Live-Mitmachen"
                  className="w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 object-contain"
                />
              ) : (
                <div className="w-80 h-80 flex items-center justify-center font-mono text-xs text-muted-foreground border">
                  QR-Code wird geladen...
                </div>
              )}

              <div className="text-center font-mono text-xs sm:text-sm font-bold tracking-wider text-zinc-950 bg-zinc-100 px-4 py-1.5 rounded-lg border border-zinc-300">
                {guestLink.replace(/^https?:\/\//, '')}
              </div>
            </div>

            {/* Right: Bold, Legible Instructions */}
            <div className="space-y-6 text-left max-w-xl">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live-Test im Konferenzsaal
                </div>
                <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
                  In 2 Minuten zum CO₂-Fußabdruck!
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Wir laden alle Mentor*innen und Gäste im Saal ein, den Rechner jetzt direkt am eigenen Smartphone auszuprobieren:
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border/80 flex items-start gap-4 shadow-sm">
                  <span className="w-8 h-8 rounded-lg bg-foreground text-background font-mono text-sm font-bold flex items-center justify-center shrink-0">
                    01
                  </span>
                  <div>
                    <strong className="text-foreground text-base block font-serif">Kamera auf den QR-Code halten</strong>
                    <span className="text-xs text-muted-foreground">Der Link öffnet sich sofort im Browser – keine App-Installation.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/80 flex items-start gap-4 shadow-sm">
                  <span className="w-8 h-8 rounded-lg bg-foreground text-background font-mono text-sm font-bold flex items-center justify-center shrink-0">
                    02
                  </span>
                  <div>
                    <strong className="text-foreground text-base block font-serif">Auf &bdquo;Als Gast starten&ldquo; tippen</strong>
                    <span className="text-xs text-muted-foreground">100% anonym, keine Registrierung, kein Passwort.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/80 flex items-start gap-4 shadow-sm">
                  <span className="w-8 h-8 rounded-lg bg-foreground text-background font-mono text-sm font-bold flex items-center justify-center shrink-0">
                    03
                  </span>
                  <div>
                    <strong className="text-foreground text-base block font-serif">10 Fragen beantworten & Urkunde erhalten</strong>
                    <span className="text-xs text-muted-foreground">Persönlicher CO₂-Wert in Tonnen/Jahr und Öko-Abzeichen.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Didaktik & Features */}
        {currentSlide === 3 && (
          <div className="space-y-8 max-w-5xl w-full animate-in fade-in duration-200">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                Didaktischer Aufbau
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
                Die 4 Säulen & flexible Unterrichtsmodi
              </h2>
            </div>

            <div className="grid sm:grid-cols-4 gap-4">
              <div className="paper-sheet p-6 space-y-2 shadow-sm border-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">01 / SÄULE</span>
                <h3 className="font-serif font-bold text-foreground text-base">Mobilität</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Schulweg (Fahrrad, ÖPNV, Elterntaxi), Urlaubsreisen und Freizeitverkehr.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-2 shadow-sm border-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">02 / SÄULE</span>
                <h3 className="font-serif font-bold text-foreground text-base">Ernährung</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fleischkonsum, Schulverpflegung, vegetarische Alternativen und Saisonalität.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-2 shadow-sm border-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">03 / SÄULE</span>
                <h3 className="font-serif font-bold text-foreground text-base">Energie</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Stoßlüften vs. Kipplüften, Warmwassernutzung, Standby und Stromsparen.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-2 shadow-sm border-2">
                <span className="text-xs font-mono text-muted-foreground font-bold">04 / SÄULE</span>
                <h3 className="font-serif font-bold text-foreground text-base">Konsum</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fast Fashion, Smartphone-Nutzung, Streaming, Second-Hand und Hobbys.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-xl border border-border bg-card space-y-1.5 shadow-sm">
                <span className="font-mono text-xs font-bold text-foreground block">10 Fragen &middot; Blitz</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dauer: ~3 Min. Perfekt für 5-Minuten-Stundeneinstiege oder Vorträge.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-1.5 shadow-sm">
                <span className="font-mono text-xs font-bold text-foreground block">30 Fragen &middot; Standard</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dauer: ~8 Min. Ideal für eine 45-Minuten-Stunde mit vertiefender Debatte.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-1.5 shadow-sm">
                <span className="font-mono text-xs font-bold text-foreground block">60 Fragen &middot; Deep Dive</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dauer: ~15 Min. Für Projekttage, Umwelt-AGs und Schul-Audits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Lehrkräfte-Portal & Urkunden */}
        {currentSlide === 4 && (
          <div className="space-y-8 max-w-5xl w-full animate-in fade-in duration-200">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                Schulverwaltung & Didaktik
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
                Dashboard für Lehrkräfte & Offizielle Urkunden
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="paper-sheet p-6 space-y-3 shadow-sm border-2">
                <Users className="w-8 h-8 text-foreground" />
                <h3 className="font-serif font-bold text-foreground text-lg">Eigene Lehrkräfte-Accounts</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Jede Lehrkraft kann sich für ihre Klassen anmelden, Klassencodes generieren und Direktlinks verteilen.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-3 shadow-sm border-2">
                <BarChart3 className="w-8 h-8 text-foreground" />
                <h3 className="font-serif font-bold text-foreground text-lg">Aggregiertes Klassen-Dashboard</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Anonyme Durchschnittswerte zeigen sofort: Wo spart die Klasse CO₂? Wo besteht der größte Handlungshebel?
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-3 shadow-sm border-2">
                <Award className="w-8 h-8 text-foreground" />
                <h3 className="font-serif font-bold text-foreground text-lg">Druckbare A4-Urkunden</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Schüler drucken am Ende ihr Zertifikat mit individuellem Klimaversprechen und Abzeichen für das Portfolio.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between gap-4 text-xs sm:text-sm shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">100% DSGVO-konform:</strong> Schülernamen werden ausschließlich lokal im Browser für die Urkunde eingesetzt – niemals auf dem Server gespeichert!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: Fazit & Ausblick */}
        {currentSlide === 5 && (
          <div className="space-y-8 text-center max-w-4xl w-full animate-in fade-in duration-200">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                Fazit & Ausblick
              </span>
              <h2 className="text-3xl sm:text-6xl font-serif font-black tracking-tight text-foreground leading-tight">
                Gemeinsam CO₂ senken – an jeder Schule!
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
                Der CO₂-Rechner steht allen Umweltmentorinnen und -mentoren sowie interessierten Schulen ab sofort kostenfrei zur Verfügung.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 text-left max-w-2xl mx-auto">
              <div className="paper-sheet p-6 space-y-2 shadow-sm border-2">
                <span className="text-xs font-mono text-muted-foreground">Besucht uns am Stand</span>
                <strong className="text-base font-serif font-bold text-foreground block">
                  Projekte-Markt Stellwand
                </strong>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ausstellungsplakat, gedruckte Handouts für Lehrkräfte & Erfahrungsaustausch vor Ort.
                </p>
              </div>

              <div className="paper-sheet p-6 space-y-2 shadow-sm border-2">
                <span className="text-xs font-mono text-muted-foreground">Kontakt & Projekt</span>
                <strong className="text-base font-serif font-bold text-foreground block">
                  Jona Noack & Paul Kaiser
                </strong>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Umweltmentorenprogramm Baden-Württemberg · Kurs 2025/2026
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Minimalist Slide Navigation (Auto-hidden in clean fullscreen mode) */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          showControls || !isFullscreen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none hover:opacity-100 hover:pointer-events-auto'
        }`}
      >
        <div className="bg-background/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-full shadow-lg flex items-center gap-3 text-xs">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer transition-colors"
            title="Vorherige Folie"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx
                    ? 'bg-foreground scale-125'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground'
                }`}
                title={`Folie ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer transition-colors"
            title="Nächste Folie"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
