'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Printer,
  FileText,
  QrCode,
  Layout,
  Presentation,
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
  ExternalLink,
  Award,
  Leaf,
  Layers,
  GraduationCap,
  Calendar,
} from 'lucide-react';

export default function AdminMaterialsTab() {
  const [activeMaterial, setActiveMaterial] = useState<string>('masterpiece');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [guestLink, setGuestLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://co2-rechner.bw';
    setGuestLink(origin);

    QRCode.toDataURL(origin, {
      width: 800,
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

  const handlePrintSingle = (matKey: string) => {
    setActiveMaterial(matKey);
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
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="paper-stamp text-[10px] font-mono uppercase">
              25.09.2026 · Innenministerium Stuttgart
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Pinboard 140 × 120 cm
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Stellwand-Materialien & Präsentation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Exklusive Druckvorlagen für das Schulteam Jona Noack & Paul Kaiser sowie Direktzugriff auf die Beamer-Präsentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/presentation"
            target="_blank"
            className="paper-btn-primary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Beamer-Präsentation starten ↗</span>
          </Link>
          <button
            onClick={handlePrintAll}
            className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Gesamtes Set drucken</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs for Materials */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3 text-xs print:hidden">
        <button
          onClick={() => { setActiveMaterial('masterpiece'); setPrintMode('single'); }}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMaterial === 'masterpiece'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>⭐ Haupt-Ausstellungsplakat (Master)</span>
        </button>

        <button
          onClick={() => { setActiveMaterial('mitmach'); setPrintMode('single'); }}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMaterial === 'mitmach'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>📱 XXL-Mitmachplakat</span>
        </button>

        <button
          onClick={() => { setActiveMaterial('banner'); setPrintMode('single'); }}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMaterial === 'banner'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>🏷️ Header-Banner (120 cm)</span>
        </button>

        <button
          onClick={() => { setActiveMaterial('handout'); setPrintMode('single'); }}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMaterial === 'handout'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>📄 Lehrer-Handout (A4)</span>
        </button>

        <button
          onClick={() => { setActiveMaterial('blueprint'); setPrintMode('single'); }}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMaterial === 'blueprint'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>📌 Stellwand-Planer (140×120 cm)</span>
        </button>
      </div>

      {/* Action Bar for currently viewed material */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3.5 print:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-foreground/70 shrink-0" />
          <span>Druckoptimiert für DIN A4 / DIN A3 / Großformat mit gestochen scharfen Vektoren.</span>
        </div>
        <button
          onClick={() => handlePrintSingle(activeMaterial)}
          className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Dieses Plakat drucken</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 1: DAS NEUE, HOCHKARÄTIGE HAUPT-AUSSTELLUNGSPLAKAT (MASTERPIECE)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeMaterial === 'masterpiece' && (
        <div className="space-y-4 print:hidden">
          {/* Poster Outer Card */}
          <div className="bg-white text-zinc-950 p-6 sm:p-10 rounded-3xl border-4 border-zinc-950 shadow-2xl space-y-8 max-w-5xl mx-auto font-sans">
            {/* 1. Official Prestige Header */}
            <div className="border-b-4 border-zinc-950 pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2.5 text-[11px] font-mono uppercase tracking-widest text-zinc-600">
                <div className="flex items-center gap-2 font-bold">
                  <span>Baden-Württemberg</span>
                  <span>&middot;</span>
                  <span>Umweltmentorenprogramm Kurs 2025/2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Innenministerium Stuttgart</span>
                  <span>&middot;</span>
                  <span>25. September 2026</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-2">
                    Offizieller Projektbeitrag
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-zinc-950 leading-tight">
                    CO₂-RECHNER FÜR SCHULEN
                  </h1>
                  <p className="text-sm sm:text-base text-zinc-700 font-medium mt-1">
                    Klimabildung alltagsnah, modular & 100% datenschutzkonform im Unterricht verankern.
                  </p>
                </div>

                <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-zinc-200 pt-3 md:pt-0 md:pl-6 shrink-0">
                  <span className="text-xs font-mono text-zinc-500 uppercase block">Entwickelt von:</span>
                  <span className="text-base font-serif font-bold text-zinc-950 block">Jona Noack & Paul Kaiser</span>
                  <span className="text-xs text-zinc-600 block">Schüler-Umweltmentoren</span>
                </div>
              </div>
            </div>

            {/* 2. Three-Column Editorial Infographic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Problem vs. Solution */}
              <div className="space-y-4">
                <div className="border-b-2 border-zinc-950 pb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-xs font-mono font-bold flex items-center justify-center">1</span>
                  <h3 className="font-serif font-bold text-base text-zinc-950 uppercase tracking-wide">
                    Schul-Dilemma & Innovation
                  </h3>
                </div>

                <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-red-800 block">
                    ⚠️ Alte CO₂-Rechner scheitern
                  </span>
                  <ul className="text-xs text-red-950 space-y-1.5 leading-relaxed">
                    <li>• <strong>Zu langwierig:</strong> 25+ Min Rechenzeit sprengt eine 45-Minuten-Stunde.</li>
                    <li>• <strong>Falsche Zielgruppe:</strong> Fragen nach Heizöl-Litern oder Quadratmetern überfordern Jugendliche.</li>
                    <li>• <strong>Datenschutz:</strong> Tracking, Cookies und Klarnamenpflicht verhindern Schulnutzung.</li>
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-emerald-800 block">
                    ✨ Unsere Schullösung
                  </span>
                  <ul className="text-xs text-emerald-950 space-y-1.5 leading-relaxed">
                    <li>• <strong>3 flexible Modi:</strong> 10Q Blitz (3 Min), 30Q Standard (8 Min), 60Q Deep Dive (15 Min).</li>
                    <li>• <strong>Jugend-Lebenswelt:</strong> Schulweg, Kantine, Streaming, Kleidung & Smartphone.</li>
                    <li>• <strong>Sofortige Motivation:</strong> Urkunden mit Abzeichen & Einspar-Zielen.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-[11px] text-zinc-700">
                  <strong className="text-zinc-900 block font-serif">Wissenschaftliche Basis:</strong>
                  Emissionsfaktoren basieren auf Daten des Umweltbundesamts (UBA) und GEMIS.
                </div>
              </div>

              {/* Column 2: The Giant QR Code Live Station (CENTER EYE-CATCHER) */}
              <div className="p-6 bg-zinc-50 border-4 border-zinc-950 rounded-3xl flex flex-col items-center justify-between text-center space-y-4 shadow-md">
                <div className="inline-block bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                  Interaktive Mitmachstation
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-black text-xl text-zinc-950 leading-tight">
                    Jetzt live testen!
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Kamera draufhalten & Fußabdruck in 2 Minuten berechnen
                  </p>
                </div>

                {/* Big QR Code */}
                <div className="p-4 bg-white border-2 border-zinc-950 rounded-2xl shadow-sm">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Live QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                  ) : (
                    <div className="w-48 h-48 bg-zinc-100 animate-pulse rounded" />
                  )}
                </div>

                <div className="font-mono text-xs font-bold text-zinc-900 bg-white border border-zinc-300 px-3 py-1 rounded-lg w-full truncate">
                  {guestLink.replace(/^https?:\/\//, '')}
                </div>

                <div className="w-full space-y-2 text-left pt-2 border-t border-zinc-200">
                  <div className="flex items-center gap-2 text-xs text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-950 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    <span>QR-Code mit Handy scannen</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-950 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    <span>10 Fragen im Blitzmodus beantworten</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-950 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                    <span>Dein CO₂-Zertifikat mit Abzeichen erhalten</span>
                  </div>
                </div>
              </div>

              {/* Column 3: School Features & Privacy */}
              <div className="space-y-4">
                <div className="border-b-2 border-zinc-950 pb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-xs font-mono font-bold flex items-center justify-center">3</span>
                  <h3 className="font-serif font-bold text-base text-zinc-950 uppercase tracking-wide">
                    Lehrkräfte & Datenschutz
                  </h3>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5">
                  <span className="font-serif font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-zinc-700" />
                    <span>Klassencode-System</span>
                  </span>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Lehrkräfte erstellen mit 1 Klick einen 6-stelligen Code. Schüler treten ohne E-Mail und ohne Passwort bei.
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5">
                  <span className="font-serif font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-zinc-700" />
                    <span>Klassen-Dashboard (Beamer)</span>
                  </span>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Aggregierte Durchschnittswerte nach Sektoren (Ernährung, Mobilität, Heizen, Konsum) für gemeinsame Unterrichtsdebatten.
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5">
                  <span className="font-serif font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>100% DSGVO & Anonym</span>
                  </span>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Keine personenbezogene Speicherung auf dem Server. Gast-Modus arbeitet vollkommen datenbankfrei.
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5">
                  <span className="font-serif font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-700" />
                    <span>Offizielle Schülerurkunden</span>
                  </span>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Jeder Schüler druckt am Ende sein persönliches Zertifikat mit Leistungsabzeichen für das Schulportfolio aus.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Footer Banner on Poster */}
            <div className="pt-4 border-t-2 border-zinc-950 flex flex-wrap items-center justify-between text-xs text-zinc-600 font-mono gap-2">
              <div>
                Gefördert im Rahmen des Umweltmentorenprogramms Baden-Württemberg 2025/2026
              </div>
              <div className="font-bold text-zinc-950">
                Schulteam: Jona Noack & Paul Kaiser
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 2: XXL MITMACHPLAKAT
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeMaterial === 'mitmach' && (
        <div className="space-y-4 print:hidden">
          <div className="border-4 border-zinc-950 rounded-3xl p-10 bg-white text-zinc-950 text-center max-w-2xl mx-auto shadow-xl space-y-6">
            <div className="inline-block bg-zinc-950 text-white font-mono text-xs uppercase tracking-widest px-4 py-1.5 rounded-full font-bold">
              Interaktive Mitmachstation · Umweltmentoren 2026
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight">
              Wie groß ist Dein ökologischer Fußabdruck?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 max-w-md mx-auto">
              Keine Installation &middot; Kein Passwort &middot; In 2 Minuten zum persönlichen Ergebnis mit Urkunde!
            </p>

            <div className="inline-block p-6 border-4 border-zinc-950 rounded-3xl bg-white shadow-md my-2">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Live QR Code" className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto" />
              ) : (
                <div className="w-72 h-72 bg-zinc-100 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="font-mono text-sm font-bold text-zinc-950 bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-xl inline-block">
              {guestLink.replace(/^https?:\/\//, '')}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-200 text-left">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="font-mono text-xs font-bold text-zinc-400 block mb-1">01 / SCANNEN</span>
                <span className="text-xs text-zinc-800 font-medium">Handykamera auf QR-Code halten</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="font-mono text-xs font-bold text-zinc-400 block mb-1">02 / QUIZ</span>
                <span className="text-xs text-zinc-800 font-medium">10 Fragen im Blitz-Modus beantworten</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="font-mono text-xs font-bold text-zinc-400 block mb-1">03 / URKUNDE</span>
                <span className="text-xs text-zinc-800 font-medium">CO₂-Wert & Abzeichen erhalten</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 3: HEADER BANNER (120 cm)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeMaterial === 'banner' && (
        <div className="space-y-4 print:hidden">
          <div className="border-4 border-zinc-950 rounded-2xl p-8 bg-white text-zinc-950 shadow-md">
            <div className="border-b-2 border-zinc-950 pb-4 mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
                  Umweltmentorenprogramm Baden-Württemberg · Kurs 2025/2026
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight mt-1 text-zinc-950">
                  CO₂-RECHNER FÜR SCHULEN & UMWELTMENTOREN
                </h2>
                <p className="text-sm text-zinc-700 font-medium mt-1">
                  Klimabildung alltagsnah, modular & 100% datenschutzkonform im Unterricht
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono block text-zinc-500">Projekt von:</span>
                <span className="text-base font-serif font-bold block text-zinc-950">Jona Noack & Paul Kaiser</span>
                <span className="text-xs text-zinc-600 block">Innenministerium Stuttgart</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono">
                <strong className="block text-zinc-950">3 Unterrichtsmodi</strong>
                <span className="text-zinc-600">10Q Blitz, 30Q Standard, 60Q Deep Dive</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono">
                <strong className="block text-zinc-950">100% DSGVO</strong>
                <span className="text-zinc-600">Gastmodus & anonyme Klassencodes</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono">
                <strong className="block text-zinc-950">Zertifikate</strong>
                <span className="text-zinc-600">Druckbare A4-Urkunden für Schüler</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 4: LEHRKRÄFTE-HANDOUT (DIN A4 FLYER)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeMaterial === 'handout' && (
        <div className="space-y-4 print:hidden">
          <div className="border border-zinc-300 rounded-2xl p-8 bg-white text-zinc-900 shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="border-b-2 border-zinc-900 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  LEITFADEN FÜR LEHRKRÄFTE · UMWELTMENTORENPROJEKT
                </span>
                <h3 className="text-xl font-serif font-black text-zinc-950">
                  Der CO₂-Rechner im 45-Minuten-Unterricht
                </h3>
              </div>
              <span className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-2 py-1 rounded text-zinc-800 font-bold">
                DIN A4 Handout
              </span>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed">
              Liebe Lehrerinnen und Lehrer, dieser Rechner wurde von uns (Jona Noack & Paul Kaiser) entwickelt, um Klimaschutz ohne Vorbereitungshürden in den Schulalltag zu integrieren.
            </p>

            <div className="space-y-2.5 text-xs text-zinc-800">
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded text-zinc-950">10 Min</span>
                <div>
                  <strong>Einstieg & Quiz:</strong> Schüler scannen den QR-Code am Smartphone und beantworten die 10 Fragen im Blitzmodus.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded text-zinc-950">15 Min</span>
                <div>
                  <strong>Klassenauswertung:</strong> Die Lehrkraft zeigt das anonyme Klassen-Dashboard per Beamer. Diskussion: Wo liegen unsere größten Hebel?
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded text-zinc-950">20 Min</span>
                <div>
                  <strong>Handlungsideen & Urkunden:</strong> Vom persönlichen Fußabdruck zum wirksamen Handabdruck an der Schule. Druck der Schülerzertifikate.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4 items-center">
              <div>
                <h4 className="font-serif font-bold text-xs text-zinc-900 mb-1">Geeignet für die Fächer:</h4>
                <ul className="text-[11px] text-zinc-600 space-y-0.5">
                  <li>• Geographie / Erdkunde (Globaler Wandel)</li>
                  <li>• Gemeinschaftskunde (Klimapolitik)</li>
                  <li>• BNT / Biologie (Ökologie & Ernährung)</li>
                </ul>

                <h4 className="font-serif font-bold text-xs text-zinc-900 mt-2 mb-1">Projektkontakt:</h4>
                <p className="text-[11px] text-zinc-600">
                  Jona Noack & Paul Kaiser<br />
                  Umweltmentoren Baden-Württemberg<br />
                  <span className="font-mono text-zinc-900">{guestLink}</span>
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 object-contain" />
                ) : (
                  <div className="w-24 h-24 bg-zinc-200 animate-pulse rounded" />
                )}
                <span className="text-[10px] font-mono text-zinc-500 mt-1">Direktlink öffnen</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 5: STELLWAND-BLUEPRINT (140 × 120 cm PLANER)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeMaterial === 'blueprint' && (
        <div className="paper-sheet p-6 space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Stellwand-Planer (140 cm Breite × 120 cm Höhe)
              </h3>
              <p className="text-xs text-muted-foreground">
                Anordnung der Plakate für den Aufbau vor 10:00 Uhr im Innenministerium Stuttgart.
              </p>
            </div>
            <span className="paper-stamp text-xs font-mono">Pinboard-Maßstab ~1:10</span>
          </div>

          <div className="relative w-full aspect-[140/120] bg-[#f4f1ea] dark:bg-[#1a1815] border-4 border-[#d6cfc0] dark:border-[#2e2a24] rounded-2xl p-6 flex flex-col justify-between shadow-inner">
            {/* Top Banner */}
            <div
              onClick={() => setActiveMaterial('banner')}
              className="w-full bg-white dark:bg-card border-2 border-dashed border-primary/50 p-3 rounded-xl cursor-pointer hover:border-primary transition-all text-center"
            >
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                KOPFZEILE (120 × 20 cm) · 2× DIN A4 quer montiert
              </span>
              <strong className="text-sm font-serif font-bold text-foreground block">
                CO₂-RECHNER FÜR SCHULEN & UMWELTMENTOREN
              </strong>
            </div>

            {/* Center Masterpiece Poster Preview */}
            <div
              onClick={() => setActiveMaterial('masterpiece')}
              className="my-3 flex-1 bg-white dark:bg-card border-2 border-primary rounded-xl p-4 cursor-pointer hover:scale-[1.005] transition-all flex flex-col justify-between shadow-md"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="paper-stamp !text-[10px] text-primary">Haupt-Ausstellungsplakat (A3 / A2 / A1)</span>
                <span className="text-[10px] font-mono text-primary font-bold">Klick zum Ansehen & Drucken ↗</span>
              </div>
              <div className="grid grid-cols-3 gap-3 my-2 text-center text-xs">
                <div className="p-2 bg-muted/40 rounded-lg">
                  <span className="font-bold block text-foreground">01 Problem & 3 Modi</span>
                  <span className="text-[10px] text-muted-foreground">10Q / 30Q / 60Q</span>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/30">
                  <span className="font-bold block text-primary">02 Riesen-QR-Code</span>
                  <span className="text-[10px] text-muted-foreground">Mitmachstation</span>
                </div>
                <div className="p-2 bg-muted/40 rounded-lg">
                  <span className="font-bold block text-foreground">03 Klassen-Dashboard</span>
                  <span className="text-[10px] text-muted-foreground">100% DSGVO</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground text-center">
                Schulteam Jona Noack & Paul Kaiser &middot; Innenministerium Stuttgart
              </div>
            </div>

            {/* Bottom Table Shelf */}
            <div className="w-full bg-amber-100/80 dark:bg-amber-950/30 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-amber-900 dark:text-amber-200">
                💻 <strong>Tisch vor Stellwand:</strong> Laptop mit Live-Dashboard &middot; 📄 <strong>Stapel Lehrer-Handouts</strong>
              </span>
              <button onClick={() => setActiveMaterial('handout')} className="text-primary hover:underline font-mono text-[11px]">
                Handout ansehen →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PRINT ENGINE CONTAINER: Rendered when window.print() is called
      ══════════════════════════════════════════════════════════════════════════ */}
      <div id="print-materials-wrapper" className="hidden print:block">
        {/* Print Document: The Masterpiece Exhibition Poster */}
        {(printMode === 'all' || activeMaterial === 'masterpiece') && (
          <div className="print-page">
            <div className="border-b-4 border-zinc-950 pb-6 mb-6">
              <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-zinc-600 mb-2">
                <span>Baden-Württemberg · Umweltmentoren 2025/2026</span>
                <span>Abschlussveranstaltung Innenministerium Stuttgart</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-serif font-black tracking-tight text-zinc-950">
                    CO₂-RECHNER FÜR SCHULEN
                  </h1>
                  <p className="text-base text-zinc-800 font-medium mt-1">
                    Klimabildung alltagsnah, modular & 100% datenschutzkonform im Unterricht
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-mono text-zinc-600 block">Entwickelt von:</span>
                  <span className="font-serif font-bold text-base text-zinc-950 block">Jona Noack & Paul Kaiser</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 my-6">
              {/* Col 1 */}
              <div className="p-4 border-2 border-zinc-300 rounded-xl space-y-3 bg-zinc-50">
                <h3 className="font-serif font-bold text-sm text-zinc-950 uppercase">01 / Problem & Innovation</h3>
                <div className="space-y-1.5 text-xs text-zinc-800">
                  <p><strong>⚠️ Bisherige Rechner:</strong> 25+ Min Rechenzeit, überfordernde Fragen nach Heizöl-Litern, Null Datenschutz.</p>
                  <p><strong>✨ Unsere Schullösung:</strong> 3 flexible Spielmodi (10, 30, 60 Fragen) für jede Unterrichtsform.</p>
                  <p><strong>🌱 Jugend-Lebenswelt:</strong> Schulweg, Kantine, Streaming, Kleidung & Smartphone.</p>
                </div>
              </div>

              {/* Col 2 */}
              <div className="p-4 border-4 border-zinc-950 rounded-xl text-center flex flex-col justify-between bg-white">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 block">
                  02 / Mitmach-Station
                </span>
                <p className="text-xs text-zinc-700 font-semibold my-1">
                  Jetzt Smartphone zücken & scannen!
                </p>
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
                )}
                <span className="font-mono text-[11px] font-bold text-zinc-950 mt-1 block">
                  {guestLink.replace(/^https?:\/\//, '')}
                </span>
              </div>

              {/* Col 3 */}
              <div className="p-4 border-2 border-zinc-300 rounded-xl space-y-3 bg-zinc-50">
                <h3 className="font-serif font-bold text-sm text-zinc-950 uppercase">03 / Lehrkräfte & DSGVO</h3>
                <div className="space-y-1.5 text-xs text-zinc-800">
                  <p><strong>🔑 Klassencodes:</strong> Schüler treten mit 1 Klick ohne E-Mail und ohne Passwort bei.</p>
                  <p><strong>📊 Klassen-Dashboard:</strong> Durchschnittswerte nach Sektoren für den Beamer.</p>
                  <p><strong>🛡️ 100% DSGVO:</strong> Keine Speicherung personenbezogener Daten.</p>
                  <p><strong>🏆 Urkunden:</strong> Druckbare Zertifikate mit Öko-Abzeichen.</p>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-zinc-950 pt-4 mt-8 flex justify-between text-xs font-mono text-zinc-600">
              <span>Umweltmentorenprogramm Baden-Württemberg · Kurs 2025/2026</span>
              <span>Web-App: {guestLink}</span>
            </div>
          </div>
        )}

        {/* Print Document: XXL Mitmachplakat */}
        {(printMode === 'all' || activeMaterial === 'mitmach') && (
          <div className="print-page text-center flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-600 mb-4">
                Umweltmentoren 2025/2026 · Interaktive Mitmachstation
              </div>

              <h1 className="text-5xl font-serif font-black tracking-tight text-zinc-950 mb-3">
                Wie groß ist Dein CO₂-Fußabdruck?
              </h1>
              <p className="text-base text-zinc-700 max-w-lg mx-auto mb-8">
                Scanne jetzt den QR-Code mit Deinem Smartphone und berechne Deinen persönlichen ökologischen Fußabdruck in 2 Minuten!
              </p>

              <div className="inline-block p-6 border-4 border-zinc-950 rounded-3xl bg-white my-4">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-80 h-80 object-contain mx-auto" />
                )}
              </div>

              <div className="font-mono text-lg font-bold text-zinc-950 bg-zinc-100 px-5 py-2 rounded-xl inline-block mt-3 border border-zinc-300">
                {guestLink.replace(/^https?:\/\//, '')}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t-2 border-zinc-950 text-left">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="font-mono text-xs font-bold text-zinc-500 block mb-1">01 / SCANNEN</span>
                <p className="text-xs text-zinc-900 font-medium">Handykamera auf QR-Code halten (keine App nötig).</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="font-mono text-xs font-bold text-zinc-500 block mb-1">02 / ANTWORTEN</span>
                <p className="text-xs text-zinc-900 font-medium">10 Fragen zu Ernährung, Schulweg, Freizeit & Wohnen beantworten.</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300">
                <span className="font-mono text-xs font-bold text-zinc-500 block mb-1">03 / ZERTIFIKAT</span>
                <p className="text-xs text-zinc-900 font-medium">Dein CO₂-Ergebnis in Tonnen/Jahr und persönliches Abzeichen erhalten.</p>
              </div>
            </div>
          </div>
        )}

        {/* Print Document: Lehrkräfte-Handout */}
        {(printMode === 'all' || activeMaterial === 'handout') && (
          <div className="print-page">
            <div className="border-b-2 border-zinc-950 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 block">
                  LEITFADEN FÜR LEHRKRÄFTE · UMWELTMENTORENPROJEKT 2025/2026
                </span>
                <h2 className="text-xl font-serif font-black text-zinc-950">
                  Der CO₂-Rechner im Unterricht: Schritt für Schritt
                </h2>
              </div>
              <span className="font-mono text-xs bg-zinc-100 border border-zinc-300 px-2 py-1 rounded text-zinc-950 font-bold">
                DIN A4 Handout
              </span>
            </div>

            <p className="text-xs text-zinc-800 leading-relaxed mb-4">
              Liebe Lehrerinnen und Lehrer, dieser Rechner wurde von Jona Noack und Paul Kaiser entwickelt, um Klimabildung ohne Einstiegshürden in den Schulalltag zu integrieren.
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
                  <strong>Klassenauswertung:</strong> Die Lehrkraft zeigt das Dashboard per Beamer. Diskussion: Wo liegen unsere größten Emissionen?
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold bg-zinc-200 px-2.5 py-0.5 rounded text-zinc-950">20 Min</span>
                <div>
                  <strong>Handlungsoptionen:</strong> Welche Veränderungen bringen den größten Hebel? Vom persönlichen Fußabdruck zum wirksamen Handabdruck an der Schule.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-zinc-300 pt-4 items-center">
              <div>
                <h4 className="font-serif font-bold text-xs text-zinc-950 mb-1">Geeignet für die Fächer:</h4>
                <ul className="text-[11px] text-zinc-700 space-y-0.5">
                  <li>• Geographie / Erdkunde (Globaler Wandel)</li>
                  <li>• Gemeinschaftskunde (Klimapolitik)</li>
                  <li>• BNT / Biologie (Ökologie & Ernährung)</li>
                </ul>

                <h4 className="font-serif font-bold text-xs text-zinc-950 mt-3 mb-1">Entwickler & Kontakt:</h4>
                <p className="text-[11px] text-zinc-700">
                  Jona Noack & Paul Kaiser<br />
                  Umweltmentorenprogramm Baden-Württemberg<br />
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
