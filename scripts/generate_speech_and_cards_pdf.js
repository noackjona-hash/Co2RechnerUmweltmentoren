const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, 'druckmaterialien');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public', 'materials');
const TEMP_DIR = path.join(PROJECT_ROOT, '.temp_pdf_html');

if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// -------------------------------------------------------------
// 1. DIN A6 MODERATIONSKARTEN (2 KARTEN PRO DIN A4 SEITE)
// -------------------------------------------------------------
const cueCardsHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Moderationskarten - Jona Noack & Paul Kaiser</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #09090b;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 190mm;
      height: 277mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      position: relative;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    .cut-line {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      border-top: 1px dashed #a1a1aa;
    }
    .cut-label {
      position: absolute;
      top: calc(50% - 3mm);
      right: 2mm;
      font-family: monospace;
      font-size: 7pt;
      color: #a1a1aa;
      background: #fff;
      padding: 0 2mm;
    }
    .card {
      width: 190mm;
      height: 133mm;
      border: 1.5px solid #18181b;
      border-radius: 4mm;
      padding: 8mm 9mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #fafafa;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #09090b;
      padding-bottom: 2.5mm;
      margin-bottom: 3.5mm;
    }
    .card-num {
      font-family: "Courier New", monospace;
      font-size: 9pt;
      font-weight: 800;
      background: #09090b;
      color: #ffffff;
      padding: 1.5mm 3mm;
      border-radius: 2mm;
    }
    .card-title {
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .card-meta {
      font-family: monospace;
      font-size: 8pt;
      color: #71717a;
    }
    .card-body {
      flex: 1;
      font-size: 9.5pt;
      line-height: 1.45;
      display: flex;
      flex-direction: column;
      gap: 2.5mm;
    }
    .bullet-point {
      display: flex;
      gap: 2.5mm;
      align-items: flex-start;
    }
    .speaker-badge {
      font-size: 7.5pt;
      font-family: monospace;
      font-weight: 700;
      padding: 0.8mm 2mm;
      border-radius: 1.5mm;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .speaker-paul {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .speaker-jona {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .speaker-beamer {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .bullet-text {
      flex: 1;
    }
    .bullet-text strong {
      color: #09090b;
    }
    .card-footer {
      border-top: 1px solid #e4e4e7;
      padding-top: 2.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: monospace;
      font-size: 7.5pt;
      color: #71717a;
    }
    .action-tip {
      font-weight: 600;
      color: #059669;
    }
  </style>
</head>
<body>

  <!-- SEITE 1: KARTEN 1 & 2 -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER SCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 1 -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">KARTE 1 / 6</span>
          <span class="card-title">Begrüßung & Einstieg</span>
        </div>
        <span class="card-meta">00:00 – 02:00 min</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-beamer">BEAMER</span>
          <div class="bullet-text"><strong>Folie 1 anzeigen:</strong> Titel „CO₂-Rechner für Schulen“, Namen Jona Noack & Paul Kaiser.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Begrüßung:</strong> Herr Staatssekretär Deuschle, Ministeriumsvertreter, Jugendstiftung, Mentoren, Lehrkräfte! „Wir freuen uns riesig, heute hier im Innenministerium zu stehen...“</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Vorstellung & Motivation:</strong> „Mein Name ist Jona Noack, zusammen sind wir Umweltmentoren 2025/2026. Unser Ziel: Kein Projekt für die Schublade, sondern ein dauerhaft nutzbares Werkzeug für ganz Baden-Württemberg.“</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Tipp: Freundlicher Blick ins Plenum, Deuschle direkt anblicken, ruhiges Tempo.</span>
        <span>Folientaste: LEERTASTE</span>
      </div>
    </div>

    <!-- KARTE 2 -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">KARTE 2 / 6</span>
          <span class="card-title">Das Problem im Unterricht</span>
        </div>
        <span class="card-meta">02:00 – 04:30 min</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-beamer">BEAMER</span>
          <div class="bullet-text"><strong>Folie 2 weiterklicken:</strong> 3 Problemfelder (Zu komplex · Datenschutz · Kein Klassenverbund).</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Aus Schülersicht erzählen:</strong> Lehrer sagt: „Wir berechnen unseren Fußabdruck.“ Nach 3 Minuten Frust: 1. Rechner für Erwachsene (Liter Heizöl, kWh Strom). 2. Datenschutz-Verstöße (E-Mails, Cookies). 3. Jeder Schüler sitzt isoliert, keine Klassenauswertung.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Die Vision:</strong> Alltagsnah, 100% DSGVO, passend für 45 Minuten. „Und weil wir Umweltmentoren sind, zeigen wir keine Tabellen – wir probieren das jetzt alle live aus!“</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Tipp: Bei „Heizöl“ schmunzeln – das kennen alle Lehrkräfte im Saal!</span>
        <span>Folientaste: LEERTASTE</span>
      </div>
    </div>
  </div>

  <!-- SEITE 2: KARTEN 3 & 4 -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER SCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 3 -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">KARTE 3 / 6</span>
          <span class="card-title">Live-Mitmachrunde im Saal 🔥</span>
        </div>
        <span class="card-meta">04:30 – 08:30 min</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-beamer">BEAMER</span>
          <div class="bullet-text"><strong>Folie 3 weiterklicken:</strong> Großer QR-Code & Schritt-für-Schritt-Anleitung.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Saal auffordern:</strong> Smartphone hochhalten: „Bitte alle Smartphone zücken, Kamera auf den QR-Code richten! Kein Download, keine Registrierung – einfach ‚Als Gast testen‘ antippen.“</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Anleitung während des Tippens:</strong> „10 Alltagsfragen (Anreise heute, Ernährung, Streaming). Dauert unter 2 Minuten. Sofortiges Jahresergebnis in kg CO₂ + Urkunde.“</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Saalabfrage (nach 90 Sek.):</strong> „Wer hat sein Ergebnis schon? Einmal Hand heben!“ Reagieren: „Super, fast der ganze Saal!“</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Tipp: 90 Sekunden Ruhe aushalten, während der Saal tippt. Lächeln, Blickkontakt halten.</span>
        <span>Folientaste: LEERTASTE</span>
      </div>
    </div>

    <!-- KARTE 4 -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">KARTE 4 / 6</span>
          <span class="card-title">Didaktik & 3 Unterrichtsmodi</span>
        </div>
        <span class="card-meta">08:30 – 11:00 min</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-beamer">BEAMER</span>
          <div class="bullet-text"><strong>Folie 4 weiterklicken:</strong> 4 Säulen (Mobilität, Ernährung, Energie, Konsum) + 3 Modi.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Wissenschaftliche Basis:</strong> Faktoren stammen direkt vom Umweltbundesamt (UBA) und GEMIS. 4 Lebensbereiche decken 100% des Alltags ab.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Die 3 Modi für den Schulalltag:</strong><br>
          • <strong>10 Fragen (Quick-Check, 2 Min):</strong> Knackiger Stundeneinstieg.<br>
          • <strong>30 Fragen (Standard, 8–10 Min):</strong> Perfekt für 45-Min-Fachstunde Geo/Bio.<br>
          • <strong>60 Fragen (Detail, 25 Min):</strong> Projekttage, AGs, Schulaudits.</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Tipp: Klar betonen: Es passt exakt in eine 45-Minuten-Schulstunde!</span>
        <span>Folientaste: LEERTASTE</span>
      </div>
    </div>
  </div>

  <!-- SEITE 3: KARTEN 5 & 6 -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER SCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 5 -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">KARTE 5 / 6</span>
          <span class="card-title">Lehrer-Dashboard & DSGVO</span>
        </div>
        <span class="card-meta">11:00 – 13:00 min</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-beamer">BEAMER</span>
          <div class="bullet-text"><strong>Folie 5 weiterklicken:</strong> Lehrer-Dashboard, Klassencode, Live-Balken, Urkunde.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Klassenverbund & Datenschutz:</strong> Lehrer generiert 1-Klick-Code (z.B. KL-8B). Sofortige Klassenauswertung am Beamer. <strong>100% DSGVO:</strong> Keine Schülerdaten auf Servern, Schülernamen für Urkunden werden nur lokal im Browser verarbeitet!</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Handabdruck & Simulator:</strong> „Keine Schuldgefühle!“ Schüler simulieren Maßnahmen (z.B. 2 Tage Veggie = -400kg CO₂). Gedruckte Urkunde mit offiziellem Siegel.</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Tipp: Wortlaut „DSGVO-konform ohne Schüler-Accounts“ begeistert Schulleiter & Ministerium!</span>
        <span>Folientaste: LEERTASTE</span>
      </div>
    </div>

    <!-- KARTE 6 -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">KARTE 6 / 6</span>
          <span class="card-title">Fazit & Übergabe an Deuschle</span>
        </div>
        <span class="card-meta">13:00 – 15:00 min</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-beamer">BEAMER</span>
          <div class="bullet-text"><strong>Folie 6 weiterklicken:</strong> Abschlussfolie, Stellwand-Hinweis, Logos.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Fazit:</strong> Klimaschutz scheitert nicht am Willen, sondern an praxistauglichen Werkzeugen. Die Plattform steht ab heute allen Schulen in BW kostenlos zur Verfügung.</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Einladung & Übergabe:</strong> „Besuchen Sie uns gleich an unserer Stellwand im Projekte-Markt für Handouts und Schulcodes. Herzlichen Dank – und nun freuen wir uns auf Staatssekretär Andreas Deuschle!“</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Tipp: Verbeugen, Blick zu Deuschle, Lächeln und Applaus abwarten.</span>
        <span>Ende des Vortrags</span>
      </div>
    </div>
  </div>

  <!-- SEITE 4: Q&A DEFENSE & NOTFALLKARTEN -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER SCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 7: Q&A -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">EXTRA 1</span>
          <span class="card-title">Q&A Defense (Fragen abfangen)</span>
        </div>
        <span class="card-meta">Nach dem Vortrag</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Frage: Wie sicher ist der Datenschutz an Schulen?</strong><br>
          „Zu 100%. Keine E-Mail, kein Benutzername für Schüler. Anonymer Klassencode. Urkundennamen werden ausschließlich lokal im RAM des Browsers eingesetzt.“</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">PAUL</span>
          <div class="bullet-text"><strong>Frage: Was kostet die Plattform für Schulen?</strong><br>
          „0,00 Euro. Als Umweltmentoren haben wir die Plattform als Open-Source-Gemeinwohlprojekt gebaut. Dauerhaft kostenlos, keine Werbung.“</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-jona">JONA</span>
          <div class="bullet-text"><strong>Frage: Passt das in den Bildungsplan BW?</strong><br>
          „Ja, Leitperspektive BNE. Fächer Geographie (Kl. 7-10), Biologie/BNT und Gemeinschaftskunde.“</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Tipp: Ruhig, präzise und selbstbewusst antworten.</span>
        <span>Stichwort: BNE & DSGVO</span>
      </div>
    </div>

    <!-- KARTE 8: NOTFALL-BACKUP -->
    <div class="card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <span class="card-num">EXTRA 2</span>
          <span class="card-title">Technik & Notfall-Plan</span>
        </div>
        <span class="card-meta">Quick-Fixes</span>
      </div>
      <div class="card-body">
        <div class="bullet-point">
          <span class="speaker-badge speaker-beamer">TASTEN</span>
          <div class="bullet-text"><strong>Tastatur-Kürzel auf dem Präsentations-Laptop:</strong><br>
          • <strong>F</strong> = Vollbild an/aus<br>
          • <strong>Leertaste / Pfeil rechts</strong> = Folie vorwärts<br>
          • <strong>Pfeil links</strong> = Folie zurück<br>
          • <strong>Zahlen 1 bis 6</strong> = Direkt zu Folie 1 bis 6 springen</div>
        </div>
        <div class="bullet-point">
          <span class="speaker-badge speaker-paul">NOTFALL</span>
          <div class="bullet-text"><strong>Falls Saal-WLAN schwach ist:</strong><br>
          Paul sagt locker: „Wer kein Netz hat, schaut einfach kurz beim Nachbarn aufs Display oder testet nachher an unserer Stellwand im Projekte-Markt!“</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="action-tip">👉 Wichtig: Niemals aus der Ruhe bringen lassen. Ihr seid die Experten!</span>
        <span>Umweltmentoren 2025/2026</span>
      </div>
    </div>
  </div>

</body>
</html>
`;

// -------------------------------------------------------------
// 2. DIN A4 BÜHNEN-SPRECHTEXT (VOLLSTÄNDIGER LESETEXT)
// -------------------------------------------------------------
const scriptHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Bühnen-Sprechtext: Jona Noack & Paul Kaiser</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 20mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #18181b;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-block {
      border-bottom: 2px solid #09090b;
      padding-bottom: 5mm;
      margin-bottom: 6mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .top-tag {
      font-family: monospace;
      font-size: 8pt;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1.5mm;
    }
    h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #09090b;
      letter-spacing: -0.5px;
    }
    .sub {
      font-size: 11pt;
      color: #52525b;
      margin-top: 1mm;
    }
    .meta-box {
      text-align: right;
      font-family: monospace;
      font-size: 8.5pt;
      color: #52525b;
      line-height: 1.4;
    }
    .section-title {
      font-family: monospace;
      font-size: 9.5pt;
      font-weight: 800;
      color: #09090b;
      background: #f4f4f5;
      border-left: 3px solid #09090b;
      padding: 2mm 3.5mm;
      margin: 6mm 0 3mm 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      justify-content: space-between;
    }
    .beamer-cue {
      font-size: 9pt;
      font-style: italic;
      color: #b45309;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 1.5mm 3mm;
      border-radius: 1.5mm;
      margin-bottom: 3mm;
      display: inline-block;
    }
    .speech {
      margin-bottom: 3.5mm;
      padding-left: 3mm;
    }
    .speaker {
      font-family: monospace;
      font-weight: 800;
      font-size: 9.5pt;
      padding: 0.5mm 2mm;
      border-radius: 1mm;
      display: inline-block;
      margin-bottom: 1mm;
    }
    .speaker-p { background: #dbeafe; color: #1e40af; }
    .speaker-j { background: #dcfce7; color: #166534; }
    .quote {
      color: #09090b;
      font-size: 10.5pt;
    }
    .quote em {
      color: #52525b;
      font-style: italic;
    }
    .stage-direction {
      font-size: 8.5pt;
      color: #71717a;
      font-style: italic;
      margin-left: 2mm;
    }
    .footer-note {
      margin-top: 8mm;
      border-top: 1px solid #e4e4e7;
      padding-top: 3mm;
      font-family: monospace;
      font-size: 8pt;
      color: #a1a1aa;
      display: flex;
      justify-content: space-between;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- SEITE 1 -->
  <div class="header-block">
    <div>
      <div class="top-tag">Abschlussveranstaltung Umweltmentoren 2025/2026</div>
      <h1>🎤 Wort-für-Wort-Bühnentext</h1>
      <div class="sub">Vortrag „APP zum CO₂-Fußabdruck“ · Jona Noack & Paul Kaiser</div>
    </div>
    <div class="meta-box">
      <strong>25. September 2026</strong><br>
      13:15 – 13:30 Uhr (15 Min)<br>
      Innenministerium Stuttgart
    </div>
  </div>

  <div class="section-title">
    <span>Minute 00:00 – 02:00 | Begrüßung & Der Einstieg</span>
    <span>[FOLIE 1]</span>
  </div>
  <div class="beamer-cue">🖥️ BEAMER: Folie 1 (Titel, Jona Noack & Paul Kaiser)</div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <span class="stage-direction">(Mit fester Stimme, Blick ins Plenum, freundliches Lächeln)</span>
    <div class="quote">
      „Sehr geehrter Herr Staatssekretär Deuschle, liebe Vertreterinnen und Vertreter des Kultusministeriums und der Jugendstiftung, liebe Mentorinnen und Mentoren, liebe Lehrkräfte!<br>
      Wir freuen uns riesig, heute hier im Innenministerium zu stehen. Mein Name ist Paul Kaiser …“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-j">JONA NOACK:</span>
    <div class="quote">
      „… und mein Name ist Jona Noack. Wir beide sind Schüler und Umweltmentoren des Kurses 2025/2026.<br>
      Als wir vor einem knappen Jahr mit der Ausbildung begonnen haben, hatten wir ein klares Ziel vor Augen: Wir wollten kein Projekt machen, das nach ein paar Wochen verstaubt. Wir wollten ein Werkzeug schaffen, das dauerhaft an Schulen in ganz Baden-Württemberg genutzt werden kann – im echten Unterricht.“
    </div>
  </div>

  <div class="section-title">
    <span>Minute 02:00 – 04:30 | Das Problem aus Schülersicht</span>
    <span>[FOLIE 2]</span>
  </div>
  <div class="beamer-cue">🖥️ BEAMER: Folie 2 weiterklicken (Warum scheitern bisherige Rechner im Unterricht?)</div>

  <div class="speech">
    <span class="speaker speaker-j">JONA NOACK:</span>
    <span class="stage-direction">(Geht einen Schritt nach vorne, spricht engagiert)</span>
    <div class="quote">
      „Wir alle kennen die Situation aus der Schule: Im Geographie-, Biologie- oder Gemeinschaftskundeunterricht steht das Thema Klimawandel an. Die Lehrkraft sagt: <em>‚Heute berechnen wir alle unseren persönlichen CO₂-Fußabdruck!‘</em><br>
      Man öffnet einen der bekannten Online-Rechner – und nach genau drei Minuten bricht das Chaos aus.<br>
      Warum?<br>
      <strong>Erstens: Die Rechner sind für Erwachsene gebaut.</strong> Da wird gefragt: <em>‚Wie viele Liter Heizöl verbraucht Ihre Zentralheizung im Jahr?‘</em> oder <em>‚Wie viele Kilowattstunden Strom hat Ihre Wohnung?‘</em>. Welcher 14-jährige Schüler kennt die Nebenkostenabrechnung seiner Eltern? Richtig: Niemand.<br>
      <strong>Zweitens: Der Datenschutz.</strong> Viele Plattformen verlangen E-Mail-Adressen, Accounts oder setzen Werbe-Cookies. An Schulen in Baden-Württemberg ist das zu Recht ein absolutes No-Go.<br>
      <strong>Und drittens: Es fehlt der Klassenbezug.</strong> Am Ende sitzt jeder Schüler isoliert vor einer Zahl wie ‚8,4 Tonnen‘ – aber die Lehrkraft hat keine gemeinsame Auswertung für die Klasse.“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <span class="stage-direction">(Zustimmendes Nicken, übernimmt das Wort)</span>
    <div class="quote">
      „Deshalb haben wir uns gesagt: Das muss doch besser gehen!<br>
      Unsere Vision war ein Rechner, der <strong>alltagsnah</strong> ist, der <strong>100% datenschutzkonform</strong> funktioniert und der perfekt in eine ganz normale <strong>45-Minuten-Schulstunde</strong> passt.<br>
      Und weil wir Umweltmentoren sind, zeigen wir Ihnen jetzt keine langweiligen Tabellen – sondern wir probieren das jetzt alle gemeinsam live aus!“
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SEITE 2 -->
  <div class="section-title">
    <span>Minute 04:30 – 08:30 | Das Highlight: Live-Mitmachrunde im Saal</span>
    <span>[FOLIE 3]</span>
  </div>
  <div class="beamer-cue">🖥️ BEAMER: Folie 3 weiterklicken (Riesiger QR-Code füllt die Leinwand)</div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <span class="stage-direction">(Hebt sein eigenes Smartphone in die Hand, animierende Geste ins Publikum)</span>
    <div class="quote">
      „Wir bitten jetzt alle im Saal – von den Mentorinnen und Mentoren über die Lehrkräfte bis hin zu Herrn Staatssekretär Deuschle:<br>
      <strong>Bitte nehmen Sie jetzt Ihr Smartphone zur Hand und öffnen Sie die Kamera.</strong><br>
      Scannen Sie den großen QR-Code hier auf der Leinwand.<br>
      <em>(Kurze Pause von ca. 5 Sekunden, wartet bis Handys gehoben werden)</em><br>
      Sie müssen <strong>keine App herunterladen</strong> und <strong>kein Konto anlegen</strong>. Tippen Sie einfach auf den Button <strong>‚Als Gast testen‘</strong>.“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-j">JONA NOACK:</span>
    <span class="stage-direction">(Kommentiert locker, während im Publikum getippt wird)</span>
    <div class="quote">
      „Sie sehen jetzt unseren <strong>10-Fragen-Quick-Check</strong>.<br>
      Es sind keine Fragen nach Heizöl, sondern nach Ihrem Alltag: Wie sind Sie heute angereist – Zug oder Auto? Wie oft essen Sie Fleisch? Wie lange streamen Sie Serien?<br>
      Beantworten Sie die 10 Fragen ganz spontan. In weniger als zwei Minuten haben Sie Ihr persönliches Jahresergebnis in Kilogramm CO₂ – und Ihre erste Klimaschutz-Urkunde!“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <span class="stage-direction">(Nach ca. 90 Sekunden Publikumstest)</span>
    <div class="quote">
      „Wer von Ihnen hat sein Ergebnis schon auf dem Display? Einmal kurz die Hand heben!<br>
      <em>(Blickt in die Runde, reagiert auf Handzeichen)</em><br>
      Großartig, fast der halbe Saal!<br>
      Und Sie sehen direkt auf Ihrem Bildschirm: Nicht nur den nackten CO₂-Wert, sondern was das in der Praxis bedeutet – wie viele Bäume man zur Bindung bräuchte oder wie viele Kilometer Autofahrt das entspricht.“
    </div>
  </div>

  <div class="section-title">
    <span>Minute 08:30 – 11:00 | Didaktischer Aufbau & Die 3 Spielmodi</span>
    <span>[FOLIE 4]</span>
  </div>
  <div class="beamer-cue">🖥️ BEAMER: Folie 4 weiterklicken (4 Säulen & flexible Unterrichtsmodi)</div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <div class="quote">
      „Was Sie gerade auf dem Smartphone erlebt haben, basiert auf einem durchdachten didaktischen Konzept:<br>
      Wir bilanzieren in <strong>vier klaren Lebensbereichen</strong>: Mobilität, Ernährung, Energie und Konsum. Alle Umrechnungsfaktoren stammen aus wissenschaftlich validierten Datenbanken des <strong>Umweltbundesamts (UBA)</strong> und von <strong>GEMIS</strong>.“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-j">JONA NOACK:</span>
    <span class="stage-direction">(Übernimmt, erläutert die Praxis für Schulen)</span>
    <div class="quote">
      „Weil jeder Schultag anders ist, haben wir die App modular aufgebaut:<br>
      • <strong>Modus 1: Der Quick-Check mit 10 Fragen</strong> – genau das, was Sie gerade gemacht haben. Dauert 2 bis 3 Minuten. Perfekt als knackiger Einstieg in eine Schulstunde.<br>
      • <strong>Modus 2: Der Standard-Check mit 30 Fragen.</strong> Dauert etwa 8 bis 10 Minuten. Hier differenzieren wir genauer zwischen Bahn, Fahrrad, Fleischkonsum und Heizgewohnheiten. Das ist der Klassiker für eine reguläre Fachstunde in Geographie oder Biologie.<br>
      • <strong>Modus 3: Der Detail-Check mit 60 Fragen.</strong> Für Projekttage, Umwelt-AGs oder Schulaudits, bei denen Klassen wirklich tief in die Daten einsteigen wollen.“
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SEITE 3 -->
  <div class="section-title">
    <span>Minute 11:00 – 13:00 | Lehrkräfte-Dashboard & 100% Datenschutz</span>
    <span>[FOLIE 5]</span>
  </div>
  <div class="beamer-cue">🖥️ BEAMER: Folie 5 weiterklicken (Dashboard für Lehrkräfte & Offizielle Urkunden)</div>

  <div class="speech">
    <span class="speaker speaker-j">JONA NOACK:</span>
    <span class="stage-direction">(Besonders wichtig für Lehrkräfte und Ministerium)</span>
    <div class="quote">
      „Der eigentliche pädagogische Zauber entsteht aber durch unser <strong>Lehrkräfte-Dashboard</strong>:<br>
      Eine Lehrkraft kann sich im Schulportal einloggen und mit einem einzigen Klick einen <strong>anonymen Klassencode</strong> generieren – zum Beispiel ‚KL-8B-KLIMA‘.<br>
      Die Schüler geben diesen Code ein, füllen das Quiz aus – und die Lehrkraft sieht am Beamer <strong>in Echtzeit den Durchschnitt der gesamten Klasse</strong>.<br>
      Man sieht sofort: Wo spart unsere Klasse schon heute CO₂ ein? Und wo liegt unser größter Hebel – ist es das Elterntaxi oder der Konsum?<br>
      Und jetzt das Entscheidende für Baden-Württemberg:<br>
      <strong>Die App ist zu 100% DSGVO-konform.</strong><br>
      Schüler müssen sich weder registrieren noch Passwörter merken. Und wenn am Ende eine persönliche Urkunde ausgedruckt wird, wird der Name des Schülers <strong>ausschließlich lokal im Webbrowser</strong> eingesetzt – auf unseren Servern wird niemals ein einziger Schülername gespeichert!“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <span class="stage-direction">(Ergänzt zur Urkunde & Handabdruck)</span>
    <div class="quote">
      „Und noch ein Punkt war uns extrem wichtig: <strong>Keine Schuldgefühle erzeugen, sondern Handeln anstoßen!</strong><br>
      Deshalb hat unsere App einen interaktiven <strong>Maßnahmen-Simulator</strong>. Die Jugendlichen können anklicken: <em>‚Was passiert, wenn ich zwei Tage die Woche vegetarisch esse oder mit dem Rad zur Schule fahre?‘</em><br>
      Der Rechner zeigt live: <em>‚Du sparst 400 Kilo CO₂ im Jahr und entlastest 32 Bäume.‘</em><br>
      Dieses Versprechen wird direkt auf die gedruckte Urkunde übernommen. So wird aus dem Fußabdruck ein wirksamer <strong>Handabdruck</strong>!“
    </div>
  </div>

  <div class="section-title">
    <span>Minute 13:00 – 15:00 | Fazit, Dank & Übergabe an Staatssekretär Deuschle</span>
    <span>[FOLIE 6]</span>
  </div>
  <div class="beamer-cue">🖥️ BEAMER: Folie 6 weiterklicken (Gemeinsam CO₂ senken – an jeder Schule!)</div>

  <div class="speech">
    <span class="speaker speaker-j">JONA NOACK:</span>
    <span class="stage-direction">(Schlussrunde, spricht das gesamte Plenum an)</span>
    <div class="quote">
      „Unsere Botschaft heute ist ganz einfach:<br>
      Klimaschutz an Schulen scheitert nicht am Willen der Jugendlichen und auch nicht am Engagement der Lehrkräfte. Er scheiterte bisher oft an komplizierten, unzugänglichen Werkzeugen.<br>
      Mit unserem CO₂-Rechner steht ab heute ein kostenloses, modernes und datenschutzkonformes Tool für alle Schulen in Baden-Württemberg bereit.“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <span class="stage-direction">(Schaut zu Staatssekretär Andreas Deuschle und ins Publikum)</span>
    <div class="quote">
      „Wenn Sie Lehrkraft oder Mentor sind: Besuchen Sie uns gleich im Anschluss an unserer Stellwand im Projekte-Markt. Wir haben fertige Verlaufspläne und Handouts für Sie vorbereitet, und wir richten Ihnen gerne direkt einen Schulzugang ein.<br>
      Wir danken der Jugendstiftung Baden-Württemberg, dem Ministerium und unserem gesamten Mentorenkurs für die Unterstützung im vergangenen Jahr.<br>
      <strong>Und nun freuen wir uns ganz besonders auf den Impuls und das Gespräch mit Staatssekretär Andreas Deuschle!</strong><br>
      Vielen Dank!“<br>
      <em>(Gemeinsame Verbeugung, Lächeln, Applaus abwarten)</em>
    </div>
  </div>

  <div class="footer-note">
    <span>CO₂-Rechner für Schulen · Umweltmentoren 2025/2026</span>
    <span>Seite 3 / 3</span>
    <span>Jona Noack & Paul Kaiser</span>
  </div>

</body>
</html>
`;

async function run() {
  console.log('Writing HTML files...');
  const cardsHtmlPath = path.join(TEMP_DIR, '06_Moderationskarten_Buehnenkarten_DIN_A6.html');
  const scriptHtmlPath = path.join(TEMP_DIR, '07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.html');

  fs.writeFileSync(cardsHtmlPath, cueCardsHtml, 'utf8');
  fs.writeFileSync(scriptHtmlPath, scriptHtml, 'utf8');

  console.log('Rendering 06_Moderationskarten_Buehnenkarten_DIN_A6.pdf...');
  const cardsPdfDest = path.join(PDF_DIR, '06_Moderationskarten_Buehnenkarten_DIN_A6.pdf');
  const cardsPublicDest = path.join(PUBLIC_DIR, '06_Moderationskarten_Buehnenkarten_DIN_A6.pdf');

  execSync(`"${CHROME_PATH}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${cardsPdfDest}" "file:///${cardsHtmlPath.replace(/\\\\/g, '/')}"`);
  fs.copyFileSync(cardsPdfDest, cardsPublicDest);
  console.log('Cards PDF generated:', fs.statSync(cardsPdfDest).size, 'bytes');

  console.log('Rendering 07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf...');
  const scriptPdfDest = path.join(PDF_DIR, '07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf');
  const scriptPublicDest = path.join(PUBLIC_DIR, '07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf');

  execSync(`"${CHROME_PATH}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${scriptPdfDest}" "file:///${scriptHtmlPath.replace(/\\\\/g, '/')}"`);
  fs.copyFileSync(scriptPdfDest, scriptPublicDest);
  console.log('Script PDF generated:', fs.statSync(scriptPdfDest).size, 'bytes');

  console.log('SUCCESS! Both PDFs generated in druckmaterialien and public/materials');
}

run().catch(err => {
  console.error('Error generating PDFs:', err);
  process.exit(1);
});
