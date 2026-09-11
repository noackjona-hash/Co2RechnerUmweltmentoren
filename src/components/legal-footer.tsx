'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function LegalFooter() {
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleOpenCookies = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-cookie-banner'));
    }
  };

  return (
    <footer className="text-center py-6 px-4 text-xs text-muted-foreground mt-auto w-full border-t border-border/80 bg-background">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {year} CO₂-Rechner • Jona Noack & Umweltmentoren</p>
        <div className="flex flex-wrap justify-center gap-3 font-medium">
          <Link href="/impressum" className="hover:text-foreground transition-colors">
            Impressum
          </Link>
          <span className="text-border">•</span>
          <Link href="/datenschutz" className="hover:text-foreground transition-colors">
            Datenschutz
          </Link>
          <span className="text-border">•</span>
          <button
            onClick={handleOpenCookies}
            className="hover:text-foreground transition-colors cursor-pointer focus:outline-none"
          >
            Cookies
          </button>
        </div>
      </div>
    </footer>
  );
}
