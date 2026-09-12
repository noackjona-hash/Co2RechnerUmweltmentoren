'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Printer,
  FileText,
  QrCode,
  Layout,
  Presentation,
  Home,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  School,
  BarChart3,
  Users,
  Copy,
  Check,
  Download,
  Info,
} from 'lucide-react';

export default function MaterialsClient() {
  const [activeTab, setActiveTab] = useState<string>('layout');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [guestLink, setGuestLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://co2-rechner.bw';
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

  const handleCopyLink = () => {
    if (!guestLink) return;
    navigator.clipboard.writeText(guestLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintSingle = (tabName: string) => {
    setActiveTab(tabName);
    setPrintMode('single');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintAll = () => {
    setPrintMode('all');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] text-foreground font-sans">
      {/* Top Header Navigation (Screen Only) */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Startseite</span>
          </Link>
          <span className="text-muted-foreground/40 text-xs">/</span>
          <span className="font-mono text-xs text-muted-foreground">
            Stellwand-Materialien (140 × 120 cm)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/presentation"
            className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Beamer-Präsentation</span>
          </Link>
          <button
            onClick={handlePrintAll}
            className="paper-btn-primary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Gesamtes Set drucken (A4/A3)</span>
          </button>
        </div>
      </header>

      {/* Screen Interactive Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 print:hidden">
        {/* Intro Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="paper-stamp text-xs uppercase tracking-wider">
              Projekte-Markt · 25.09.2026
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Innenministerium Baden-Württemberg, Stuttgart
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-foreground">
            Druckfertige Materialien für die Stellwand
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
            Offizielle Druckvorlagen und Plakate für das Schulteam Jona Noack & Paul Kaiser.
            Passgenau abgestimmt auf die Stellwandmaße von <strong>140 × 120 cm</strong> für den
            Gallery Walk der Umweltmentoren.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-3">
          <button
            onClick={() => {
              setActiveTab('layout');
              setPrintMode('single');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'layout'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>📌 Stellwand-Blueprint (140×120 cm)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('banner');
              setPrintMode('single');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'banner'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>🏷️ Header-Banner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mitmach');
              setPrintMode('single');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'mitmach'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>📱 Riesen-QR-Mitmachplakat</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('problem');
              setPrintMode('single');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'problem'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>💡 Didaktik & 3 Modi</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('dashboard');
              setPrintMode('single');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>⚙️ Dashboard & DSGVO</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('handout');
              setPrintMode('single');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'handout'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>📄 Lehrer-Handout (A4)</span>
          </button>
        </div>

        {/* Action Bar for Current Tab */}
        {activeTab !== 'layout' && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3.5 mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-foreground/70" />
              <span>Optimiert für gestochen scharfen DIN A4 / DIN A3 Ausdruck auf Standard-Druckern.</span>
            </div>
            <button
              onClick={() => handlePrintSingle(activeTab)}
              className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Dieses Plakat drucken</span>
            </button>
          </div>
        )}

        {/* TAB 1: Stellwand-Blueprint (140 x 120 cm Übersicht) */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-serif text-foreground">
                    Pinboard-Konfiguration (140 cm Breite × 120 cm Höhe)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    So werden die Plakate am 25.09. vor 10:00 Uhr an der Stellwand im Innenministerium angebracht.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="paper-stamp text-xs font-mono">Maßstab ~1:10</span>
                  <button
                    onClick={handlePrintAll}
                    className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Alle Plakate drucken</span>
                  </button>
                </div>
              </div>

              {/* Pinboard Canvas Preview */}
              <div className="relative w-full aspect-[140/120] bg-[#f4f1ea] dark:bg-[#1a1815] border-4 border-[#d6cfc0] dark:border-[#2e2a24] rounded-xl p-4 sm:p-6 flex flex-col justify-between shadow-inner overflow-hidden">
                {/* Board Pins Decoration */}
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-amber-600/80 shadow"></div>
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-600/80 shadow"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-amber-600/80 shadow"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-amber-600/80 shadow"></div>

                {/* Section Top: Banner (Breite 120cm) */}
                <div
                  onClick={() => setActiveTab('banner')}
                  className="w-full bg-white dark:bg-card border-2 border-dashed border-primary/40 hover:border-primary p-3 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-[1.005] group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Kopfzeile (120 × 20 cm) · 2× DIN A4 quer montiert
                      </span>
                      <h3 className="text-sm sm:text-base font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                        CO₂-RECHNER FÜR SCHULEN & UMWELTMENTOREN
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Klimabildung datenschutzkonform, modular & interaktiv im Unterricht · Jona Noack & Paul Kaiser
                      </p>
                    </div>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                      Ansehen →
                    </span>
                  </div>
                </div>

                {/* Section Center: 3 Columns (Left: Problem/Didaktik, Center: Big Live QR, Right: Dashboard & Handouts) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 my-3 flex-1">
                  {/* Left: Didaktik & 3 Modi */}
                  <div
                    onClick={() => setActiveTab('problem')}
                    className="bg-white dark:bg-card border-2 border-dashed border-border hover:border-primary p-3 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">Plakat A (DIN A4/A3)</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-0.5">
                        Didaktik & 3 Modi
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-4">
                        Warum Standard-Rechner im Unterricht scheitern. Unsere 3 flexiblen Modi: 10Q Blitz (10 Min), 30Q Standard, 60Q Deep Dive.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-primary font-medium mt-2">Klick für Details & Druck ↗</div>
                  </div>

                  {/* Center: Riesen-Mitmachplakat (Highlight des Standes) */}
                  <div
                    onClick={() => setActiveTab('mitmach')}
                    className="bg-white dark:bg-card border-2 border-primary p-3 rounded-lg shadow-md cursor-pointer transition-all hover:scale-[1.01] flex flex-col items-center justify-between text-center group bg-gradient-to-b from-primary/5 to-transparent"
                  >
                    <span className="paper-stamp !text-[10px] !py-0.5 text-primary">Stand-Highlight: Mitmachen!</span>
                    <div className="my-1.5 flex flex-col items-center">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 sm:w-28 sm:h-28 object-contain border border-border/60 rounded-md p-1 bg-white" />
                      ) : (
                        <div className="w-24 h-24 bg-muted animate-pulse rounded" />
                      )}
                      <p className="text-xs font-bold text-foreground mt-1">Live am Handy testen</p>
                      <p className="text-[10px] text-muted-foreground">10 Fragen · In 2 Min zum Zertifikat</p>
                    </div>
                    <div className="text-[10px] font-mono text-primary font-medium">Großansicht öffnen ↗</div>
                  </div>

                  {/* Right: Schulfunktionen & DSGVO */}
                  <div
                    onClick={() => setActiveTab('dashboard')}
                    className="bg-white dark:bg-card border-2 border-dashed border-border hover:border-primary p-3 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">Plakat B (DIN A4/A3)</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-0.5">
                        Klassen-Dashboard & DSGVO
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-4">
                        Klassencodes ohne Registrierungspflicht. Aggregierte Klassenstatistiken ohne personenbezogene Datenspeicherung.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-primary font-medium mt-2">Klick für Details & Druck ↗</div>
                  </div>
                </div>

                {/* Section Bottom: Tisch-Bereich (Laptop + Handout Stapel) */}
                <div className="w-full bg-amber-100/70 dark:bg-amber-950/20 border border-amber-300/50 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-amber-200 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200 font-medium">
                      TISCH-ABLAGE
                    </span>
                    <span className="text-foreground/80 text-[11px]">
                      💻 <strong>Laptop mit Live-Dashboard</strong> &middot; 📄 <strong>Handout-Stapel für Lehrkräfte</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('handout')}
                    className="text-primary hover:underline font-mono text-[11px] flex items-center gap-1"
                  >
                    <span>Handout ansehen</span> →
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist for Stall-Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Checkliste vor Ort (vor 10:00 Uhr)</span>
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-bold">1.</span>
                    <span>Plakate mit den vor Ort vorhandenen Pins auf der zugewiesenen Stellwand befestigen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-bold">2.</span>
                    <span>Laptop am Stand aufbauen (Netzteil + Browser-Tab mit Live-Dashboard & Gast-Modus offen).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-bold">3.</span>
                    <span>Gedruckte Lehrkräfte-Handouts (15-20 Exemplare) griffbereit auf den Tisch legen.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Gallery Walk Pitch (10:20 Uhr)</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  &bdquo;Hallo! Wir sind Jona und Paul. Wir haben einen CO₂-Rechner entwickelt, der speziell für 45-Minuten-Schulstunden konzipiert ist: keine komplizierten Gasrechnungen, 3 flexible Spielmodi, 100% anonym und sofort auswertbar für die Lehrkraft. Probieren Sie es gerne mit dem QR-Code direkt am Handy aus!&ldquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Header-Banner */}
        {activeTab === 'banner' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="paper-stamp text-xs font-mono">Druckvorlage: Stellwand-Banner</span>
                <button
                  onClick={() => handlePrintSingle('banner')}
                  className="paper-btn-primary !min-h-[34px] !text-xs !py-1 !px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Banner drucken</span>
                </button>
              </div>

              <div className="border border-border/80 rounded-xl p-8 bg-white text-zinc-900 shadow-sm">
                <div className="border-b-2 border-zinc-900 pb-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                      Umweltmentorenprogramm Baden-Württemberg · Kurs 2025/2026
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mt-1 text-zinc-950">
                      CO₂-RECHNER FÜR SCHULEN & UMWELTMENTOREN
                    </h2>
                    <p className="text-sm text-zinc-700 font-medium mt-1">
                      Klimabildung alltagsnah, modular & 100% datenschutzkonform im Unterricht
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono block text-zinc-500">Projekt von:</span>
                    <span className="text-sm font-serif font-bold block text-zinc-900">Jona Noack & Paul Kaiser</span>
                    <span className="text-xs text-zinc-600 block">Abschlussveranstaltung Innenministerium Stuttgart</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <span className="text-xs font-mono font-bold uppercase text-zinc-500 block">3 Modi</span>
                    <span className="text-xs text-zinc-800">10 / 30 / 60 Fragen für jede Unterrichtsform</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <span className="text-xs font-mono font-bold uppercase text-zinc-500 block">100% DSGVO</span>
                    <span className="text-xs text-zinc-800">Gastmodus, keine Klarnamen, keine Tracker</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <span className="text-xs font-mono font-bold uppercase text-zinc-500 block">Klassenverbund</span>
                    <span className="text-xs text-zinc-800">Live-Dashboard & Urkunden mit Abzeichen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Riesen-Mitmachplakat mit QR-Code */}
        {activeTab === 'mitmach' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="paper-stamp text-xs font-mono">Druckvorlage: Mitmachplakat (Blickfang)</span>
                <button
                  onClick={() => handlePrintSingle('mitmach')}
                  className="paper-btn-primary !min-h-[34px] !text-xs !py-1 !px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Mitmachplakat drucken (A4/A3)</span>
                </button>
              </div>

              <div className="border-4 border-zinc-900 rounded-2xl p-8 bg-white text-zinc-950 text-center max-w-2xl mx-auto shadow-sm">
                <div className="inline-block bg-zinc-900 text-white font-mono text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                  Jetzt live am Smartphone ausprobieren
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mb-2">
                  Wie groß ist Dein CO₂-Fußabdruck?
                </h2>
                <p className="text-sm text-zinc-600 max-w-md mx-auto mb-6">
                  Keine App-Installation &middot; Kein Login &middot; In nur 2 Minuten zum persönlichen Ergebnis mit Zertifikat.
                </p>

                {/* QR Code Container */}
                <div className="inline-block p-4 border-2 border-zinc-900 rounded-2xl bg-white shadow-md my-2">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Live QR Code" className="w-64 h-64 sm:w-72 sm:h-72 object-contain" />
                  ) : (
                    <div className="w-64 h-64 bg-zinc-100 animate-pulse rounded-lg" />
                  )}
                </div>

                <div className="mt-4">
                  <span className="font-mono text-xs text-zinc-500 block">Direktlink im Browser:</span>
                  <span className="font-mono text-sm font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded inline-block mt-1">
                    {guestLink || 'co2-rechner'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-zinc-200 text-left">
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <span className="font-mono text-xs font-bold text-zinc-400 block mb-1">01 / SCAN</span>
                    <span className="text-xs text-zinc-800 font-medium">Handykamera auf den QR-Code richten</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <span className="font-mono text-xs font-bold text-zinc-400 block mb-1">02 / QUIZ</span>
                    <span className="text-xs text-zinc-800 font-medium">10 schnelle Fragen im Blitzmodus beantworten</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <span className="font-mono text-xs font-bold text-zinc-400 block mb-1">03 / URKUNDE</span>
                    <span className="text-xs text-zinc-800 font-medium">Dein CO₂-Ergebnis & Öko-Abzeichen erhalten</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Didaktik & 3 Modi */}
        {activeTab === 'problem' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="paper-stamp text-xs font-mono">Druckvorlage: Plakat Didaktik & Konzept</span>
                <button
                  onClick={() => handlePrintSingle('problem')}
                  className="paper-btn-primary !min-h-[34px] !text-xs !py-1 !px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Plakat drucken</span>
                </button>
              </div>

              <div className="border border-border/80 rounded-xl p-8 bg-white text-zinc-900 shadow-sm max-w-3xl mx-auto">
                <div className="border-b border-zinc-300 pb-4 mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Didaktisches Konzept & Schulrealität
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950 mt-1">
                    Warum bestehende CO₂-Rechner im Unterricht scheitern
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Problem */}
                  <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 mb-2">
                      ⚠️ Das Problem herkömmlicher Rechner
                    </h3>
                    <ul className="space-y-2 text-xs text-red-950">
                      <li>• <strong>Zu komplex & langatmig:</strong> Rechner wie der des UBA verlangen 20+ Minuten. Die Schulstunde ist vorbei, bevor diskutiert werden kann.</li>
                      <li>• <strong>Falsche Zielgruppe:</strong> Fragen nach Heizöl-Litern, Dämmstoff-Dicke oder Flugmeilen überfordern Jugendliche.</li>
                      <li>• <strong>Kein Klassenbezug:</strong> Keine anonyme Auswertung im Klassenverband möglich.</li>
                    </ul>
                  </div>

                  {/* Solution */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
                      ✨ Unsere Schullösung
                    </h3>
                    <ul className="space-y-2 text-xs text-emerald-950">
                      <li>• <strong>3 modulare Modi:</strong> Passgenau für jede Unterrichtszeit (10, 30 oder 60 Fragen).</li>
                      <li>• <strong>Schülergerechter Alltag:</strong> Fragen zu Ernährung, Schulweg, Streaming, Kleidung & Freizeit.</li>
                      <li>• <strong>Sofortige Motivation:</strong> Gamification mit personalisierten Urkunden & Abzeichen.</li>
                    </ul>
                  </div>
                </div>

                {/* The 3 Modes */}
                <h3 className="text-sm font-serif font-bold text-zinc-900 mb-3">Die 3 Unterrichtsmodi:</h3>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                    <span className="font-mono font-bold text-zinc-900 block">10 Fragen &middot; Blitz</span>
                    <span className="text-zinc-600 block mt-1 text-[11px]">Dauer: ~3 Minuten. Ideal als Stundeneinstieg in Biologie, Geographie oder GK.</span>
                  </div>
                  <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                    <span className="font-mono font-bold text-zinc-900 block">30 Fragen &middot; Standard</span>
                    <span className="text-zinc-600 block mt-1 text-[11px]">Dauer: ~8 Minuten. Detaillierte Sektor-Aufschlüsselung für Doppelstunden.</span>
                  </div>
                  <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                    <span className="font-mono font-bold text-zinc-900 block">60 Fragen &middot; Deep Dive</span>
                    <span className="text-zinc-600 block mt-1 text-[11px]">Dauer: ~15 Minuten. Umfassende Analyse für Projekttage und Umwelt-AGs.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Schulfunktionen & Dashboard & DSGVO */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="paper-stamp text-xs font-mono">Druckvorlage: Schulfunktionen & Datenschutz</span>
                <button
                  onClick={() => handlePrintSingle('dashboard')}
                  className="paper-btn-primary !min-h-[34px] !text-xs !py-1 !px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Plakat drucken</span>
                </button>
              </div>

              <div className="border border-border/80 rounded-xl p-8 bg-white text-zinc-900 shadow-sm max-w-3xl mx-auto">
                <div className="border-b border-zinc-300 pb-4 mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Funktionen für Lehrkräfte & Schulträger
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950 mt-1">
                    Volle Kontrolle für die Lehrkraft &middot; Höchster Datenschutz
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
                  <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                    <h3 className="font-serif font-bold text-sm text-zinc-900 mb-1.5 flex items-center gap-1.5">
                      <School className="w-4 h-4 text-zinc-700" />
                      <span>Klassencode-System</span>
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">
                      Lehrkräfte erstellen mit einem Klick einen 6-stelligen Klassencode (z.B. &bdquo;KL-8B-KLIMA&ldquo;). Schüler treten ohne E-Mail-Adresse bei.
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                    <h3 className="font-serif font-bold text-sm text-zinc-900 mb-1.5 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-zinc-700" />
                      <span>Aggregiertes Klassen-Dashboard</span>
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">
                      Echtzeit-Durchschnittswerte der gesamten Klasse aufgeschlüsselt nach Sektoren (Ernährung, Mobilität, Wohnen, Konsum).
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                    <h3 className="font-serif font-bold text-sm text-zinc-900 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>100% DSGVO-konform</span>
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">
                      Keine Speicherung personenbezogener Daten. Gastmodus funktioniert ohne Datenbank. Keine Werbe- oder Drittanbieter-Tracker.
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                    <h3 className="font-serif font-bold text-sm text-zinc-900 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-zinc-700" />
                      <span>Druckbare A4-Urkunden</span>
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">
                      Jeder Schüler kann am Ende sein Zertifikat mit individuellem CO₂-Wert und Leistungsabzeichen für die Schulmappe ausdrucken.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-100 rounded-xl border border-zinc-200 text-center">
                  <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block">Wissenschaftliche Datengrundlage</span>
                  <p className="text-xs text-zinc-800 mt-1 font-medium">
                    Emissionsfaktoren basieren auf Daten des Umweltbundesamts (UBA), GEMIS und ProBas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Lehrkräfte-Handout (DIN A4 Flyer) */}
        {activeTab === 'handout' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="paper-stamp text-xs font-mono">Druckvorlage: Lehrkräfte-Handout (DIN A4)</span>
                <button
                  onClick={() => handlePrintSingle('handout')}
                  className="paper-btn-primary !min-h-[34px] !text-xs !py-1 !px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Handout drucken (A4)</span>
                </button>
              </div>

              <div className="border border-border/80 rounded-xl p-8 bg-white text-zinc-900 shadow-sm max-w-2xl mx-auto">
                <div className="border-b-2 border-zinc-900 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                      LEITFADEN FÜR LEHRKRÄFTE · UMWELTMENTORENPROJEKT
                    </span>
                    <h2 className="text-xl font-serif font-black text-zinc-950">
                      Der CO₂-Rechner im Unterricht
                    </h2>
                  </div>
                  <span className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-2 py-1 rounded">
                    DIN A4 Infoblatt
                  </span>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed mb-4">
                  Liebe Lehrerinnen und Lehrer, dieser CO₂-Rechner wurde von uns (Jona Noack & Paul Kaiser) im Rahmen unserer Ausbildung zu Umweltmentoren entwickelt. Unser Ziel: Klimaschutz im Unterricht greifbar machen – ohne bürokratische Hürden.
                </p>

                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-zinc-950 mb-2 border-b border-zinc-200 pb-1">
                  Vorschlag für eine 45-Minuten-Unterrichtsstunde:
                </h3>

                <div className="space-y-2.5 text-xs text-zinc-800 mb-6">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold bg-zinc-100 px-2 py-0.5 rounded text-zinc-900">10 Min</span>
                    <div>
                      <strong>Einstieg & Quiz:</strong> Schüler scannen den QR-Code oder öffnen die Web-App am Tablet/Smartphone. Durchführung des 10-Fragen-Blitz-Quiz.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold bg-zinc-100 px-2 py-0.5 rounded text-zinc-900">15 Min</span>
                    <div>
                      <strong>Klassenauswertung:</strong> Die Lehrkraft projiziert das anonyme Klassen-Dashboard per Beamer. Vergleich: In welchen Bereichen (Ernährung vs. Mobilität) liegen die größten Hebel?
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold bg-zinc-100 px-2 py-0.5 rounded text-zinc-900">20 Min</span>
                    <div>
                      <strong>Handlungsstrategien & Debatte:</strong> Was kann der Einzelne tun? Was die Schule? Übergang zum &bdquo;Ökologischen Handabdruck&ldquo; (systemische Veränderungen).
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4 items-center">
                  <div>
                    <h4 className="font-serif font-bold text-xs text-zinc-900 mb-1">Einsatzbereiche:</h4>
                    <ul className="text-[11px] text-zinc-600 space-y-0.5">
                      <li>• Geographie: Globale Emissionen & Fußabdruck</li>
                      <li>• Gemeinschaftskunde: Klimapolitik & Konsum</li>
                      <li>• BNT / Biologie: Ökologie & Ernährung</li>
                      <li>• Umwelt-AGs & Projekttage</li>
                    </ul>

                    <h4 className="font-serif font-bold text-xs text-zinc-900 mt-3 mb-1">Kontakt & Schulzugang:</h4>
                    <p className="text-[11px] text-zinc-600">
                      Jona Noack & Paul Kaiser<br />
                      Schülermentoren Baden-Württemberg<br />
                      Schulzugang nur auf Anfrage: <strong className="font-mono text-zinc-900">jona.noack@outlook.de</strong><br />
                      Web: <span className="font-mono text-zinc-900">{guestLink || 'co2-rechner'}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 object-contain" />
                    ) : (
                      <div className="w-28 h-28 bg-zinc-200 animate-pulse rounded" />
                    )}
                    <span className="text-[10px] font-mono text-zinc-500 mt-1">Jetzt direkt öffnen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════════════
          DEDICATED PRINT CONTAINER: Active during window.print()
          Renders high-resolution vector documents with page breaks
      ══════════════════════════════════════════════════════════════════════════════ */}
      <div id="print-materials-wrapper" className="hidden print:block">
        {/* Print Page: Banner */}
        {(printMode === 'all' || activeTab === 'banner') && (
          <div className="print-page">
            <div className="border-b-4 border-zinc-900 pb-6 mb-6 flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 block">
                  Umweltmentorenprogramm Baden-Württemberg · Kurs 2025/2026
                </span>
                <h1 className="text-3xl font-serif font-black tracking-tight mt-1 text-zinc-950">
                  CO₂-RECHNER FÜR SCHULEN & UMWELTMENTOREN
                </h1>
                <p className="text-base text-zinc-800 font-medium mt-1">
                  Klimabildung alltagsnah, modular & 100% datenschutzkonform im Unterricht
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono block text-zinc-600">Entwickelt von:</span>
                <span className="text-base font-serif font-bold block text-zinc-950">Jona Noack & Paul Kaiser</span>
                <span className="text-xs text-zinc-700 block">Innenministerium Stuttgart · 25.09.2026</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 my-8 text-center">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="text-xs font-mono font-bold uppercase text-zinc-600 block">3 Spielmodi</span>
                <p className="text-xs text-zinc-900 mt-1">10, 30 oder 60 Fragen – anpassbar an jede Unterrichtsstunde</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="text-xs font-mono font-bold uppercase text-zinc-600 block">100% DSGVO</span>
                <p className="text-xs text-zinc-900 mt-1">Anonymes Klassencode-System & Gastmodus ohne Datenbank</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="text-xs font-mono font-bold uppercase text-zinc-600 block">Gamification</span>
                <p className="text-xs text-zinc-900 mt-1">Druckfertige DIN A4 Zertifikate mit Öko-Abzeichen</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-300 pt-6 mt-12">
              <div className="text-xs text-zinc-600 font-mono">
                Web-App: {guestLink}
              </div>
              <div className="text-xs text-zinc-600 font-mono">
                Stellwand-Banner (140×120 cm Pinboard)
              </div>
            </div>
          </div>
        )}

        {/* Print Page: Mitmachplakat */}
        {(printMode === 'all' || activeTab === 'mitmach') && (
          <div className="print-page text-center flex flex-col justify-between">
            <div>
              <div className="inline-block bg-zinc-900 text-white font-mono text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                Umweltmentoren 2025/2026 · Interaktive Mitmachstation
              </div>

              <h1 className="text-4xl font-serif font-black tracking-tight text-zinc-950 mb-3">
                Wie groß ist Dein CO₂-Fußabdruck?
              </h1>
              <p className="text-base text-zinc-700 max-w-lg mx-auto mb-8">
                Scanne jetzt den QR-Code mit Deinem Smartphone und berechne Deinen persönlichen ökologischen Fußabdruck in 2 Minuten!
              </p>

              {/* Huge QR Code for Printing */}
              <div className="inline-block p-6 border-4 border-zinc-950 rounded-2xl bg-white shadow-none my-4">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-80 h-80 object-contain mx-auto" />
                )}
              </div>

              <div className="mt-4">
                <span className="font-mono text-xs text-zinc-500 block">Direktlink für den Browser:</span>
                <span className="font-mono text-lg font-bold text-zinc-950 bg-zinc-100 px-4 py-1.5 rounded-md inline-block mt-1 border border-zinc-300">
                  {guestLink || 'co2-rechner'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t-2 border-zinc-900 text-left">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="font-mono text-xs font-bold text-zinc-500 block mb-1">01 / SCANNEN</span>
                <p className="text-xs text-zinc-900 font-medium">Handykamera auf QR-Code halten & Link antippen (keine App nötig).</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="font-mono text-xs font-bold text-zinc-500 block mb-1">02 / ANTWORTEN</span>
                <p className="text-xs text-zinc-900 font-medium">10 Fragen zu Ernährung, Schulweg, Freizeit & Wohnen beantworten.</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="font-mono text-xs font-bold text-zinc-500 block mb-1">03 / ZERTIFIKAT</span>
                <p className="text-xs text-zinc-900 font-medium">Sofortiges Feedback, CO₂-Tonnen/Jahr und Dein persönliches Abzeichen.</p>
              </div>
            </div>
          </div>
        )}

        {/* Print Page: Didaktik & 3 Modi */}
        {(printMode === 'all' || activeTab === 'problem') && (
          <div className="print-page">
            <div className="border-b-2 border-zinc-900 pb-4 mb-6 flex justify-between items-end">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 block">
                  Didaktisches Konzept & Schulrealität
                </span>
                <h2 className="text-2xl font-serif font-black text-zinc-950 mt-1">
                  Warum bestehende Rechner im Unterricht scheitern
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-600">Plakat A</span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-5 bg-zinc-50 border-2 border-zinc-400 rounded-xl">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 mb-2">
                  ⚠️ Das Problem herkömmlicher Rechner
                </h3>
                <ul className="space-y-2.5 text-xs text-zinc-800">
                  <li>• <strong>Zu langwierig:</strong> 20+ Minuten Rechenzeit sprengen eine 45-Minuten-Stunde.</li>
                  <li>• <strong>Falsche Zielgruppe:</strong> Fragen nach Heizölmengen oder Quadratmetern überfordern Schüler.</li>
                  <li>• <strong>Kein Klassenverbund:</strong> Schüler füllen isoliert aus, die Lehrkraft hat keinen Überblick.</li>
                </ul>
              </div>

              <div className="p-5 bg-zinc-100 border-2 border-zinc-900 rounded-xl">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 mb-2">
                  ✨ Unsere Schullösung
                </h3>
                <ul className="space-y-2.5 text-xs text-zinc-900">
                  <li>• <strong>3 modulare Modi:</strong> Passend für 10 Min Stundeneinstieg bis zur Doppelstunde.</li>
                  <li>• <strong>Jugendgerechte Lebenswelt:</strong> Fragen zu Handy, Streaming, Kleidung & Schulweg.</li>
                  <li>• <strong>Gamification:</strong> Urkunden mit Abzeichen wie &bdquo;Klima-Pionier&ldquo;.</li>
                </ul>
              </div>
            </div>

            <h3 className="text-sm font-serif font-bold text-zinc-950 mb-3">Die 3 Unterrichtsmodi im Detail:</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-4 border border-zinc-300 rounded-xl bg-zinc-50">
                <span className="font-mono font-bold text-zinc-950 text-sm block">10 Fragen</span>
                <span className="text-xs font-semibold text-zinc-700 block mb-1">Blitz-Modus (~3 Min)</span>
                <p className="text-[11px] text-zinc-700">Ideal für den direkten Stundeneinstieg in Biologie, Geographie oder GK.</p>
              </div>
              <div className="p-4 border border-zinc-300 rounded-xl bg-zinc-50">
                <span className="font-mono font-bold text-zinc-950 text-sm block">30 Fragen</span>
                <span className="text-xs font-semibold text-zinc-700 block mb-1">Standard-Modus (~8 Min)</span>
                <p className="text-[11px] text-zinc-700">Ausgewogene Sektoren-Analyse für Doppelstunden & Referate.</p>
              </div>
              <div className="p-4 border border-zinc-300 rounded-xl bg-zinc-50">
                <span className="font-mono font-bold text-zinc-950 text-sm block">60 Fragen</span>
                <span className="text-xs font-semibold text-zinc-700 block mb-1">Deep Dive (~15 Min)</span>
                <p className="text-[11px] text-zinc-700">Wissenschaftlich fundierte Analyse für Projekttage und Umwelt-AGs.</p>
              </div>
            </div>
          </div>
        )}

        {/* Print Page: Dashboard & DSGVO */}
        {(printMode === 'all' || activeTab === 'dashboard') && (
          <div className="print-page">
            <div className="border-b-2 border-zinc-900 pb-4 mb-6 flex justify-between items-end">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 block">
                  Funktionen für Schulen & Lehrkräfte
                </span>
                <h2 className="text-2xl font-serif font-black text-zinc-950 mt-1">
                  Klassen-Dashboard & Datenschutz nach DSGVO
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-600">Plakat B</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-8">
              <div className="p-4 border border-zinc-300 rounded-xl bg-zinc-50">
                <h3 className="font-serif font-bold text-sm text-zinc-950 mb-1">Klassencode-System</h3>
                <p className="text-zinc-700">
                  Lehrkräfte generieren für ihre Klasse einen einfachen Code. Schüler treten ohne E-Mail-Adresse und ohne Passwort bei.
                </p>
              </div>
              <div className="p-4 border border-zinc-300 rounded-xl bg-zinc-50">
                <h3 className="font-serif font-bold text-sm text-zinc-950 mb-1">Aggregierte Statistiken</h3>
                <p className="text-zinc-700">
                  Das Dashboard zeigt Klassenmittelwerte nach 4 Lebensbereichen: Mobilität, Konsum, Ernährung & Wohnen.
                </p>
              </div>
              <div className="p-4 border border-zinc-300 rounded-xl bg-zinc-50">
                <h3 className="font-serif font-bold text-sm text-zinc-950 mb-1">100% DSGVO-konform</h3>
                <p className="text-zinc-700">
                  Keine personenbezogenen Daten, keine Tracker, keine Werbenetzwerke. Gast-Modus arbeitet vollständig datenbankfrei.
                </p>
              </div>
              <div className="p-4 border border-zinc-300 rounded-xl bg-zinc-50">
                <h3 className="font-serif font-bold text-sm text-zinc-950 mb-1">Zertifikate für Schüler</h3>
                <p className="text-zinc-700">
                  Jeder Schüler erhält sein persönliches Zertifikat zum Ausdrucken für das Portfolio oder die Schulmappe.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-100 rounded-xl border border-zinc-300 text-center">
              <span className="font-mono text-xs font-bold text-zinc-700 uppercase tracking-wider block">Wissenschaftliche Datengrundlage</span>
              <p className="text-xs text-zinc-900 mt-1">
                Berechnungslogik und Emissionsfaktoren basieren auf Daten des Umweltbundesamts (UBA), GEMIS und ProBas.
              </p>
            </div>
          </div>
        )}

        {/* Print Page: Lehrkräfte-Handout */}
        {(printMode === 'all' || activeTab === 'handout') && (
          <div className="print-page">
            <div className="border-b-2 border-zinc-900 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 block">
                  LEITFADEN FÜR LEHRKRÄFTE · UMWELTMENTORENPROJEKT 2025/2026
                </span>
                <h2 className="text-xl font-serif font-black text-zinc-950">
                  Der CO₂-Rechner im Unterricht: Schritt für Schritt
                </h2>
              </div>
              <span className="font-mono text-xs bg-zinc-100 border border-zinc-300 px-2 py-1 rounded text-zinc-900 font-bold">
                DIN A4 Handout
              </span>
            </div>

            <p className="text-xs text-zinc-800 leading-relaxed mb-4">
              Liebe Lehrerinnen und Lehrer, dieser Rechner wurde von Jona Noack und Paul Kaiser (Schüler & Umweltmentoren) entwickelt, um Klimabildung ohne Einstiegshürden in den Schulalltag zu integrieren.
            </p>

            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-zinc-950 mb-2 border-b border-zinc-300 pb-1">
              Beispielhafter Ablauf einer 45-Minuten-Stunde:
            </h3>

            <div className="space-y-3 text-xs text-zinc-900 mb-6">
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold bg-zinc-200 px-2.5 py-0.5 rounded text-zinc-950">10 Min</span>
                <div>
                  <strong>Einstieg & Quiz am Smartphone:</strong> Schüler rufen die Web-App per QR-Code auf und beantworten die 10 Fragen im Blitz-Modus.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold bg-zinc-200 px-2.5 py-0.5 rounded text-zinc-950">15 Min</span>
                <div>
                  <strong>Klassenauswertung:</strong> Die Lehrkraft zeigt das Dashboard per Beamer. Diskussion: Wo liegen unsere größten Emissionen (z.B. Ernährung vs. Mobilität)?
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold bg-zinc-200 px-2.5 py-0.5 rounded text-zinc-950">20 Min</span>
                <div>
                  <strong>Handlungsoptionen:</strong> Welche Veränderungen bringen den größten Hebel? Vom persönlichen Fußabdruck zum wirksamen Handabdruck an unserer Schule.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-zinc-300 pt-4 items-center">
              <div>
                <h4 className="font-serif font-bold text-xs text-zinc-950 mb-1">Geeignet für die Fächer:</h4>
                <ul className="text-[11px] text-zinc-700 space-y-0.5">
                  <li>• Geographie / Erdkunde (Klimawandel, Globalisierung)</li>
                  <li>• Gemeinschaftskunde / Politik (Nachhaltigkeit)</li>
                  <li>• BNT / Biologie (Ökologie & Ernährung)</li>
                  <li>• Umwelt-AGs & Projekttage</li>
                </ul>

                <h4 className="font-serif font-bold text-xs text-zinc-950 mt-3 mb-1">Entwickler & Schulzugang:</h4>
                <p className="text-[11px] text-zinc-700">
                  Jona Noack & Paul Kaiser<br />
                  Umweltmentorenprogramm Baden-Württemberg<br />
                  Schulzugang nur auf Anfrage: <strong className="font-mono text-zinc-950">jona.noack@outlook.de</strong><br />
                  Web-App: <span className="font-mono text-zinc-950 font-medium">{guestLink}</span>
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 border border-zinc-300 rounded-xl text-center">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 object-contain mx-auto" />
                )}
                <span className="text-[10px] font-mono text-zinc-600 mt-1">Im Smartphone öffnen</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
