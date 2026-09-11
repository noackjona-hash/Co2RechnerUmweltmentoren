'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

export default function ImpressumClient() {
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
              Rechtliche Angaben
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Impressum
            </h1>
            <p className="text-xs text-muted-foreground">
              Angaben gemäß § 5 TMG und § 18 Abs. 2 MStV
            </p>
          </div>

          <hr className="border-border" />

          {/* Contact & Address */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 p-3.5 rounded-xl bg-muted/40 border border-border">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Herausgeber
              </span>
              <p className="text-xs text-foreground leading-relaxed pt-1">
                <strong className="block font-semibold">Jona Noack</strong>
                Kiehnlestraße 25<br />
                75172 Pforzheim<br />
                Deutschland
              </p>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-muted/40 border border-border">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Kontakt
              </span>
              <p className="text-xs text-foreground leading-relaxed pt-1">
                E-Mail:{' '}
                <a
                  href="mailto:jona.noack@outlook.de"
                  className="text-primary font-semibold hover:underline"
                >
                  jona.noack@outlook.de
                </a>
              </p>
            </div>
          </div>

          {/* Responsible Person */}
          <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
            <h2 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>
              Jona Noack, Kiehnlestraße 25, 75172 Pforzheim
            </p>
          </div>

          <hr className="border-border" />

          {/* Project background */}
          <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
            <h2 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Projekt & Entwicklung
            </h2>
            <p>
              Dieses Softwareprojekt wurde von <strong>Jona Noack</strong> für das Umweltmentorenprogramm an Schulen in Baden-Württemberg entwickelt, um Schülerinnen und Schülern einen transparenten, fundierten und spielerischen Zugang zum Thema CO₂-Bilanzierung zu ermöglichen.
            </p>
          </div>

          <hr className="border-border" />

          {/* Disclaimers */}
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-bold text-foreground mb-0.5">Haftung für Inhalte</h3>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-0.5">Urheberrecht</h3>
              <p>
                Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der vorherigen schriftlichen Zustimmung des Urhebers Jona Noack.
              </p>
            </div>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
