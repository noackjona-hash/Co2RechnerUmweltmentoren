'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, Lock, Shield, Eye, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

export default function DatenschutzClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-400/10 dark:bg-teal-400/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl glass hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-sm">CO₂ Rechner</span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full animate-slide-up">
        <div className="glass-strong rounded-3xl p-6 sm:p-10 shadow-2xl border-white/20 dark:border-white/5 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Datenschutzerklärung</h1>
            <p className="text-sm text-muted-foreground">
              Informationen über den Umgang mit personenbezogenen Daten gemäß der EU-Datenschutz-Grundverordnung (DSGVO).
            </p>
          </div>

          <hr className="border-border/50" />

          {/* Intro Box */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex gap-4 items-start">
            <Lock className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">100% Anonym für Schülerinnen und Schüler</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                Als Schülerin oder Schüler nutzen Sie diesen CO₂-Rechner vollständig anonym. Der Zugangscode (Access Key) is ein zufällig generiertes Zeichen-Token. Es werden keine Namen, IP-Adressen oder sonstigen Identifikatoren gespeichert, die Sie persönlich identifizieren könnten.
              </p>
            </div>
          </div>

          {/* Section list */}
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                1. Allgemeine Hinweise und Pflichtinformationen
              </h3>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
              <p>
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist der im Impressum genannte Herausgeber.
              </p>
            </section>

            <hr className="border-border/50" />

            <section className="space-y-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                2. Datenverarbeitung auf dieser Website
              </h3>
              
              <div className="space-y-2 pl-2">
                <h4 className="font-semibold text-foreground">a) Schüler-Zugang und Quiz-Ergebnisse</h4>
                <p>
                  Zur Durchführung des Quiz melden sich Schüler über einen anonymen Zugangscode an. Während der Durchführung werden Ihre Antworten im Backend gespeichert. Nach Abschluss des Quiz berechnet die Anwendung Ihre CO₂-Emissionsbilanz. Diese Bilanzen werden klassenweise aggregiert, damit Ihre Schule (Lehrer/innen) Gesamtstatistiken Ihrer Klasse erstellen kann. Eine Rückführung auf Sie als Person ist technisch unmöglich.
                </p>
                
                <h4 className="font-semibold text-foreground">b) Schul- und Administrations-Accounts</h4>
                <p>
                  Für Schulen, die Lizenzen erwerben, speichern wir den Schulnamen, die E-Mail-Adresse des Ansprechpartners sowie ein verschlüsseltes Passwort. Diese Daten dienen ausschließlich der Bereitstellung und Verwaltung der Klassen und Zugangscodes. Rechtsgrundlage für diese Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
                </p>
              </div>
            </section>

            <hr className="border-border/50" />

            <section className="space-y-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                3. Hosting und Protokolldateien
              </h3>
              <p>
                Diese Anwendung wird auf einem sicheren, DSGVO-konformen Server gehostet (z.B. in Deutschland). Der Server zeichnet automatisch Log-Dateien auf, die der Browser an uns sendet. Dies umfasst z.B. den Browsertyp, das verwendete Betriebssystem, die Referrer-URL und die Uhrzeit der Anfrage.
              </p>
              <p>
                Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Wir speichern diese Logfiles zur Gewährleistung der IT-Sicherheit und Fehleranalyse auf Basis unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </section>

            <hr className="border-border/50" />

            <section className="space-y-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-emerald-500" />
                4. Ihre Rechte (Auskunft, Löschung, Widerruf)
              </h3>
              <p>
                Als Betroffener haben Sie jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung (Art. 15 DSGVO).
              </p>
              <p>
                Sie haben außerdem das Recht, die Berichtigung, Sperrung oder Löschung Ihrer Daten zu verlangen (Art. 16, 17 DSGVO). Bitte wenden Sie sich hierzu an den Klassenlehrer bzw. Administrator Ihrer Schule, der über das Schul-Dashboard erstellte Klassen und studentische Zugangscodes direkt löschen kann. Mit der Löschung einer Klasse werden alle damit verknüpften Schülercodes sowie deren Antworten unwiderruflich aus der Datenbank entfernt.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
