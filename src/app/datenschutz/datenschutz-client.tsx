'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

export default function DatenschutzClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-between pb-8 selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Nav */}
      <header className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border/80">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg paper-btn-secondary text-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Zurück</span>
        </button>

        <span className="font-bold text-sm text-foreground">CO₂-Rechner</span>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="paper-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
              Privatsphäre
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Datenschutzerklärung
            </h1>
            <p className="text-xs text-muted-foreground">
              Umgang mit personenbezogenen Daten gemäß DSGVO
            </p>
          </div>

          <hr className="border-border" />

          {/* Anonymity Notice */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
            <span className="text-xs font-bold text-foreground block">
              100% anonym für Schülerinnen und Schüler
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Als Schülerin oder Schüler nutzt du diesen Rechner vollständig anonym. Der 8-stellige Zugangscode ist ein Zufallstoken. Es werden keine Klarnamen, keine E-Mail-Adressen und keine Profile in einer Datenbank gespeichert.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <section className="space-y-1">
              <h2 className="font-bold text-foreground text-xs uppercase tracking-wider">
                1. Verantwortliche Stelle
              </h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-foreground font-medium mt-1">
                Jona Noack<br />
                Kiehnlestraße 25, 75172 Pforzheim<br />
                E-Mail: jona.noack@outlook.de
              </div>
            </section>

            <hr className="border-border" />

            <section className="space-y-1.5">
              <h2 className="font-bold text-foreground text-xs uppercase tracking-wider">
                2. Zweck der Datenverarbeitung
              </h2>
              <p>
                <strong>Schülerdaten:</strong> Die Antworten im Quiz dienen rein zur Berechnung deines CO₂-Ergebnisses und werden als Summenwert für deine Klasse aggregiert.
              </p>
              <p>
                <strong>Lehrkräfte & Schulen:</strong> Für Lehrkräfte und Schulen werden Schulname, dienstliche E-Mail-Adresse und ein verschlüsseltes Passwort gespeichert, um Klassen und Codes zu verwalten.
              </p>
            </section>

            <hr className="border-border" />

            <section className="space-y-1">
              <h2 className="font-bold text-foreground text-xs uppercase tracking-wider">
                3. Löschung von Klassendaten
              </h2>
              <p>
                Lehrkräfte können erstellte Klassen im Schul-Dashboard jederzeit eigenständig löschen. Damit werden alle verknüpften Zugangscodes und Antworten unwiderruflich aus der Datenbank entfernt.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
