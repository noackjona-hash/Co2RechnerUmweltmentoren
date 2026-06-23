'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, Mail, MapPin, ShieldAlert } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

export default function ImpressumClient() {
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Impressum</h1>
            <p className="text-sm text-muted-foreground">
              Verantwortlich für das Web-Angebot nach § 5 TMG / § 18 MStV.
            </p>
          </div>

          <hr className="border-border/50" />

          {/* Project Details */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Herausgeber & Anschrift
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block">Projekt CO₂ Rechner an Schulen</span>
                Umweltmentoren-Initiative Baden-Württemberg<br />
                Musterstraße 42<br />
                70173 Stuttgart<br />
                Deutschland
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                Kontakt
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                E-Mail:{' '}
                <a href="mailto:info@umweltmentoren.de" className="text-emerald-500 hover:underline">
                  info@umweltmentoren.de
                </a>
                <br />
                Telefon: +49 (0) 711 123456-78<br />
                Web: www.umweltmentoren.de
              </p>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Reps */}
          <div className="space-y-4">
            <h3 className="font-bold text-base">Vertretungsberechtigte Personen</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dieses Softwareprojekt wird betreut von der Arbeitsgemeinschaft der Umweltmentoren an baden-württembergischen Schulen. Projektleiter und inhaltlich Verantwortlicher gemäß § 18 Abs. 2 MStV: Dr. Paul Schmidt (Anschrift wie oben).
            </p>
          </div>

          <hr className="border-border/50" />

          {/* Disclaimers */}
          <div className="space-y-6">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Rechtliche Hinweise
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Haftung für Inhalte</h4>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Haftung für Links</h4>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Urheberrecht</h4>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
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
