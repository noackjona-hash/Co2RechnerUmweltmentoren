'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server, Database, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

export default function DatenschutzClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-between pb-8 bg-background">
      {/* Editorial Nav */}
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
          <button
            onClick={() => router.back()}
            className="paper-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Zurück</span>
          </button>

          <span className="font-serif text-sm font-semibold text-foreground">CO₂-Rechner</span>
          <ThemeToggle />
        </div>
      </header>

      {/* Content Sheet */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <article className="paper-sheet p-6 sm:p-10 space-y-8">
          <div className="border-b border-border pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Privatsphäre & Datenschutz</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> DSGVO & TDDDG konform
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-foreground">
              Datenschutzerklärung
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Transparente Angaben zur Erhebung und Verarbeitung personenbezogener Daten gemäß der Datenschutz-Grundverordnung (DSGVO) und dem Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG).
            </p>
          </div>

          {/* Anonymity Notice */}
          <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-sm space-y-2 font-sans text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <EyeOff className="w-4 h-4" />
              100% Anonym für Schülerinnen und Schüler
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Für die Teilnahme am CO₂-Quiz werden von Schülerinnen und Schülern <strong>weder Klarnamen, E-Mail-Adressen noch dauerhafte Profilkennungen</strong> erhoben. Der 8-stellige Zugangscode (<code className="font-mono bg-muted/50 px-1 py-0.5 rounded">XXXX-XXXX</code>) ist ein rein zufälliges, technisches Einweg-Token zur Klassenzuordnung.
            </p>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-6 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border pt-4">
            
            {/* 1. Verantwortlicher */}
            <section className="space-y-2">
              <h2 className="font-mono text-[12px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 1. Verantwortliche Stelle
              </h2>
              <p>
                Verantwortlicher im Sinne der DSGVO und sonstiger datenschutzrechtlicher Bestimmungen ist:
              </p>
              <div className="p-3.5 border border-border bg-muted/20 text-foreground font-sans rounded-sm leading-relaxed">
                <strong>Jona Noack</strong><br />
                Kiehnlestraße 25<br />
                75172 Pforzheim<br />
                Deutschland<br />
                E-Mail: <a href="mailto:jona.noack@outlook.de" className="underline underline-offset-2">jona.noack@outlook.de</a>
              </div>
            </section>

            {/* 2. Rechtsgrundlagen */}
            <section className="space-y-2 border-t border-border pt-4">
              <h2 className="font-mono text-[12px] font-semibold text-foreground uppercase tracking-wider">
                2. Rechtsgrundlagen der Verarbeitung
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung & Nutzungsbedingungen):</strong> Verarbeitung zur Bereitstellung der Schulkonten, Klassen und der Quiz-Funktion.
                </li>
                <li>
                  <strong>Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse):</strong> Technische Sicherung gegen Brute-Force-Angriffe, Session-Management und Schutz der Systemstabilität.
                </li>
                <li>
                  <strong>Art. 6 Abs. 1 lit. a DSGVO & § 25 Abs. 1 TDDDG (Einwilligung):</strong> Optionale Web-Analytics (Vercel Web Analytics), die nur nach aktiver Bestätigung im Consent-Banner geladen werden.
                </li>
              </ul>
            </section>

            {/* 3. Speicherungen & Cookies */}
            <section className="space-y-3 border-t border-border pt-4">
              <h2 className="font-mono text-[12px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> 3. Lokale Speicherung & Cookies (§ 25 TDDDG)
              </h2>
              <p>
                Wir setzen Speichertechnologien ein, die für den Betrieb des Rechners zwingend erforderlich sind (§ 25 Abs. 2 Nr. 2 TDDDG). Zusätzliche Tracking-Cookies werden nicht ohne vorherige Einwilligung gesetzt.
              </p>
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-muted/40 font-mono text-foreground uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="p-2.5">Name / Schlüssel</th>
                      <th className="p-2.5">Typ</th>
                      <th className="p-2.5">Zweck</th>
                      <th className="p-2.5">Gültigkeit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-sans">
                    <tr>
                      <td className="p-2.5 font-mono text-foreground font-medium">session</td>
                      <td className="p-2.5">HTTP-Cookie (HttpOnly, Secure)</td>
                      <td className="p-2.5">Kryptografisch signiertes JWT zur Authentifizierung von Lehrkräften und Schülern.</td>
                      <td className="p-2.5">7 Tage</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-foreground font-medium">co2rechner_cookie_consent</td>
                      <td className="p-2.5">LocalStorage</td>
                      <td className="p-2.5">Speichert Ihre Datenschutzauswahl (Notwendig vs. Alle).</td>
                      <td className="p-2.5">Dauerhaft</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-foreground font-medium">co2_answers_*</td>
                      <td className="p-2.5">LocalStorage</td>
                      <td className="p-2.5">Zwischenspeicherung der Schüler-Antworten gegen Verbindungsverluste im Unterricht.</td>
                      <td className="p-2.5">Bis Quiz-Abschluss</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Hosting & Datenübermittlung */}
            <section className="space-y-2 border-t border-border pt-4">
              <h2 className="font-mono text-[12px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> 4. Hosting & Rechenzentrum
              </h2>
              <p>
                <strong>Frontend & Edge-Delivery:</strong> Das Frontend wird über <strong>Vercel Inc.</strong> (440 N Barranca Ave #4133, Covina, CA 91723, USA) ausgeliefert. Mit Vercel besteht eine Vereinbarung zur Auftragsverarbeitung (Data Processing Addendum) auf Basis der Standardvertragsklauseln der EU-Kommission.
              </p>
              <p>
                <strong>Backend & Datenbank:</strong> Das Backend und die PostgreSQL-Datenbank werden auf einem dedizierten Server in Deutschland betrieben. Alle Datenübertragungen zwischen Frontend und Backend erfolgen über Ende-zu-Ende TLS-verschlüsselte Tunnel.
              </p>
            </section>

            {/* 5. Technische Sicherheit & Verschlüsselung */}
            <section className="space-y-2 border-t border-border pt-4">
              <h2 className="font-mono text-[12px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> 5. Datensicherheit & Verschlüsselung (Art. 32 DSGVO)
              </h2>
              <p>
                Zum Schutz Ihrer Daten nutzen wir modernste Verschlüsselungs- und Sicherheitsstandards:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Vollständige Transportverschlüsselung (HTTPS mit modernem TLS 1.3 / 1.2 und HSTS-Preload mit 2 Jahren Laufzeit).</li>
                <li>Content-Security-Policy (CSP) und Strict X-Frame-Options zum Schutz vor Cross-Site-Scripting (XSS) und Clickjacking.</li>
                <li>Passwörter werden mit starkem Salted Bcrypt gehasht (12 Runden).</li>
                <li>Automatische, nach <strong>AES-256-CBC</strong> verschlüsselte Datenbank-Backups zur Ausfallsicherheit.</li>
                <li>In-Memory Rate Limiting zum Schutz vor automatisierten Brute-Force-Angriffen.</li>
              </ul>
            </section>

            {/* 6. Rechte der betroffenen Personen */}
            <section className="space-y-2 border-t border-border pt-4">
              <h2 className="font-mono text-[12px] font-semibold text-foreground uppercase tracking-wider">
                6. Ihre Betroffenenrechte (Art. 15–21 DSGVO)
              </h2>
              <p>
                Sie haben gegenüber dem Verantwortlichen folgende Rechte:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Recht auf Auskunft (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.</li>
                <li><strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie können die Berichtigung unrichtiger Daten verlangen.</li>
                <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie können die unverzügliche Löschung Ihrer Daten verlangen. Lehrkräfte können Klassen und Quiz-Daten direkt im Dashboard eigenständig und unwiderruflich löschen.</li>
                <li><strong>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO).</strong></li>
                <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO).</strong></li>
                <li><strong>Widerspruchsrecht (Art. 21 DSGVO).</strong></li>
                <li><strong>Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO):</strong> Eine erteilte Einwilligung (z. B. im Cookie-Banner) kann jederzeit mit Wirkung für die Zukunft widerrufen werden.</li>
              </ul>
            </section>

            {/* 7. Beschwerderecht bei der Aufsichtsbehörde */}
            <section className="space-y-2 border-t border-border pt-4">
              <h2 className="font-mono text-[12px] font-semibold text-foreground uppercase tracking-wider">
                7. Beschwerderecht bei der zuständigen Aufsichtsbehörde (Art. 77 DSGVO)
              </h2>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die für unseren Sitz zuständige Behörde ist:
              </p>
              <div className="p-3.5 border border-border bg-muted/20 text-foreground font-sans rounded-sm leading-relaxed">
                <strong>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI BW)</strong><br />
                Lautenschlagerstraße 20, 70173 Stuttgart<br />
                Postfach 10 29 32, 70025 Stuttgart<br />
                Telefon: 0711/61 55 41-0<br />
                E-Mail: <a href="mailto:poststelle@lfdi.bwl.de" className="underline underline-offset-2">poststelle@lfdi.bwl.de</a><br />
                Website: <a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-mono text-[11px]">baden-wuerttemberg.datenschutz.de</a>
              </div>
            </section>

          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
