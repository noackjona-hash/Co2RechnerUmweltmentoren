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

// -----------------------------------------------------------------------------
// 1. HOCHWERTIGE DIN A6 BÜHNEN-MODERATIONSKARTEN (2 KARTEN PRO DIN A4 SEITE)
// -----------------------------------------------------------------------------
const cueCardsHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Moderationskarten - Jona Noack & Paul Kaiser</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #09090b;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 190mm;
      height: 281mm;
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
      border-top: 1.5px dashed #a1a1aa;
      z-index: 10;
    }
    .cut-label {
      position: absolute;
      top: calc(50% - 3mm);
      right: 4mm;
      font-family: monospace;
      font-size: 7.5pt;
      font-weight: 700;
      color: #71717a;
      background: #ffffff;
      padding: 0 3mm;
      z-index: 11;
    }
    .card {
      width: 190mm;
      height: 136mm;
      border: 2px solid #09090b;
      border-radius: 4mm;
      padding: 6.5mm 8mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
      box-shadow: 0 1mm 3mm rgba(0,0,0,0.05);
    }
    
    /* Header */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #09090b;
      padding-bottom: 2.5mm;
      margin-bottom: 3mm;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 2.5mm;
    }
    .card-badge {
      font-family: monospace;
      font-size: 8.5pt;
      font-weight: 900;
      background: #09090b;
      color: #ffffff;
      padding: 1.2mm 2.8mm;
      border-radius: 1.5mm;
      letter-spacing: 0.5px;
    }
    .slide-badge {
      font-family: monospace;
      font-size: 8pt;
      font-weight: 800;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 1.2mm 2.5mm;
      border-radius: 1.5mm;
    }
    .card-title {
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: -0.4px;
      color: #09090b;
    }
    .card-time {
      font-family: monospace;
      font-size: 9pt;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 1mm 2.5mm;
      border-radius: 1.5mm;
    }

    /* Card Content */
    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2.5mm;
      font-size: 9pt;
      line-height: 1.38;
    }
    
    .section-block {
      border-left: 3.5px solid #d4d4d8;
      padding-left: 2.5mm;
      display: flex;
      flex-direction: column;
      gap: 1mm;
    }
    .block-paul {
      border-left-color: #2563eb;
      background: #eff6ff;
      padding: 1.8mm 2.5mm;
      border-radius: 0 2mm 2mm 0;
    }
    .block-jona {
      border-left-color: #16a34a;
      background: #f0fdf4;
      padding: 1.8mm 2.5mm;
      border-radius: 0 2mm 2mm 0;
    }
    .block-beamer {
      border-left-color: #d97706;
      background: #fffbeb;
      padding: 1.5mm 2.5mm;
      border-radius: 0 2mm 2mm 0;
      font-size: 8.5pt;
    }

    .speaker-tag {
      font-family: monospace;
      font-weight: 900;
      font-size: 8pt;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 1.5mm;
    }
    .tag-paul { color: #1d4ed8; }
    .tag-jona { color: #15803d; }
    .tag-beamer { color: #b45309; }

    .first-sentence {
      font-size: 9.5pt;
      font-weight: 700;
      color: #09090b;
      line-height: 1.35;
    }

    .bullet-list {
      list-style: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 0.8mm;
    }
    .bullet-list li {
      position: relative;
      padding-left: 3.5mm;
      color: #27272a;
    }
    .bullet-list li::before {
      content: "▪";
      position: absolute;
      left: 0;
      color: #71717a;
      font-size: 8pt;
    }
    .bullet-list strong {
      color: #09090b;
    }

    .regie-box {
      background: #fafaf9;
      border: 1px dashed #d6d3d1;
      padding: 1.5mm 2.5mm;
      border-radius: 1.5mm;
      font-size: 8pt;
      font-style: italic;
      color: #57534e;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }

    /* Footer */
    .card-footer {
      border-top: 1.5px solid #e4e4e7;
      padding-top: 2mm;
      margin-top: 1.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: monospace;
      font-size: 8pt;
    }
    .handover-signal {
      font-weight: 700;
      color: #09090b;
    }
    .key-trigger {
      background: #f4f4f5;
      border: 1px solid #d4d4d8;
      padding: 0.8mm 2mm;
      border-radius: 1mm;
      font-weight: 700;
      color: #18181b;
    }
  </style>
</head>
<body>

  <!-- =========================================================================
       SEITE 1: KARTEN 1 & 2
  ========================================================================= -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER DURCHSCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 1 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">KARTE 1</span>
          <span class="slide-badge">FOLIE 1: TITEL</span>
          <span class="card-title">Begrüßung & Einstieg</span>
        </div>
        <span class="card-time">⏱️ 00:00 – 02:00</span>
      </div>

      <div class="card-body">
        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">🎤 PAUL (Start & Begrüßung)</div>
          <div class="first-sentence">
            „Sehr geehrter Herr Staatssekretär Deuschle, liebe Vertreterinnen und Vertreter des Ministeriums und der Jugendstiftung, liebe Mentorinnen, Mentoren und Lehrkräfte!“
          </div>
          <ul class="bullet-list">
            <li>Große Freude im Innenministerium · Vorstellung: <strong>Mein Name ist Paul Kaiser...</strong></li>
          </ul>
        </div>

        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">🎤 JONA (Vorstellung & Ziel)</div>
          <div class="first-sentence">
            „... und mein Name ist Jona Noack. Wir beide sind Umweltmentoren des Kurses 2025/2026.“
          </div>
          <ul class="bullet-list">
            <li><strong>Unser Anspruch vor 1 Jahr:</strong> Kein Projekt, das in der Schublade verstaubt!</li>
            <li><strong>Die Vision:</strong> Ein modernes Werkzeug für <strong>ganz Baden-Württemberg</strong> im regulären Unterricht.</li>
          </ul>
        </div>

        <div class="regie-box">
          👁️ <strong>Regie:</strong> Fester Blickkontakt zu Deuschle & Plenum · Aufrechtes Stehen · Ruhiges, souveränes Tempo.
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">👉 Jona leitet über zu den Problemen bisheriger Rechner.</span>
        <span class="key-trigger">⌨️ Taste: LEERTASTE ➔ Folie 2</span>
      </div>
    </div>

    <!-- KARTE 2 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">KARTE 2</span>
          <span class="slide-badge">FOLIE 2: PROBLEME</span>
          <span class="card-title">Das Dilemma im Unterricht</span>
        </div>
        <span class="card-time">⏱️ 02:00 – 04:30</span>
      </div>

      <div class="card-body">
        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">🎤 JONA (Warum scheitern bisherige Rechner?)</div>
          <div class="first-sentence">
            „Lehrkraft sagt: ‚Heute berechnen wir unseren Fußabdruck!‘ – nach 3 Minuten bricht das Chaos aus.“
          </div>
          <ul class="bullet-list">
            <li>❌ <strong>Für Erwachsene gebaut:</strong> Wer mit 14 kennt Heizöl-Liter oder kWh der Eltern?</li>
            <li>❌ <strong>Datenschutz-Dilemma:</strong> Account-Zwang, E-Mails, Tracking – No-Go an Schulen in BW!</li>
            <li>❌ <strong>Isolierte Einzelwerte:</strong> Schüler sitzt vor „8,4 t“ – keine Klassenauswertung für Lehrer.</li>
          </ul>
        </div>

        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">🎤 PAUL (Unsere Lösung & Überleitung zum Live-Test)</div>
          <div class="first-sentence">
            „Deshalb haben wir gesagt: Das muss doch besser gehen!“
          </div>
          <ul class="bullet-list">
            <li><strong>Unsere Kriterien:</strong> Alltagsnah, 100% DSGVO-anonym, passend für 45-Minuten-Stunde.</li>
            <li><strong>Signal für den Saal:</strong> <em>„Wir zeigen keine Tabellen – wir probieren das jetzt alle live aus!“</em></li>
          </ul>
        </div>

        <div class="regie-box">
          🎭 <strong>Regie:</strong> Bei „Heizöl“ schmunzeln (alle Lehrkräfte nicken) · Paul übernimmt mit viel Schwung!
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">👉 Paul kündigt die Mitmachrunde an.</span>
        <span class="key-trigger">⌨️ Taste: LEERTASTE ➔ Folie 3 (QR-Code)</span>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       SEITE 2: KARTEN 3 & 4
  ========================================================================= -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER DURCHSCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 3 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">KARTE 3</span>
          <span class="slide-badge">FOLIE 3: QR-CODE</span>
          <span class="card-title">Live-Mitmachrunde im Saal 🔥</span>
        </div>
        <span class="card-time">⏱️ 04:30 – 08:30</span>
      </div>

      <div class="card-body">
        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">🎤 PAUL (Saal auffordern)</div>
          <div class="first-sentence">
            „Bitte nehmen Sie jetzt alle Ihr Smartphone zur Hand und öffnen Sie die Kamera!“
          </div>
          <ul class="bullet-list">
            <li>Großen QR-Code scannen · <strong>Kein App-Download, keine Registrierung!</strong></li>
            <li>Einfach auf <strong>‚Als Gast testen‘</strong> tippen.</li>
          </ul>
        </div>

        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">🎤 JONA (Begleitung während getippt wird)</div>
          <ul class="bullet-list">
            <li><strong>10-Fragen-Quick-Check:</strong> Anreise heute, Fleisch, Streaming, Konsum.</li>
            <li>In unter 2 Minuten: Persönliches Jahresergebnis in kg CO₂ + Urkunde!</li>
          </ul>
        </div>

        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">🎤 PAUL (Handzeichen-Abfrage nach ca. 90 Sek.)</div>
          <div class="first-sentence">
            „Wer von Ihnen hat sein Ergebnis schon auf dem Display? Einmal kurz Hand heben!“
          </div>
          <ul class="bullet-list">
            <li>Reagieren: <em>„Super, fast der ganze Saal!“</em> · Wert zeigt auch <strong>Bäume & Auto-km</strong>.</li>
          </ul>
        </div>

        <div class="regie-box">
          📱 <strong>Regie:</strong> Eigenes Handy hochhalten · 60–90 Sek. Ruhe aushalten während alle tippen · Lächeln!
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">👉 Paul leitet zur didaktischen Fundierung über.</span>
        <span class="key-trigger">⌨️ Taste: LEERTASTE ➔ Folie 4</span>
      </div>
    </div>

    <!-- KARTE 4 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">KARTE 4</span>
          <span class="slide-badge">FOLIE 4: DIDAKTIK</span>
          <span class="card-title">Wissenschaft, UBA-Pauschale & Modi</span>
        </div>
        <span class="card-time">⏱️ 08:30 – 11:00</span>
      </div>

      <div class="card-body">
        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">🎤 PAUL (UBA-Basis & Die 4,4-Tonnen-Pauschale ⭐)</div>
          <div class="first-sentence">
            „Was Sie gerade erlebt haben, basiert auf einem durchdachten wissenschaftlichen Fundament.“
          </div>
          <ul class="bullet-list">
            <li>Faktoren aus <strong>Umweltbundesamt (UBA)</strong> & GEMIS-Datenbank.</li>
            <li>⭐ <strong>Besonderheit: Die 4,4 t UBA-Grundpauschale:</strong> 1.200 kg für staatliche Infrastruktur (Straßen, Schulen, Krankenhäuser) + Sockelbedarfe Wohnen/Konsum. Kein Schüler landet bei absurden 1,7 Tonnen!</li>
          </ul>
        </div>

        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">🎤 JONA (Die 3 flexiblen Unterrichtsmodi)</div>
          <ul class="bullet-list">
            <li>• <strong>10 Fragen (Quick-Check, 2 Min):</strong> Knackiger Stundeneinstieg (wie eben).</li>
            <li>• <strong>30 Fragen (Standard, 8–10 Min):</strong> Klassiker für reguläre Fachstunde Geo/Bio.</li>
            <li>• <strong>60 Fragen (Detail, 25 Min):</strong> Projekttage, Umwelt-AGs und Schulaudits.</li>
          </ul>
        </div>

        <div class="regie-box">
          💡 <strong>Regie:</strong> Betonen: 1.200 kg Infrastruktur zeigt: Klimaschutz ist auch staatliche Aufgabe!
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">👉 Jona stellt das Dashboard & Datenschutz vor.</span>
        <span class="key-trigger">⌨️ Taste: LEERTASTE ➔ Folie 5</span>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       SEITE 3: KARTEN 5 & 6
  ========================================================================= -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER DURCHSCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 5 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">KARTE 5</span>
          <span class="slide-badge">FOLIE 5: DASHBOARD</span>
          <span class="card-title">Dashboard, 100% DSGVO & Urkunde</span>
        </div>
        <span class="card-time">⏱️ 11:00 – 13:00</span>
      </div>

      <div class="card-body">
        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">🎤 JONA (Lehrer-Dashboard & 100% Datenschutz)</div>
          <div class="first-sentence">
            „Der eigentliche pädagogische Hebel entsteht durch unser Lehrkräfte-Dashboard:“
          </div>
          <ul class="bullet-list">
            <li>Lehrkraft generiert mit 1 Klick einen <strong>anonymen Klassencode</strong> (z.B. ‚KL-8B‘).</li>
            <li>Beamer zeigt <strong>in Echtzeit Klassendurchschnitt & Hebel</strong> der gesamten Klasse.</li>
            <li>🔒 <strong>100% DSGVO:</strong> Keine Schüler-Accounts. Schülernamen für Urkunden werden <strong>ausschließlich lokal im Browser</strong> eingesetzt – null Server-Speicherung!</li>
          </ul>
        </div>

        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">🎤 PAUL (Handabdruck & Maßnahmen-Simulator)</div>
          <div class="first-sentence">
            „Ganz wichtig: Keine Schuldgefühle erzeugen, sondern Handeln anstoßen!“
          </div>
          <ul class="bullet-list">
            <li><strong>Simulator:</strong> Was spart 2 Tage Veggie oder Fahrrad? (z.B. -350 kg CO₂ / 28 Bäume).</li>
            <li>Klimaschutz-Versprechen wird direkt auf die <strong>druckbare Urkunde</strong> übernommen!</li>
          </ul>
        </div>

        <div class="regie-box">
          📜 <strong>Regie:</strong> Wortlaut „DSGVO-konform ohne Schüler-Accounts“ begeistert Schulleiter & Ministerium!
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">👉 Jona leitet zum Schlusswort über.</span>
        <span class="key-trigger">⌨️ Taste: LEERTASTE ➔ Folie 6</span>
      </div>
    </div>

    <!-- KARTE 6 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">KARTE 6</span>
          <span class="slide-badge">FOLIE 6: ABSCHLUSS</span>
          <span class="card-title">Fazit & Übergabe an Deuschle</span>
        </div>
        <span class="card-time">⏱️ 13:00 – 15:00</span>
      </div>

      <div class="card-body">
        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">🎤 JONA (Fazit & Angebot an Schulen)</div>
          <div class="first-sentence">
            „Unsere Botschaft heute: Klimaschutz scheitert nicht am Willen der Jugendlichen oder Lehrer.“
          </div>
          <ul class="bullet-list">
            <li>Er scheiterte bisher an komplizierten Werkzeugen.</li>
            <li>Unser CO₂-Rechner steht ab heute <strong>auf Anfrage kostenlos für Schulen in BW</strong> bereit.</li>
          </ul>
        </div>

        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">🎤 PAUL (Dank, Schulzugang & Feierliche Übergabe)</div>
          <div class="first-sentence">
            „Schulzugänge richten wir nur auf Anfrage per E-Mail (jona.noack@outlook.de) oder gleich an unserer Stellwand ein!“
          </div>
          <ul class="bullet-list">
            <li>Dank an Jugendstiftung, Ministerium & Umweltmentoren-Kurs.</li>
            <li>🎤 <strong>Übergabesatz:</strong> <em>„Und nun freuen wir uns ganz besonders auf den Impuls und das Gespräch mit Herrn Staatssekretär Andreas Deuschle! Vielen Dank!“</em></li>
          </ul>
        </div>

        <div class="regie-box">
          👏 <strong>Regie:</strong> Gemeinsam verbeugen · Handgeste zu Andreas Deuschle · Lächeln · Applaus genießen!
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">🏁 ENDE DES VORTRAGS (15:00 min Punktlandung)</span>
        <span class="key-trigger">🎤 Übergabe an Andreas Deuschle</span>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       SEITE 4: Q&A DEFENSE & NOTFALLKARTEN
  ========================================================================= -->
  <div class="page">
    <div class="cut-line"></div>
    <div class="cut-label">✂ HIER DURCHSCHNEIDEN (DIN A6 KARTEN)</div>

    <!-- KARTE 7 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">EXTRA 1</span>
          <span class="slide-badge">Q&A DEFENSE</span>
          <span class="card-title">Fragen souverän abfangen</span>
        </div>
        <span class="card-time">🛡️ Nachfragen</span>
      </div>

      <div class="card-body">
        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">❓ FRAGE 1: Datenschutz an Schulen?</div>
          <ul class="bullet-list">
            <li><strong>Jona:</strong> „Zu 100% DSGVO-konform. Schüler geben weder Namen noch E-Mail an. Teilnahme über anonymen Einmal-Code. Urkundennamen werden nur lokal im Browser-RAM eingesetzt.“</li>
          </ul>
        </div>

        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">❓ FRAGE 2: Warum liegt das Ergebnis bei 7–9 Tonnen?</div>
          <ul class="bullet-list">
            <li><strong>Paul:</strong> „Wissenschaftlicher UBA-Standard: Jeder Bürger hat 1,2 t unvermeidbare öffentliche Emissionen (Straßen, Schulen, Spitäler) + 3,2 t Grundbedarf. Das verhindert Schönrechnerei!“</li>
          </ul>
        </div>

        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">❓ FRAGE 3: Was kostet das Tool & wie läuft der Zugang?</div>
          <ul class="bullet-list">
            <li><strong>Paul:</strong> „Exakt 0,00 Euro. Gemeinwohl- und Schülerprojekt von uns Umweltmentoren. Der Rechner ist dauerhaft kostenlos – Schulzugänge und Lehrer-Accounts richten wir allerdings ausschließlich auf Anfrage per E-Mail ein (jona.noack@outlook.de)!“</li>
          </ul>
        </div>

        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">❓ FRAGE 4: Passt das in den Bildungsplan BW?</div>
          <ul class="bullet-list">
            <li><strong>Jona:</strong> „Perfekt. Leitperspektive BNE (Bildung für nachhaltige Entwicklung), Geographie (Kl. 7-10), Biologie/BNT und Gemeinschaftskunde.“</li>
          </ul>
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">👉 Ruhig, präzise und selbstbewusst antworten.</span>
        <span class="key-trigger">Stichworte: BNE · DSGVO · UBA</span>
      </div>
    </div>

    <!-- KARTE 8 -->
    <div class="card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-badge">EXTRA 2</span>
          <span class="slide-badge">BACKUP & TECHNIK</span>
          <span class="card-title">Tastatur, WLAN & Timing-Plan</span>
        </div>
        <span class="card-time">⚡ Quick-Fixes</span>
      </div>

      <div class="card-body">
        <div class="section-block block-beamer">
          <div class="speaker-tag tag-beamer">⌨️ TASTEN-STEUERUNG AM PRÄSENTATIONS-LAPTOP</div>
          <ul class="bullet-list">
            <li>• <strong>F</strong> = Vollbildmodus aktivieren / beenden</li>
            <li>• <strong>LEERTASTE / PFEIL RECHTS</strong> = Nächste Folie</li>
            <li>• <strong>PFEIL LINKS</strong> = Vorherige Folie</li>
            <li>• <strong>Zahlen 1 bis 6</strong> = Direkt zu Folie 1 bis 6 springen</li>
          </ul>
        </div>

        <div class="section-block block-paul">
          <div class="speaker-tag tag-paul">📶 WLAN-NOTFALL IM SAAL</div>
          <ul class="bullet-list">
            <li>Falls jemand im Publikum kein Netz hat: Paul sagt locker: <em>„Wer kurz kein Netz hat, schaut einfach bei der Nachbarin aufs Display oder testet nachher an unserer Stellwand!“</em></li>
          </ul>
        </div>

        <div class="section-block block-jona">
          <div class="speaker-tag tag-jona">⏱️ TIMING-CHECKPOINTS (15 MINUTEN GESAMT)</div>
          <ul class="bullet-list">
            <li><strong>02:00:</strong> Begrüßung fertig ➔ <strong>04:30:</strong> Problem erklärt ➔ <strong>08:30:</strong> Live-Test im Saal fertig ➔ <strong>11:00:</strong> Didaktik & UBA ➔ <strong>13:00:</strong> Dashboard ➔ <strong>15:00:</strong> Übergabe an Deuschle!</li>
          </ul>
        </div>
      </div>

      <div class="card-footer">
        <span class="handover-signal">👉 Ihr seid top vorbereitet – viel Erfolg auf der Bühne!</span>
        <span class="key-trigger">Umweltmentoren 2025/2026</span>
      </div>
    </div>
  </div>

</body>
</html>
`;

// -----------------------------------------------------------------------------
// 2. DIN A4 BÜHNEN-SPRECHTEXT (VOLLSTÄNDIGER LESETEXT MIT UBA-PAUSCHALE)
// -----------------------------------------------------------------------------
const scriptHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Bühnen-Sprechtext: Jona Noack & Paul Kaiser</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 18mm;
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
      line-height: 1.5;
      font-size: 10pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-block {
      border-bottom: 2px solid #09090b;
      padding-bottom: 4mm;
      margin-bottom: 5mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .top-tag {
      font-family: monospace;
      font-size: 7.5pt;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1mm;
    }
    h1 {
      font-size: 17pt;
      font-weight: 800;
      color: #09090b;
      letter-spacing: -0.5px;
    }
    .sub {
      font-size: 10.5pt;
      color: #52525b;
      margin-top: 1mm;
    }
    .meta-box {
      text-align: right;
      font-family: monospace;
      font-size: 8pt;
      color: #52525b;
      line-height: 1.4;
    }
    .section-title {
      font-family: monospace;
      font-size: 9pt;
      font-weight: 800;
      color: #09090b;
      background: #f4f4f5;
      border-left: 3px solid #09090b;
      padding: 1.8mm 3mm;
      margin: 5mm 0 2.5mm 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      justify-content: space-between;
    }
    .beamer-cue {
      font-size: 8.5pt;
      font-style: italic;
      color: #b45309;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 1.2mm 2.5mm;
      border-radius: 1.5mm;
      margin-bottom: 2.5mm;
      display: inline-block;
    }
    .speech {
      margin-bottom: 3mm;
      padding-left: 2.5mm;
    }
    .speaker {
      font-family: monospace;
      font-weight: 800;
      font-size: 9pt;
      padding: 0.4mm 1.8mm;
      border-radius: 1mm;
      display: inline-block;
      margin-bottom: 1mm;
    }
    .speaker-p { background: #dbeafe; color: #1e40af; }
    .speaker-j { background: #dcfce7; color: #166534; }
    .quote {
      color: #09090b;
      font-size: 10pt;
    }
    .quote em {
      color: #52525b;
      font-style: italic;
    }
    .stage-direction {
      font-size: 8pt;
      color: #71717a;
      font-style: italic;
      margin-left: 2mm;
    }
    .footer-note {
      margin-top: 6mm;
      border-top: 1px solid #e4e4e7;
      padding-top: 2.5mm;
      font-family: monospace;
      font-size: 7.5pt;
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
      <div class="top-tag">Abschlussveranstaltung Umweltmentoren 2025/2026 · Innenministerium Stuttgart</div>
      <h1>🎤 Wort-für-Wort-Bühnentext (15 Minuten)</h1>
      <div class="sub">Vortrag „APP zum CO₂-Fußabdruck“ · Jona Noack & Paul Kaiser</div>
    </div>
    <div class="meta-box">
      <strong>25. September 2026</strong><br>
      13:15 – 13:30 Uhr (15 Min)<br>
      Vor Staatssekretär Andreas Deuschle
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
    <span>Minute 08:30 – 11:00 | Didaktischer Aufbau, UBA-Pauschale & 3 Modi</span>
    <span>[FOLIE 4]</span>
  </div>
  <div class="beamer-cue">🖥️ BEAMER: Folie 4 weiterklicken (4 Säulen, 4,4 t UBA-Pauschale & 3 Unterrichtsmodi)</div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <div class="quote">
      „Was Sie gerade auf dem Smartphone erlebt haben, basiert auf einem durchdachten didaktischen Konzept:<br>
      Wir bilanzieren in <strong>vier klaren Lebensbereichen</strong>: Mobilität, Ernährung, Energie und Konsum. Alle Umrechnungsfaktoren stammen aus wissenschaftlich validierten Datenbanken des <strong>Umweltbundesamts (UBA)</strong> und von <strong>GEMIS</strong>.<br>
      Und wir haben einen entscheidenden wissenschaftlichen Schritt gemacht:<br>
      Viele Schulrechner errechnen unrealistische Werte wie ‚1,7 Tonnen‘, weil sie nur Fragen zusammenzählen. Unser Rechner integriert die <strong>offizielle UBA-Grundpauschale von 4,4 Tonnen</strong> – darunter 1.200 kg für staatliche Infrastruktur wie Straßen, Schulen und Krankenhäuser. Damit lernen Schüler: Klimaschutz ist eine persönliche, aber auch eine gesellschaftliche Aufgabe!“
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
      Mit unserem CO₂-Rechner steht ab heute ein kostenloses, modernes und datenschutzkonformes Tool auf Anfrage für Schulen in Baden-Württemberg bereit.“
    </div>
  </div>

  <div class="speech">
    <span class="speaker speaker-p">PAUL KAISER:</span>
    <span class="stage-direction">(Schaut zu Staatssekretär Andreas Deuschle und ins Publikum)</span>
    <div class="quote">
      „Wichtig für alle Lehrkräfte: Der CO₂-Rechner steht auf Anfrage bereit – Schulzugänge und Klassenlizenzen richten wir nur auf Anfrage per E-Mail (jona.noack@outlook.de) oder direkt an unserer Stellwand im Projekte-Markt ein.<br>
      Besuchen Sie uns gleich im Anschluss! Wir haben fertige Verlaufspläne und Handouts für Sie vorbereitet.<br>
      Wir danken der Jugendstiftung Baden-Württemberg, dem Ministerium und unserem gesamten Mentorenkurs für die Unterstützung im vergangenen Jahr.<br>
      <strong>Und nun freuen wir uns ganz besonders auf den Impuls und das Gespräch mit Staatssekretär Andreas Deuschle!</strong><br>
      Vielen Dank!“<br>
      <em>(Gemeinsame Verbeugung, Lächeln, Applaus abwarten)</em>
    </div>
  </div>

  <div class="footer-note">
    <span>CO₂-Rechner für Schulen · Umweltmentoren Baden-Württemberg 2025/2026</span>
    <span>Seite 3 / 3</span>
    <span>Jona Noack & Paul Kaiser</span>
  </div>

</body>
</html>
`;

async function run() {
  console.log('Writing improved HTML files...');
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

  console.log('SUCCESS! Both improved PDFs generated in druckmaterialien and public/materials');
}

run().catch(err => {
  console.error('Error generating PDFs:', err);
  process.exit(1);
});
