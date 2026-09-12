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
    width: 1400,
    margin: 1,
    color: { dark: '#09090b', light: '#ffffff' },
    errorCorrectionLevel: 'H'
  });

  console.log('Creating minimal poster HTML...');

  const posterHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>CO2-Rechner für Schulen - Ausstellungsplakat</title>
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      color: #09090b;
      padding: 24mm 28mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Minimalist Header */
    .header {
      border-bottom: 2mm solid #09090b;
      padding-bottom: 8mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .tagline {
      font-family: "Courier New", Courier, monospace;
      font-size: 10pt;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #71717a;
      margin-bottom: 3mm;
    }
    h1 {
      font-size: 40pt;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.05;
      color: #09090b;
    }
    .subtitle {
      font-size: 15pt;
      color: #52525b;
      margin-top: 2.5mm;
      font-weight: 400;
    }
    .header-meta {
      text-align: right;
      font-family: "Courier New", Courier, monospace;
      font-size: 10pt;
      color: #71717a;
      line-height: 1.5;
    }
    .header-meta strong {
      color: #09090b;
    }

    /* Main Grid: 2 Clean Balanced Columns */
    .main-content {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 22mm;
      margin: 10mm 0;
      flex: 1;
      align-items: center;
    }

    /* Left Column: 3 Clear Focus Points */
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 8mm;
    }
    .feature-item {
      display: flex;
      gap: 6mm;
      align-items: flex-start;
    }
    .feature-num {
      font-family: "Courier New", Courier, monospace;
      font-size: 14pt;
      font-weight: 700;
      color: #09090b;
      background: #f4f4f5;
      border: 0.5mm solid #09090b;
      width: 12mm;
      height: 12mm;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2.5mm;
      shrink-0;
    }
    .feature-content h2 {
      font-size: 16pt;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 1.5mm;
      letter-spacing: -0.3px;
    }
    .feature-content p {
      font-size: 11.5pt;
      line-height: 1.45;
      color: #52525b;
    }

    /* Right Column: Prominent, Clean Mitmachstation */
    .qr-card {
      border: 1.5mm solid #09090b;
      border-radius: 6mm;
      padding: 10mm 12mm;
      text-align: center;
      background: #ffffff;
      box-shadow: 0 4mm 16mm rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4mm;
    }
    .qr-badge {
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      background: #09090b;
      color: #ffffff;
      padding: 1.5mm 4mm;
      border-radius: 2mm;
    }
    .qr-title {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #09090b;
    }
    .qr-desc {
      font-size: 11pt;
      color: #52525b;
      line-height: 1.35;
      max-width: 90%;
    }
    .qr-image-wrapper {
      padding: 2mm;
      border: 0.8mm solid #e4e4e7;
      border-radius: 4mm;
      background: #ffffff;
    }
    .qr-image-wrapper img {
      width: 68mm;
      height: 68mm;
      display: block;
    }
    .qr-url {
      font-family: "Courier New", Courier, monospace;
      font-size: 10pt;
      font-weight: 700;
      color: #09090b;
      background: #f4f4f5;
      padding: 2mm 5mm;
      border-radius: 2mm;
      border: 0.4mm solid #d4d4d8;
    }
    .qr-steps {
      display: flex;
      justify-content: space-between;
      width: 100%;
      border-top: 0.5mm solid #e4e4e7;
      padding-top: 3.5mm;
      margin-top: 1mm;
      font-size: 9.5pt;
      color: #71717a;
    }
    .qr-steps span {
      font-weight: 600;
      color: #09090b;
    }

    /* Minimalist Footer */
    .footer {
      border-top: 0.8mm solid #e4e4e7;
      padding-top: 5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5pt;
      color: #71717a;
    }
    .footer strong {
      color: #09090b;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div>
      <div class="tagline">Land Baden-Württemberg · Umweltmentoren 2025/2026</div>
      <h1>CO₂-Rechner für Schulen</h1>
      <div class="subtitle">Wissenschaftlich fundierte Klimabilanzierung & Handlungsprojekte im Unterricht.</div>
    </div>
    <div class="header-meta">
      Innenministerium Stuttgart · 25.09.2026<br>
      Entwickelt von <strong>Jona Noack & Paul Kaiser</strong>
    </div>
  </header>

  <!-- Main 2-Column Grid -->
  <main class="main-content">
    <!-- Left: 3 Core Highlights -->
    <div class="features-list">
      <div class="feature-item">
        <div class="feature-num">01</div>
        <div class="feature-content">
          <h2>Jugendgerecht & Wissenschaftlich</h2>
          <p>
            Verständliche Alltagsfragen in 4 Sektoren (Mobilität, Ernährung, Energie, Konsum) statt komplizierter Kilowattstunden. Berechnungen basieren auf validen Daten des Umweltbundesamts (UBA) und GEMIS.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-num">02</div>
        <div class="feature-content">
          <h2>100% Datenschutz & Flexibel</h2>
          <p>
            Vollständig DSGVO-konform für Schulen. Keine Registrierung, keine Passwörter, keine Speicherung von Schülernamen auf Servern. 3 modulare Modi: 10 Fragen (Quick-Check), 30 Fragen (Standard) oder 60 Fragen (Detail).
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-num">03</div>
        <div class="feature-content">
          <h2>Vom Fußabdruck zum Handabdruck</h2>
          <p>
            Lehrkräfte-Dashboard mit Live-Klassenauswertung für den Beamer. Der integrierte Simulator ermöglicht persönliche Klimaschutz-Versprechen mit direktem Ausdruck personalisierter Schüler-Urkunden.
          </p>
        </div>
      </div>
    </div>

    <!-- Right: Big Scannable Mitmachstation -->
    <div class="qr-card">
      <div class="qr-badge">Live ausprobieren</div>
      <div class="qr-title">Smartphone zücken & testen</div>
      <div class="qr-desc">Ermittle deinen persönlichen CO₂-Fußabdruck jetzt in nur 2 Minuten live:</div>

      <div class="qr-image-wrapper">
        <img src="${qrDataUrl}" alt="QR-Code zum CO2-Rechner">
      </div>

      <div class="qr-url">co2-rechner-umweltmentoren.vercel.app</div>

      <div class="qr-steps">
        <div><span>1.</span> Scannen</div>
        <div>·</div>
        <div><span>2.</span> Als Gast starten</div>
        <div>·</div>
        <div><span>3.</span> Urkunde erhalten</div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div>Kostenloses Bildungstool für Schulen in Baden-Württemberg</div>
    <div>Projektteam: <strong>Jona Noack & Paul Kaiser</strong> · Umweltmentoren</div>
  </footer>
</body>
</html>`;

  const htmlPath = path.join(TEMP_DIR, '01_Ausstellungsplakat_DIN_A2.html');
  fs.writeFileSync(htmlPath, posterHtml, 'utf8');

  const destPdfPath = path.join(PDF_DIR, '01_Ausstellungsplakat_DIN_A2.pdf');
  const publicPdfPath = path.join(PUBLIC_DIR, '01_Ausstellungsplakat_DIN_A2.pdf');

  console.log('Rendering 01_Ausstellungsplakat_DIN_A2.pdf with Chrome...');
  const chromeCmd = `powershell -Command "Start-Process -FilePath '${CHROME_PATH}' -ArgumentList '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=\\\"${destPdfPath}\\\"', 'file:///${htmlPath.replace(/\\\\/g, '/')}' -Wait"`;
  execSync(chromeCmd, { stdio: 'inherit' });

  fs.copyFileSync(destPdfPath, publicPdfPath);
  console.log(`Saved: ${destPdfPath} (${fs.statSync(destPdfPath).size} bytes)`);
  console.log('SINGLE POSTER PDF GENERATED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Error generating single poster PDF:', err);
  process.exit(1);
});
