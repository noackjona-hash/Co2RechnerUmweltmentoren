'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Printer,
  Presentation,
  Download,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import SpeechFlipcards from '@/components/admin/speech-flipcards';

export default function AdminMaterialsTab() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [guestLink, setGuestLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://co2-rechner-umweltmentoren.vercel.app';
    setGuestLink(origin);

    QRCode.toDataURL(origin, {
      width: 1200,
      margin: 1,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="paper-stamp text-[10px] font-mono uppercase">
              25.09.2026 · Innenministerium Stuttgart
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Projekte-Markt & Bühnenvortrag
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Ausstellungsplakat & Präsentation
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Das offizielle minimalistische Ausstellungsplakat für die Stellwand sowie die Beamer-Präsentation für den 15-Minuten-Vortrag.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/presentation"
            target="_blank"
            className="paper-btn-primary !min-h-[40px] !text-xs !py-2 !px-4 flex items-center gap-2 shadow-sm font-semibold"
          >
            <Presentation className="w-4 h-4" />
            <span>Präsentation starten ↗</span>
          </Link>

          <a
            href="/materials/01_Ausstellungsplakat_DIN_A2.pdf"
            download="01_Ausstellungsplakat_DIN_A2.pdf"
            className="paper-btn-secondary !min-h-[40px] !text-xs !py-2 !px-3.5 flex items-center gap-1.5 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Plakat PDF (A2)</span>
          </a>

          <a
            href="/materials/06_Moderationskarten_Buehnenkarten_DIN_A6.pdf"
            download="06_Moderationskarten_Buehnenkarten_DIN_A6.pdf"
            className="paper-btn-secondary !min-h-[40px] !text-xs !py-2 !px-3.5 flex items-center gap-1.5 font-medium"
            title="Druckbare Spickzettel-Karten im DIN A6 Format für die Hand auf der Bühne"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Karten PDF (A6)</span>
          </a>

          <a
            href="/materials/07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf"
            download="07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf"
            className="paper-btn-secondary !min-h-[40px] !text-xs !py-2 !px-3.5 flex items-center gap-1.5 font-medium"
            title="Kompletter Wort-für-Wort-Sprechtext für Jona und Paul"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sprechtext PDF (A4)</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="paper-btn-secondary !min-h-[40px] !text-xs !py-2 !px-3.5 flex items-center gap-1.5 font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Plakat drucken</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          1. DAS OFFIZIELLE AUSSTELLUNGSPLAKAT (SIMPEL, HOCHWERTIG, MINIMALISTISCH)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded">
              01
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Das Ausstellungsplakat (Stellwand-Format DIN A2 / A1)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Vorschau & Druckvorlage
            </span>
            <a
              href="/materials/01_Ausstellungsplakat_DIN_A2.pdf"
              download="01_Ausstellungsplakat_DIN_A2.pdf"
              className="text-xs text-foreground hover:text-muted-foreground underline underline-offset-4 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>PDF laden</span>
            </a>
          </div>
        </div>

        {/* Minimalist Poster Card Preview */}
        <article className="bg-white text-zinc-950 p-6 sm:p-12 rounded-3xl border-4 border-zinc-950 shadow-xl space-y-8 max-w-5xl mx-auto font-sans">
          {/* Header */}
          <div className="border-b-2 border-zinc-950 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="font-mono text-[11px] font-bold tracking-widest uppercase text-zinc-500">
                Land Baden-Württemberg · Umweltmentoren 2025/2026
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-zinc-950 leading-tight">
                CO₂-Rechner für Schulen
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 font-medium">
                Wissenschaftlich fundierte Klimabilanzierung & Handlungsprojekte im Unterricht.
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-zinc-500 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-3 sm:pt-0 sm:pl-6 shrink-0 leading-relaxed">
              Innenministerium Stuttgart · 25.09.2026<br />
              Entwickelt von <strong className="text-zinc-950 font-bold">Jona Noack & Paul Kaiser</strong>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: 3 Core Highlights (7 Cols) */}
            <div className="md:col-span-7 space-y-6">
              <div className="flex gap-4 items-start">
                <span className="font-mono text-xs font-bold text-zinc-950 bg-zinc-100 border border-zinc-950 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  01
                </span>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-zinc-950">
                    Jugendgerecht & Wissenschaftlich
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Verständliche Alltagsfragen in 4 Kernbereichen (Mobilität, Ernährung, Energie, Konsum) statt komplexer Kilowattstunden-Rechnungen. Berechnungsgrundlage validiert anhand von Umweltbundesamt (UBA) und GEMIS.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="font-mono text-xs font-bold text-zinc-950 bg-zinc-100 border border-zinc-950 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  02
                </span>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-zinc-950">
                    100% Datenschutz & 3 Spielmodi
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Vollständig DSGVO-konform für Schulen: Keine Passwörter, keine E-Mail-Adressen, keine Server-Speicherung von Schülernamen. Flexibel einsetzbar in 10 Fragen (Quick-Check, 2 Min), 30 Fragen (Standard) oder 60 Fragen (Detail).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="font-mono text-xs font-bold text-zinc-950 bg-zinc-100 border border-zinc-950 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  03
                </span>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-zinc-950">
                    Vom Fußabdruck zum Handabdruck
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Lehrkräfte-Dashboard mit Live-Klassenauswertung für den Beamer. Der integrierte Simulator ermöglicht persönliche Klimaschutz-Versprechen mit automatischem Ausdruck motivierender Schüler-Urkunden.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Mitmachstation QR Card (5 Cols) */}
            <div className="md:col-span-5">
              <div className="border-2 border-zinc-950 rounded-2xl p-6 text-center bg-zinc-50 space-y-4">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-zinc-950 text-white px-3 py-1 rounded-full inline-block">
                  Live ausprobieren
                </span>

                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-lg sm:text-xl text-zinc-950">
                    Smartphone zücken & testen
                  </h4>
                  <p className="text-xs text-zinc-600">
                    Ermittle deinen Fußabdruck jetzt in nur 2 Minuten live:
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-zinc-200 inline-block shadow-sm">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR-Code zum CO2-Rechner"
                      className="w-40 h-40 sm:w-48 sm:h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-40 h-40 sm:w-48 sm:h-48 bg-zinc-100 flex items-center justify-center font-mono text-xs text-zinc-400">
                      QR-Code lädt...
                    </div>
                  )}
                </div>

                <div className="font-mono text-[11px] font-bold text-zinc-900 bg-white border border-zinc-300 py-1.5 px-3 rounded-lg break-all">
                  co2-rechner-umweltmentoren.vercel.app
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-200 text-xs font-medium text-zinc-600">
                  <span>1. Scannen</span>
                  <span>·</span>
                  <span>2. Als Gast starten</span>
                  <span>·</span>
                  <span>3. Urkunde</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-500 gap-2">
            <div>Kostenloses Bildungstool für Schulen in Baden-Württemberg</div>
            <div>
              Projektteam: <strong className="text-zinc-950">Jona Noack & Paul Kaiser</strong> · Umweltmentoren
            </div>
          </div>
        </article>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. DIE BEAMER-PRÄSENTATION (BÜHNENSLOT 13:15–13:30 UHR)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded">
              02
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Die Beamer-Präsentation (15-Minuten-Bühnenslot)
            </h3>
          </div>

          <Link
            href="/presentation"
            target="_blank"
            className="text-xs text-foreground hover:text-muted-foreground underline underline-offset-4 flex items-center gap-1 font-medium"
          >
            <span>Präsentation in Vollbild öffnen</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                Bühnenauftritt: 13:15 – 13:30 Uhr
              </span>
              <h4 className="text-base font-semibold text-foreground">
                APP zum CO₂-Fußabdruck – Präsentation vor Staatssekretär Andreas Deuschle
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saubere 16:9 Vollbild-Folien mit integrierter Live-Mitmachrunde für das Publikum im Saal.
              </p>
            </div>

            <Link
              href="/presentation"
              target="_blank"
              className="paper-btn-primary !min-h-[42px] !text-xs !py-2 !px-5 flex items-center justify-center gap-2 font-semibold shrink-0"
            >
              <Presentation className="w-4 h-4" />
              <span>Präsentation jetzt starten ↗</span>
            </Link>
          </div>

          {/* Slide Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {[
              { num: '01', title: 'Titel & Team', sub: 'Jona & Paul Vorstellung' },
              { num: '02', title: 'Problem & Idee', sub: 'Warum bisherige Rechner scheitern' },
              { num: '03', title: 'Live-Mitmachrunde', sub: 'Saal scannt Riesen-QR-Code' },
              { num: '04', title: 'Die 3 Spielmodi', sub: '10Q, 30Q und 60Q' },
              { num: '05', title: 'Dashboard & Urkunden', sub: 'Klassenanalyse & DSGVO' },
              { num: '06', title: 'Rollout & Dank', sub: 'Einsatz im Land & Fragen' },
            ].map((slide) => (
              <div
                key={slide.num}
                className="p-3 rounded-xl border border-border bg-background space-y-1 text-left"
              >
                <span className="font-mono text-[10px] text-muted-foreground font-bold">
                  Folie {slide.num}
                </span>
                <h5 className="text-xs font-semibold text-foreground leading-tight">
                  {slide.title}
                </h5>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {slide.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Direct Link Box */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground shrink-0" />
              <span className="text-muted-foreground">
                Direktlink für das Publikum:{' '}
                <strong className="text-foreground font-mono">{guestLink}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="paper-btn-secondary !min-h-[32px] !text-xs !py-1 !px-3 flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopiert!' : 'Link kopieren'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. BÜHNENTEXT & MODERATIONSKARTEN (15-MINUTEN VORTRAG)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4 print:hidden">
        <SpeechFlipcards />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          PRINT-ONLY WRAPPER (FOR BROWSER PRINT)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="hidden print:block">
        <article className="p-12 text-zinc-950 font-sans space-y-8">
          <div className="border-b-2 border-zinc-950 pb-6 flex items-end justify-between">
            <div>
              <div className="font-mono text-[11px] font-bold tracking-widest uppercase text-zinc-500">
                Land Baden-Württemberg · Umweltmentoren 2025/2026
              </div>
              <h1 className="text-4xl font-serif font-black tracking-tight text-zinc-950">
                CO₂-Rechner für Schulen
              </h1>
              <p className="text-sm text-zinc-600 font-medium">
                Wissenschaftlich fundierte Klimabilanzierung & Handlungsprojekte im Unterricht.
              </p>
            </div>
            <div className="text-right font-mono text-xs text-zinc-500">
              Innenministerium Stuttgart · 25.09.2026<br />
              Entwickelt von <strong className="text-zinc-950 font-bold">Jona Noack & Paul Kaiser</strong>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="col-span-7 space-y-6">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-zinc-950">
                  01 / Jugendgerecht & Wissenschaftlich
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Verständliche Alltagsfragen in 4 Sektoren (Mobilität, Ernährung, Energie, Konsum). Valide Datenbasis anhand Umweltbundesamt (UBA) und GEMIS.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-zinc-950">
                  02 / 100% Datenschutz & 3 Spielmodi
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Vollständig DSGVO-konform für Schulen. Keine Passwörter, keine E-Mails, keine Speicherung von Schülernamen auf Servern. 10 Fragen (Quick-Check), 30 Fragen (Standard) oder 60 Fragen (Detail).
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-zinc-950">
                  03 / Vom Fußabdruck zum Handabdruck
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Lehrkräfte-Dashboard mit Live-Klassenauswertung für den Beamer, interaktiver Maßnahmen-Simulator und druckbare Urkunden.
                </p>
              </div>
            </div>

            <div className="col-span-5 border-2 border-zinc-950 rounded-2xl p-6 text-center space-y-3">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-zinc-950 text-white px-3 py-1 rounded-full inline-block">
                Live ausprobieren
              </span>
              <h4 className="font-serif font-bold text-lg text-zinc-950">
                Smartphone zücken & testen
              </h4>
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR-Code"
                  className="w-44 h-44 mx-auto"
                />
              )}
              <div className="font-mono text-[11px] font-bold text-zinc-900 border border-zinc-300 py-1 px-2 rounded">
                co2-rechner-umweltmentoren.vercel.app
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4 flex justify-between text-xs font-mono text-zinc-500">
            <div>Kostenloses Bildungstool für Schulen in Baden-Württemberg</div>
            <div>Jona Noack & Paul Kaiser · Umweltmentoren</div>
          </div>
        </article>
      </div>
    </div>
  );
}
