'use client';

import Link from 'next/link';

export function LegalFooter() {
  const handleOpenCookies = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-cookie-banner'));
    }
  };

  return (
    <footer className="relative z-10 text-center py-8 px-4 text-xs text-muted-foreground mt-auto w-full border-t border-border/20 bg-background/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} CO₂ Rechner – Ein Projekt der Umweltmentoren</p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 font-medium">
          <Link href="/impressum" className="hover:text-foreground transition-colors">
            Impressum
          </Link>
          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <Link href="/datenschutz" className="hover:text-foreground transition-colors">
            Datenschutzerklärung
          </Link>
          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <button
            onClick={handleOpenCookies}
            className="hover:text-foreground transition-colors cursor-pointer text-left focus:outline-none"
          >
            Cookie-Einstellungen
          </button>
        </div>
      </div>
    </footer>
  );
}
