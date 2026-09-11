'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, Lock, Shield, Eye, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';
import { ParticleField } from '@/components/particle-field';

export default function DatenschutzClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-between relative pb-8">
      <ParticleField />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 max-w-4xl mx-auto w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-2xl bg-card border border-border hover:bg-muted text-foreground transition-all cursor-pointer btn-bounce"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-xs">
            <Leaf className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-sm text-foreground">CO₂ Rechner</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full animate-scale-in">
        <div className="bg-card rounded-3xl p-6 sm:p-10 border-2 border-border shadow-lg space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
              Datenschutz & Privatsphäre
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Datenschutzerklärung
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Informationen über den sicheren Umgang mit Daten gemäß der DSGVO
            </p>
          </div>

          <hr className="border-border" />

          {/* Child-friendly Intro Box */}
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex gap-4 items-start">
            <span className="text-3xl select-none">🔒</span>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                100% Anonym für Schülerinnen und Schüler
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Als Schülerin oder Schüler nutzt du diesen CO₂-Rechner vollkommen anonym. Dein Zugangscode ist ein zufälliger Zahlencode. Es werden keine Klarnamen, keine E-Mail-Adressen und keine persönlichen Profile von Schüler:innen in einer Datenbank gespeichert.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                1. Verantwortliche Stelle
              </h3>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-foreground font-medium">
                Jona Noack<br />
                Kiehnlestraße 25, 75172 Pforzheim<br />
                E-Mail: jona.noack@outlook.de
              </div>
            </section>

            <hr className="border-border" />

            <section className="space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                2. Wie werden deine Eingaben verwendet?
              </h3>
              <p>
                <strong>Schüler:innen:</strong> Deine Antworten im Quiz dienen ausschließlich der Berechnung deines geschätzten CO₂-Ausstoßes und werden aggregiert für deine Klasse zusammengezählt, damit eure Klasse an Schul-Challenges teilnehmen kann.
              </p>
              <p>
                <strong>Lehrkräfte & Schulen:</strong> Für Lehrkräfte und Schulen werden lediglich Schulname, dienstliche E-Mail-Adresse und ein verschlüsseltes Passwort gespeichert, um Klassen und Codes zu verwalten.
              </p>
            </section>

            <hr className="border-border" />

            <section className="space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-emerald-500" />
                3. Löschung von Klassendaten
              </h3>
              <p>
                Lehrkräfte haben jederzeit die Möglichkeit, erstellte Klassen im Schul-Dashboard vollständig zu löschen. Mit der Löschung einer Klasse werden sämtliche verknüpften Schülercodes und Antworten unwiderruflich gelöscht.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
