import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { CookieBanner } from '@/components/cookie-banner';

export const metadata: Metadata = {
  title: 'CO₂ Rechner – Dein ökologischer Fußabdruck',
  description:
    'Berechne deinen persönlichen CO₂-Fußabdruck. Ein Projekt für Umweltmentoren an Schulen in Deutschland.',
  keywords: ['CO2', 'Fußabdruck', 'Rechner', 'Schule', 'Umwelt', 'Klima'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}

