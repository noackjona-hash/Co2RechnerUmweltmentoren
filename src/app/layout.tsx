import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
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
    <html lang="de" suppressHydrationWarning className={fontSans.variable}>
      <body className={`${fontSans.className} min-h-screen antialiased selection:bg-emerald-200 dark:selection:bg-emerald-800`}>
        <ThemeProvider>
          {children}
          <CookieBanner />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

