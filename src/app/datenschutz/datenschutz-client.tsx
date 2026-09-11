'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
        <article className="paper-sheet p-6 sm:p-10 space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Privatsphäre & Datenschutz</span>
            <span>DSGVO-Konform</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-foreground">
              Datenschutzerklärung
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Umgang mit Daten an Schulen gemäß der Datenschutz-Grundverordnung (DSGVO)
            </p>
          </div>

          {/* Anonymity Notice */}
          <div className="p-4 border border-border bg-muted/30 space-y-1 font-sans text-xs">
            <span className="font-semibold text-foreground block font-mono text-[11px] uppercase tracking-wider">
              100% Anonym für Schülerinnen und Schüler
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Die Bearbeitung des CO₂-Rechners durch Schülerinnen und Schüler erfolgt ohne Erhebung von Namen, E-Mail-Adressen oder Gerätekennungen. Der 8-stellige Zugangscode ist ein rein technisches Zufallstoken.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border pt-4">
            <section className="space-y-1.5">
              <h2 className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                1. Verantwortliche Stelle
              </h2>
              <p>
                Verantwortlicher im Sinne der Datenschutzgesetze ist:
              </p>
              <div className="p-3 border border-border bg-muted/20 text-foreground font-sans mt-1">
                <strong>Jona Noack</strong><br />
                Kiehnlestraße 25, 75172 Pforzheim<br />
                E-Mail: <a href="mailto:jona.noack@outlook.de" className="underline">jona.noack@outlook.de</a>
              </div>
            </section>

            <section className="space-y-1.5 border-t border-border pt-4">
              <h2 className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                2. Zweck der Datenverarbeitung
              </h2>
              <p>
                <strong>Schülerdaten:</strong> Die Antworten im Quiz dienen rein zur Berechnung deines CO₂-Ergebnisses und werden als anonymer Summenwert für deine Klasse aggregiert.
              </p>
              <p>
                <strong>Lehrkräfte & Schulen:</strong> Für Lehrkräfte und Schulen werden Schulname, dienstliche E-Mail-Adresse und ein verschlüsseltes Passwort gespeichert, um Klassen und Codes zu verwalten.
              </p>
            </section>

            <section className="space-y-1.5 border-t border-border pt-4">
              <h2 className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                3. Löschung von Klassendaten
              </h2>
              <p>
                Lehrkräfte können erstellte Klassen im Schul-Dashboard jederzeit eigenständig löschen. Damit werden alle verknüpften Zugangscodes und Antworten unwiderruflich aus der Datenbank entfernt.
              </p>
            </section>
          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
