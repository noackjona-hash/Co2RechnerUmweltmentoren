'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

export default function ImpressumClient() {
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
            <span>Rechtliche Angaben</span>
            <span>§ 5 TMG / § 18 MStV</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-foreground">
              Impressum
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Angaben gemäß § 5 TMG und § 18 Abs. 2 MStV
            </p>
          </div>

          {/* Contact & Address Paper Blocks */}
          <div className="grid gap-4 sm:grid-cols-2 font-sans text-xs">
            <div className="space-y-1.5 p-4 border border-border bg-muted/30">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Herausgeber & Anschrift
              </span>
              <p className="text-foreground leading-relaxed pt-1">
                <strong className="block font-semibold">Jona Noack</strong>
                Kiehnlestraße 25<br />
                75172 Pforzheim<br />
                Deutschland
              </p>
            </div>

            <div className="space-y-1.5 p-4 border border-border bg-muted/30">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Elektronische Kontaktaufnahme
              </span>
              <p className="text-foreground leading-relaxed pt-1">
                E-Mail:{' '}
                <a
                  href="mailto:jona.noack@outlook.de"
                  className="font-mono text-foreground underline underline-offset-2 hover:opacity-80"
                >
                  jona.noack@outlook.de
                </a>
              </p>
            </div>
          </div>

          {/* Responsible Person */}
          <div className="space-y-1 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border pt-4">
            <h2 className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>
              Jona Noack, Kiehnlestraße 25, 75172 Pforzheim
            </p>
          </div>

          {/* Project background */}
          <div className="space-y-1 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border pt-4">
            <h2 className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
              Projekt & Entwicklung
            </h2>
            <p>
              Dieses Softwareprojekt wurde von <strong>Jona Noack</strong> für das Umweltmentorenprogramm an Schulen in Baden-Württemberg entwickelt, um Schülerinnen und Schülern einen transparenten, fundierten und spielerischen Zugang zum Thema CO₂-Bilanzierung zu ermöglichen.
            </p>
          </div>

          {/* Disclaimers */}
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border pt-4">
            <div>
              <h3 className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Haftung für Inhalte
              </h3>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
              </p>
            </div>

            <div>
              <h3 className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Urheberrecht & Lizenz
              </h3>
              <p>
                Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem Urheberrecht von Jona Noack. Die Nutzung ist ausschließlich im Rahmen der nicht-kommerziellen Schullizenz gestattet.
              </p>
            </div>
          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
