const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, 'druckmaterialien');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public', 'materials');
const TEMP_DIR = path.join(PROJECT_ROOT, '.temp_pdf_html');

if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('Generating QR code...');
  const appUrl = 'https://co2-rechner-umweltmentoren.vercel.app';
  const qrDataUrl = await QRCode.toDataURL(appUrl, {
    width: 1200,
    margin: 2,
    color: { dark: '#09090b', light: '#ffffff' },
    errorCorrectionLevel: 'H'
  });

  console.log('Creating HTML templates...');

  // 1. Ausstellungsplakat (DIN A2 Landscape: 594mm x 420mm)
  const posterHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Ausstellungsplakat - CO2-Rechner für Schulen</title>
  <style>
    @page {
      size: 594mm 420mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 594mm;
      height: 420mm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #09090b;
      padding: 16mm 20mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      border-bottom: 2.5mm solid #09090b;
      padding-bottom: 7mm;
      margin-bottom: 7mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .badge-bar {
      font-family: "Courier New", Courier, monospace;
      font-size: 8.5pt;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #52525b;
      margin-bottom: 3mm;
      font-weight: bold;
    }
    h1 {
      font-size: 32pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.1;
      color: #09090b;
    }
    .subtitle {
      font-size: 13pt;
      color: #3f3f46;
      margin-top: 2.5mm;
      max-width: 380mm;
      line-height: 1.35;
    }
    .meta-box {
      text-align: right;
      font-family: "Courier New", Courier, monospace;
      font-size: 9pt;
      color: #52525b;
      line-height: 1.5;
      border-left: 1mm solid #e4e4e7;
      padding-left: 6mm;
    }
    .meta-box strong {
      color: #09090b;
      font-size: 10pt;
    }

    .columns {
      display: grid;
      grid-template-columns: 1fr 1.1fr 1fr;
      gap: 12mm;
      flex: 1;
      min-height: 0;
    }
    .col {
      display: flex;
      flex-direction: column;
      gap: 5mm;
    }
    .card {
      border: 0.8mm solid #e4e4e7;
      border-radius: 4mm;
      padding: 5mm 6mm;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      gap: 2.5mm;
    }
    .card-title {
      font-size: 12pt;
      font-weight: 700;
      color: #09090b;
      display: flex;
      align-items: center;
      gap: 2mm;
      border-bottom: 0.4mm solid #e4e4e7;
      padding-bottom: 2mm;
    }
    .card-title span.tag {
      font-family: "Courier New", Courier, monospace;
      font-size: 8pt;
      background: #09090b;
      color: #ffffff;
      padding: 0.5mm 2mm;
      border-radius: 1mm;
    }
    p, li {
      font-size: 9.5pt;
      line-height: 1.45;
      color: #3f3f46;
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 2mm;
    }
    li strong {
      color: #09090b;
    }

    /* Column 2: Live Mitmachstation Hero */
    .hero-card {
      border: 1.5mm solid #09090b;
      background: #ffffff;
      border-radius: 5mm;
      padding: 7mm;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4mm 10mm rgba(0,0,0,0.06);
    }
    .hero-badge {
      font-family: "Courier New", Courier, monospace;
      font-size: 8.5pt;
      background: #10b981;
      color: #ffffff;
      padding: 1mm 3mm;
      border-radius: 2mm;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 3mm;
      text-transform: uppercase;
    }
    .hero-title {
      font-size: 16pt;
      font-weight: 800;
      color: #09090b;
      margin-bottom: 1mm;
    }
    .hero-desc {
      font-size: 9pt;
      color: #71717a;
      margin-bottom: 4mm;
    }
    .qr-frame {
      border: 1mm solid #09090b;
      border-radius: 3mm;
      padding: 3mm;
      background: #ffffff;
      margin-bottom: 3mm;
    }
    .qr-frame img {
      width: 52mm;
      height: 52mm;
      display: block;
    }
    .direct-url {
      font-family: "Courier New", Courier, monospace;
      font-size: 9pt;
      font-weight: bold;
      color: #09090b;
      background: #f4f4f5;
      padding: 1.5mm 4mm;
      border-radius: 2mm;
      border: 0.4mm solid #d4d4d8;
    }

    .footer {
      border-top: 1mm solid #09090b;
      padding-top: 4mm;
      margin-top: 5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: "Courier New", Courier, monospace;
      font-size: 8pt;
      color: #71717a;
    }
    .footer-left strong {
      color: #09090b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="badge-bar">Land Baden-Württemberg · Kultusministerium · Umweltmentoren-Abschluss 2026</div>
      <h1>CO₂-Rechner für Schulen</h1>
      <div class="subtitle">Wissenschaftlich fundierte, anonyme Klimabilanzierung & wirksame Handlungsprojekte im Unterricht.</div>
    </div>
    <div class="meta-box">
      <strong>Projekte-Markt · Stellwand 140 × 120 cm</strong><br>
      Innenministerium Stuttgart · 25.09.2026<br>
      Entwickelt von <strong>Jona Noack & Paul Kaiser</strong>
    </div>
  </div>

  <div class="columns">
    <!-- COL 1 -->
    <div class="col">
      <div class="card">
        <div class="card-title">
          <span class="tag">01</span>
          <span>Die Problemstellung</span>
        </div>
        <p>Bestehende CO₂-Rechner im Internet sind für Schülerinnen und Schüler ungeeignet:</p>
        <ul>
          <li>• <strong>Überkomplex:</strong> Fragen nach Heizöl-Litern oder kWh, die Jugendliche nicht kennen.</li>
          <li>• <strong>Kein Unterrichtsbezug:</strong> Keine anonymen Klassenauswertungen für Lehrkräfte.</li>
          <li>• <strong>Datenschutz-Hürden:</strong> Häufige Erfassung von E-Mails und Passwörtern.</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="tag">02</span>
          <span>Wissenschaftliche Methodik</span>
        </div>
        <p>Entwickelt auf Basis anerkannter Umweltforschungsdaten:</p>
        <ul>
          <li>• <strong>Datenquellen:</strong> Umweltbundesamt (UBA), GEMIS 5.0 und PROBAS.</li>
          <li>• <strong>Modulares System:</strong> 4 Kernbereiche (Mobilität, Ernährung, Energie, Konsum).</li>
          <li>• <strong>Vergleichswerte:</strong> Bundesdurchschnitt (10,8 t) & Pariser Klimaziel (&lt; 2,0 t).</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="tag">03</span>
          <span>3 Didaktische Spielmodi</span>
        </div>
        <ul>
          <li>• <strong>Quick-Check (10 Fragen · 2 Min):</strong> Ideal für Vertretungsstunden & Messe-Mitmachaktionen.</li>
          <li>• <strong>Standard (30 Fragen · 10 Min):</strong> Der Klassen-Standard für Geographie, Biologie und WBS.</li>
          <li>• <strong>Detail-Check (60 Fragen · 25 Min):</strong> Für intensive Projekttage & Klima-AGs.</li>
        </ul>
      </div>
    </div>

    <!-- COL 2 -->
    <div class="col">
      <div class="hero-card">
        <div class="hero-badge">Live-Mitmachstation</div>
        <div class="hero-title">Smartphone zücken & testen!</div>
        <div class="hero-desc">Jetzt live im Innenministerium ausprobieren – Dauer ca. 2 Minuten:</div>

        <div class="qr-frame">
          <img src="${qrDataUrl}" alt="QR-Code zum Rechner">
        </div>

        <div class="direct-url">co2-rechner-umweltmentoren.vercel.app</div>

        <div style="margin-top: 4mm; font-size: 8.5pt; color: #52525b; line-height: 1.4;">
          <strong>1.</strong> Kamera öffnen & QR-Code scannen<br>
          <strong>2.</strong> Auf „Als Gast testen“ tippen (kein Login nötig!)<br>
          <strong>3.</strong> 10 Fragen beantworten & persönliche Urkunde erhalten
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="tag">04</span>
          <span>Vom Fußabdruck zum Handabdruck</span>
        </div>
        <p>Klimabildung darf nicht bei Schuldgefühlen enden:</p>
        <ul>
          <li>• <strong>Maßnahmen-Simulator:</strong> Schüler testen live: „Was spart ein Veggie-Tag oder der Schulweg mit dem Fahrrad?“</li>
          <li>• <strong>Klima-Versprechen:</strong> Ausgewählte Aktionen werden auf die persönliche Urkunde übernommen.</li>
        </ul>
      </div>
    </div>

    <!-- COL 3 -->
    <div class="col">
      <div class="card">
        <div class="card-title">
          <span class="tag">05</span>
          <span>Dashboard für Lehrkräfte</span>
        </div>
        <p>Volle Kontrolle und didaktische Begleitung im Unterricht:</p>
        <ul>
          <li>• <strong>Anonyme Schülercodes:</strong> Generierung auf Knopfdruck (z.B. <code>K9B-8921</code>).</li>
          <li>• <strong>Live-Auswertung:</strong> Klassen-Durchschnitt und Vergleich der 4 Sektoren am Beamer.</li>
          <li>• <strong>Didaktischer Leitfaden:</strong> Vorgefertigte 45-Minuten-Unterrichtsstunde als PDF.</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="tag">06</span>
          <span>100% DSGVO & Schulempfehlung</span>
        </div>
        <ul>
          <li>• <strong>Keine Registrierung:</strong> Schüler benötigen weder E-Mail noch Telefonnummer.</li>
          <li>• <strong>Clientseitige Urkunden:</strong> Namen werden ausschließlich lokal im Browser gedruckt – niemals auf dem Server gespeichert!</li>
          <li>• <strong>Kostenlos & Open Source:</strong> Dauerhaft werbefrei für alle Schulen in Baden-Württemberg.</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="tag">07</span>
          <span>Gamification & Urkunden</span>
        </div>
        <p>Motivation durch positive Verstärkung:</p>
        <ul>
          <li>• <strong>Schülerurkunden:</strong> Druckbare Zertifikate mit Baum-Entlastungszähler.</li>
          <li>• <strong>Klassen-Challenge:</strong> Schulweites Ranking der sparsamsten Klassen.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      Umweltmentoren-Programm Baden-Württemberg · Stiftung Entwicklungs-Zusammenarbeit (SEZ) & Kultusministerium
    </div>
    <div>
      Projekt-Entwickler: <strong>Jona Noack & Paul Kaiser</strong> · Version 2026.1
    </div>
  </div>
</body>
</html>`;

  // 2. XXL Mitmachplakat (DIN A3 Portrait: 297mm x 420mm)
  const mitmachHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>XXL Mitmachplakat - CO2-Rechner für Schulen</title>
  <style>
    @page {
      size: 297mm 420mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 297mm;
      height: 420mm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #09090b;
      padding: 16mm 18mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-badge {
      font-family: "Courier New", Courier, monospace;
      font-size: 9pt;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #71717a;
      border-bottom: 0.5mm solid #e4e4e7;
      padding-bottom: 3mm;
      width: 100%;
    }
    h1 {
      font-size: 28pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      line-height: 1.15;
      margin-top: 4mm;
      color: #09090b;
    }
    .subtitle {
      font-size: 13pt;
      color: #52525b;
      margin-top: 3mm;
      max-width: 230mm;
      line-height: 1.35;
    }

    .qr-container {
      border: 2mm solid #09090b;
      border-radius: 6mm;
      padding: 6mm;
      background: #ffffff;
      box-shadow: 0 6mm 15mm rgba(0,0,0,0.08);
      margin: 4mm 0;
    }
    .qr-container img {
      width: 110mm;
      height: 110mm;
      display: block;
    }

    .url-pill {
      font-family: "Courier New", Courier, monospace;
      font-size: 12pt;
      font-weight: 800;
      color: #09090b;
      background: #f4f4f5;
      padding: 2.5mm 6mm;
      border-radius: 3mm;
      border: 0.5mm solid #09090b;
      display: inline-block;
      margin-top: 2mm;
    }

    .steps-box {
      width: 100%;
      background: #fafafa;
      border: 0.8mm solid #e4e4e7;
      border-radius: 4mm;
      padding: 5mm 8mm;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5mm;
      text-align: left;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
    }
    .step-num {
      font-family: "Courier New", Courier, monospace;
      font-size: 11pt;
      font-weight: bold;
      color: #09090b;
      background: #e4e4e7;
      width: 7mm;
      height: 7mm;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2mm;
    }
    .step-title {
      font-size: 11pt;
      font-weight: 700;
      color: #09090b;
    }
    .step-desc {
      font-size: 9pt;
      color: #71717a;
      line-height: 1.3;
    }

    .footer {
      border-top: 0.5mm solid #e4e4e7;
      padding-top: 3mm;
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-family: "Courier New", Courier, monospace;
      font-size: 8.5pt;
      color: #71717a;
    }
  </style>
</head>
<body>
  <div class="header-badge">
    Umweltmentoren Baden-Württemberg · Innenministerium Stuttgart · 25.09.2026
  </div>

  <div>
    <h1>📱 Smartphone zücken & testen!</h1>
    <div class="subtitle">Wie groß ist dein persönlicher CO₂-Fußabdruck? In nur 2 Minuten live herausfinden:</div>
  </div>

  <div class="qr-container">
    <img src="${qrDataUrl}" alt="QR-Code zum Rechner">
  </div>

  <div>
    <div class="url-pill">co2-rechner-umweltmentoren.vercel.app</div>
  </div>

  <div class="steps-box">
    <div class="step-item">
      <div class="step-num">1</div>
      <div class="step-title">Kamera öffnen</div>
      <div class="step-desc">QR-Code scannen oder Webadresse direkt im Browser eingeben.</div>
    </div>
    <div class="step-item">
      <div class="step-num">2</div>
      <div class="step-title">Als Gast testen</div>
      <div class="step-desc">Kein Passwort, keine E-Mail, keine Installation notwendig.</div>
    </div>
    <div class="step-item">
      <div class="step-num">3</div>
      <div class="step-title">Urkunde erhalten</div>
      <div class="step-desc">10 Fragen beantworten, Einsparpotenzial prüfen & Urkunde ansehen.</div>
    </div>
  </div>

  <div class="footer">
    <div>Entwickelt von den Umweltmentoren Jona Noack & Paul Kaiser</div>
    <div>100% Anonym · DSGVO-Konform · Wissenschaftlich fundiert</div>
  </div>
</body>
</html>`;

  // 3. Stellwand-Kopfblende / Header-Banner (1200mm x 250mm Banner)
  const bannerHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Stellwand-Banner 120cm - CO2-Rechner für Schulen</title>
  <style>
    @page {
      size: 1200mm 250mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200mm;
      height: 250mm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #09090b;
      color: #ffffff;
      padding: 20mm 35mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .left-side {
      display: flex;
      flex-direction: column;
      gap: 3mm;
    }
    .tagline {
      font-family: "Courier New", Courier, monospace;
      font-size: 16pt;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #a1a1aa;
    }
    h1 {
      font-size: 58pt;
      font-weight: 900;
      letter-spacing: -1px;
      line-height: 1;
      color: #ffffff;
    }
    .subtitle {
      font-size: 22pt;
      color: #d4d4d8;
      margin-top: 2mm;
    }
    .right-side {
      display: flex;
      align-items: center;
      gap: 15mm;
      border-left: 2mm solid #27272a;
      padding-left: 15mm;
    }
    .qr-box {
      background: #ffffff;
      padding: 4mm;
      border-radius: 4mm;
    }
    .qr-box img {
      width: 45mm;
      height: 45mm;
      display: block;
    }
    .info-box {
      font-family: "Courier New", Courier, monospace;
      font-size: 13pt;
      color: #a1a1aa;
      line-height: 1.6;
    }
    .info-box strong {
      color: #ffffff;
      font-size: 16pt;
    }
  </style>
</head>
<body>
  <div class="left-side">
    <div class="tagline">Umweltmentoren Baden-Württemberg · Abschluss 2026</div>
    <h1>CO₂-RECHNER FÜR SCHULEN</h1>
    <div class="subtitle">Interaktives Tool für klimaneutrale Schulen & fundierte Bildung für nachhaltige Entwicklung</div>
  </div>

  <div class="right-side">
    <div class="qr-box">
      <img src="${qrDataUrl}" alt="QR-Code">
    </div>
    <div class="info-box">
      <strong>Projekte-Markt</strong><br>
      Innenministerium Stuttgart<br>
      Jona Noack & Paul Kaiser
    </div>
  </div>
</body>
</html>`;

  // 4. Lehrkräfte-Handout (DIN A4 Portrait: 210mm x 297mm)
  const handoutHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Lehrkräfte-Handout - CO2-Rechner für Schulen</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #09090b;
      line-height: 1.45;
      font-size: 10pt;
    }
    .header {
      border-bottom: 1.5pt solid #09090b;
      padding-bottom: 4mm;
      margin-bottom: 5mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .super-title {
      font-family: "Courier New", Courier, monospace;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #71717a;
      margin-bottom: 1mm;
    }
    h1 {
      font-size: 18pt;
      font-weight: 800;
      line-height: 1.15;
    }
    .author {
      text-align: right;
      font-family: "Courier New", Courier, monospace;
      font-size: 8pt;
      color: #71717a;
    }
    .box {
      border: 1pt solid #e4e4e7;
      background: #fafafa;
      border-radius: 3mm;
      padding: 3.5mm 4.5mm;
      margin-bottom: 4mm;
    }
    h2 {
      font-size: 11pt;
      font-weight: 700;
      margin-bottom: 2mm;
      border-bottom: 0.5pt solid #e4e4e7;
      padding-bottom: 1mm;
      display: flex;
      justify-content: space-between;
    }
    p {
      margin-bottom: 2mm;
      color: #3f3f46;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2mm;
      font-size: 9pt;
    }
    th, td {
      border: 0.5pt solid #d4d4d8;
      padding: 2mm 3mm;
      text-align: left;
    }
    th {
      background: #f4f4f5;
      font-weight: 600;
    }
    .qr-mini-card {
      float: right;
      border: 1pt solid #09090b;
      border-radius: 2mm;
      padding: 2mm;
      text-align: center;
      margin-left: 4mm;
      background: #ffffff;
      width: 40mm;
    }
    .qr-mini-card img {
      width: 32mm;
      height: 32mm;
      display: block;
      margin: 0 auto;
    }
    .qr-mini-card span {
      font-family: "Courier New", Courier, monospace;
      font-size: 6.5pt;
      display: block;
      margin-top: 1mm;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="super-title">Handout für betreuende Lehrkräfte · BNE im Fachunterricht</div>
      <h1>Unterrichtsbaustein: CO₂-Fußabdruck</h1>
    </div>
    <div class="author">
      Umweltmentoren 2026<br>
      Jona Noack & Paul Kaiser
    </div>
  </div>

  <div class="qr-mini-card">
    <img src="${qrDataUrl}" alt="QR">
    <span>co2-rechner-umweltmentoren.vercel.app</span>
  </div>

  <div class="box">
    <h2>1. Steckbrief des Bildungstools</h2>
    <p><strong>Zielgruppe:</strong> Klassenstufen 5–13 (alle Schularten).<br>
    <strong>Fächer:</strong> Geographie, Biologie, BNT, Gemeinschaftskunde, WBS, Ethik & Projektwochen.<br>
    <strong>Zugang:</strong> Plattformunabhängig im Webbrowser (Smartphones, Tablets, Schul-Laptops). Keine App-Installation, kein Schülerpasswort, 100% DSGVO-konform.</p>
  </div>

  <div class="box">
    <h2>2. Verlaufsplan einer 45-Minuten-Unterrichtsstunde</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 18%;">Phase</th>
          <th style="width: 47%;">Inhalt & Schüleraktivität</th>
          <th style="width: 35%;">Didaktische Funktion</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>00–10 Min</strong><br>Einstieg</td>
          <td>Lehrkraft wirft Frage an: „Wie viele Tonnen CO₂ stoßen wir im Jahr aus?“ Schüler schätzen ihren Wert.</td>
          <td>Aktivierung von Vorwissen, Motivation & Hypothesenbildung.</td>
        </tr>
        <tr>
          <td><strong>10–25 Min</strong><br>Erfassung</td>
          <td>Schüler öffnen Rechner (per QR-Code oder Zugangscode) und beantworten die Fragen zu Mobilität, Ernährung, Energie & Konsum.</td>
          <td>Selbstständige Reflexion des Alltags & persönliche Datenerhebung.</td>
        </tr>
        <tr>
          <td><strong>25–35 Min</strong><br>Klassenanalyse</td>
          <td>Lehrkraft projiziert das anonyme Schulportal-Dashboard an den Beamer: Durchschnittswert der Klasse & Anteile.</td>
          <td>Kollektive Erkenntnis: Wo liegen unsere gemeinsamen Hebel?</td>
        </tr>
        <tr>
          <td><strong>35–45 Min</strong><br>Handabdruck</td>
          <td>Schüler wählen im Simulator 1–2 konkrete Versprechen für den Alltag. Ausdruck der Zertifikate.</td>
          <td>Vom Problem zur Lösung: Selbstwirksamkeit & Handlungsmotivation.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="box">
    <h2>3. Drei didaktische Erfassungsmodi</h2>
    <p>• <strong>10 Fragen (Quick-Check, ca. 2 Min):</strong> Blitz-Bilanzierung für Vertretungsstunden oder kurzen Einstieg.<br>
    • <strong>30 Fragen (Standard, ca. 10 Min):</strong> Ausführlicher Fachunterricht mit differenzierten Schulweg- & Konsumfragen.<br>
    • <strong>60 Fragen (Detail, ca. 25 Min):</strong> Fundierte Erhebung für Projekttage und Umwelt-AGs.</p>
  </div>

  <div class="box">
    <h2>4. Kurzanleitung für Lehrkräfte im Schulportal</h2>
    <p>1. Im Menü auf <strong>Schulportal</strong> klicken (Lizenzschlüssel erhalten Sie bei den Umweltmentoren).<br>
    2. Klasse anlegen (z.B. „Klasse 8b“) & anonyme Schüler-Karten ausdrucken.<br>
    3. Nach der Stunde: Aggregierte Klassenergebnisse als PDF oder Excel-Tabelle für die Schulstatistik exportieren.</p>
  </div>

  <div style="font-family: 'Courier New', Courier, monospace; font-size: 7.5pt; color: #71717a; text-align: center; margin-top: 3mm;">
    Kontakt & Lizenzen für Schulen: Umweltmentoren Jona Noack & Paul Kaiser · Abschlussveranstaltung Innenministerium Stuttgart 2026
  </div>
</body>
</html>`;

  // 5. Offizielle Klimaschutz-Urkunde (DIN A4 Portrait: 210mm x 297mm)
  const certificateHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Klimaschutz-Urkunde - Umweltmentoren</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: "Georgia", "Times New Roman", serif;
      background: #ffffff;
      color: #1c1917;
      text-align: center;
      padding: 10mm;
      border: 3pt double #1c1917;
      height: calc(297mm - 24mm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .super-title {
      font-family: "Courier New", Courier, monospace;
      font-size: 9pt;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #57534e;
    }
    h1 {
      font-size: 26pt;
      font-weight: 700;
      letter-spacing: 2px;
      margin-top: 2mm;
      color: #1c1917;
    }
    .divider {
      width: 25mm;
      height: 1.5pt;
      background: #1c1917;
      margin: 3mm auto;
    }
    .cert-intro {
      font-style: italic;
      font-size: 11pt;
      color: #44403c;
      margin-top: 2mm;
    }
    .name-line {
      border-bottom: 1.5pt solid #78716c;
      width: 120mm;
      margin: 5mm auto 2mm auto;
      padding-bottom: 1mm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 18pt;
      font-weight: bold;
      color: #1c1917;
    }
    .school-line {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11pt;
      color: #57534e;
      margin-bottom: 5mm;
    }
    .body-text {
      font-size: 11pt;
      line-height: 1.6;
      max-width: 140mm;
      margin: 0 auto 5mm auto;
      color: #292524;
    }
    .pledge-box {
      border: 1pt solid #78716c;
      background: #fafaf9;
      border-radius: 2mm;
      padding: 4mm 6mm;
      max-width: 140mm;
      margin: 0 auto 5mm auto;
      text-align: left;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9.5pt;
    }
    .pledge-title {
      font-family: "Courier New", Courier, monospace;
      font-size: 8pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1c1917;
      margin-bottom: 2mm;
    }
    .pledge-list {
      list-style-type: square;
      padding-left: 5mm;
      color: #292524;
      line-height: 1.5;
    }
    .badge-stamp {
      display: inline-block;
      border: 1.5pt solid #1c1917;
      padding: 1.5mm 5mm;
      font-family: "Courier New", Courier, monospace;
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4mm;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      width: 140mm;
      margin: 0 auto;
      font-family: "Courier New", Courier, monospace;
      font-size: 8.5pt;
      color: #57534e;
    }
    .sig-col {
      border-top: 1pt solid #78716c;
      width: 55mm;
      padding-top: 1.5mm;
      text-align: center;
    }
    .footer-note {
      font-family: "Courier New", Courier, monospace;
      font-size: 7pt;
      color: #78716c;
      margin-top: 3mm;
    }
  </style>
</head>
<body>
  <div>
    <div class="super-title">Umweltmentoren Baden-Württemberg</div>
    <h1>KLIMASCHUTZ-URKUNDE</h1>
    <div class="divider"></div>
    <div class="cert-intro">Hiermit wird offiziell bescheinigt, dass</div>

    <div class="name-line">Vor- und Nachname</div>
    <div class="school-line">Schule / Klasse</div>

    <div class="body-text">
      den persönlichen CO₂-Fußabdruck in den Bereichen Mobilität, Ernährung, Energie und Konsum wissenschaftlich fundiert analysiert hat.
    </div>

    <div class="badge-stamp">★ Auszeichnung: Klima-Pionier 2026 ★</div>

    <div class="pledge-box">
      <div class="pledge-title">Persönliches Klima-Versprechen:</div>
      <ul class="pledge-list">
        <li>Schulweg bevorzugt zu Fuß, mit dem Fahrrad oder ÖPNV zurücklegen</li>
        <li>Bewusster Konsum & mindestens 2 vegetarische Tage pro Woche</li>
        <li>Aktives Engagement für Klimaschutzprojekte an der Schule</li>
      </ul>
      <div style="margin-top: 2.5mm; font-weight: bold; border-top: 0.5pt solid #d6d3d1; padding-top: 1.5mm; font-size: 9pt;">
        Prognostizierte Entlastung: ca. 680 kg CO₂ pro Jahr (~54 Bäume).
      </div>
    </div>
  </div>

  <div>
    <div class="signatures">
      <div class="sig-col">
        Stuttgart, 25.09.2026<br>
        <strong>Datum</strong>
      </div>
      <div class="sig-col">
        <br>
        <strong>Unterschrift Lehrkraft / Mentor:in</strong>
      </div>
    </div>

    <div class="footer-note">
      Offizielles Zertifikat zur Umweltmentoren-Ausbildung 2025/2026 · Ministerium für Kultus, Jugend und Sport Baden-Württemberg
    </div>
  </div>
</body>
</html>`;

  // Write temporary HTML files
  const files = [
    { name: '01_Ausstellungsplakat_Wissenschaftlich_DIN_A2', html: posterHtml, pdf: '01_Ausstellungsplakat_Wissenschaftlich_DIN_A2.pdf' },
    { name: '02_XXL_Mitmachplakat_QR_Code_DIN_A3', html: mitmachHtml, pdf: '02_XXL_Mitmachplakat_QR_Code_DIN_A3.pdf' },
    { name: '03_Stellwand_Kopfblende_Banner_120x25cm', html: bannerHtml, pdf: '03_Stellwand_Kopfblende_Banner_120x25cm.pdf' },
    { name: '04_Lehrkraefte_Handout_Unterrichtsverlauf_DIN_A4', html: handoutHtml, pdf: '04_Lehrkraefte_Handout_Unterrichtsverlauf_DIN_A4.pdf' },
    { name: '05_Klimaschutz_Urkunde_DIN_A4', html: certificateHtml, pdf: '05_Klimaschutz_Urkunde_DIN_A4.pdf' },
  ];

  for (const item of files) {
    const htmlPath = path.join(TEMP_DIR, `${item.name}.html`);
    fs.writeFileSync(htmlPath, item.html, 'utf8');

    const destPdfPath = path.join(PDF_DIR, item.pdf);
    const publicPdfPath = path.join(PUBLIC_DIR, item.pdf);

    console.log(`Rendering ${item.pdf}...`);
    const chromeCmd = `powershell -Command "Start-Process -FilePath '${CHROME_PATH}' -ArgumentList '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=\\\"${destPdfPath}\\\"', 'file:///${htmlPath.replace(/\\\\/g, '/')}' -Wait"`;
    execSync(chromeCmd, { stdio: 'inherit' });

    // Copy to public directory so it's accessible via web
    fs.copyFileSync(destPdfPath, publicPdfPath);
    console.log(`Saved: ${destPdfPath} (${fs.statSync(destPdfPath).size} bytes)`);
  }

  console.log('ALL PDFS SUCCESSFULLY GENERATED!');
}

main().catch(err => {
  console.error('Error generating PDFs:', err);
  process.exit(1);
});
