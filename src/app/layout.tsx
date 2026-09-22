import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { AnalyticsConsentWrapper } from '@/components/analytics-consent-wrapper';
import { Lora, JetBrains_Mono } from 'next/font/google';

const fontSerif = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata = {
  title: 'CO₂ Rechner – Dein ökologischer Fußabdruck 🌱',
  description:
    'Finde spielerisch heraus, wie viel CO₂ du im Alltag verbrauchst. Ein kinder- und jugendgerechter Rechner der Umweltmentoren.',
  keywords: ['CO2 Rechner', 'Schule', 'Kinder', 'Jugendliche', 'Umweltmentoren', 'Klimaschutz', 'Ökologischer Fußabdruck'],
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
    <html lang="de" suppressHydrationWarning className={`${fontSerif.variable} ${fontMono.variable}`}>
      <body className="min-h-screen antialiased selection:bg-stone-200 dark:selection:bg-stone-800">
        <ThemeProvider>
          {children}
          <CookieBanner />
          <AnalyticsConsentWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}

