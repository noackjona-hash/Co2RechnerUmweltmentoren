'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, Mail, MapPin, ShieldAlert, Code } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';
import { ParticleField } from '@/components/particle-field';

export default function ImpressumClient() {
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
              Rechtliche Angaben
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Impressum
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Angaben gemäß § 5 TMG und § 18 Abs. 2 MStV
            </p>
          </div>

          <hr className="border-border" />

          {/* Contact & Address */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 p-4 rounded-2xl bg-muted/40 border border-border/60">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Angaben gemäß § 5 TMG
              </h3>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                <strong className="font-bold block">Jona Noack</strong>
                Kiehnlestraße 25<br />
                75172 Pforzheim<br />
                Deutschland
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-muted/40 border border-border/60">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                Kontakt
              </h3>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                E-Mail:{' '}
                <a
                  href="mailto:jona.noack@outlook.de"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  jona.noack@outlook.de
                </a>
              </p>
            </div>
          </div>

          {/* Responsible Person */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Jona Noack<br />
              Kiehnlestraße 25<br />
              75172 Pforzheim
            </p>
          </div>

          <hr className="border-border" />

          {/* Project background */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-500" />
              Projekt & Entwicklung
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Dieses Softwareprojekt wurde von <strong>Jona Noack</strong> für das Umweltmentorenprogramm konzipiert und entwickelt, um Schülerinnen und Schülern an Schulen einen kindgerechten, transparenten und motivierenden Einstieg in den persönlichen Klimaschutz zu ermöglichen.
            </p>
          </div>

          <hr className="border-border" />

          {/* Disclaimers */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Haftungsausschluss (Disclaimer)
            </h3>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div>
                <h4 className="font-bold text-foreground mb-0.5">Haftung für Inhalte</h4>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-0.5">Haftung für Links</h4>
                <p>
                  Unser Angebot kann Links zu externen Websites Dritter enthalten, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-0.5">Urheberrecht</h4>
                <p>
                  Die durch den Seitenbetreiber erstellten Inhalte, Quellcodes und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der gesetzlichen Schranken des Urheberrechts bedürfen der schriftlichen Zustimmung des Urhebers Jona Noack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
