import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CO₂ Rechner – Dein ökologischer Fußabdruck',
  description:
    'Berechne deinen persönlichen CO₂-Fußabdruck. Ein Projekt für Umweltmentoren an Schulen in Deutschland.',
  keywords: ['CO2', 'Fußabdruck', 'Rechner', 'Schule', 'Umwelt', 'Klima'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          {children}
          <CookieBanner />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

