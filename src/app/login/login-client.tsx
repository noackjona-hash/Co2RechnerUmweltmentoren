'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { LegalFooter } from '@/components/legal-footer';

type Tab = 'student' | 'school' | 'admin' | 'teacher';

export default function LoginClient() {
  const [activeTab, setActiveTab] = useState<Tab>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [accessKey, setAccessKey] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [schoolPassword, setSchoolPassword] = useState('');
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const formatAccessKey = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 4) return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    return clean;
  };

  const formatLicenseKey = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Anmelden.');
        setLoading(false);
        return;
      }
      router.push(data.isCompleted ? '/results' : '/quiz');
    } catch {
      setError('Verbindungsfehler.');
      setLoading(false);
    }
  };

  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/school-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, password: schoolPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Anmelden.');
        setLoading(false);
        return;
      }
      router.push('/school');
    } catch {
      setError('Verbindungsfehler.');
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Anmelden.');
        setLoading(false);
        return;
      }
      router.push('/admin');
    } catch {
      setError('Verbindungsfehler.');
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'student', label: 'Schüler:in' },
    { key: 'teacher', label: 'Lehrkraft' },
    { key: 'school', label: 'Schule' },
    { key: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between pb-8 bg-background">
      {/* Top bar */}
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
          <Link
            href="/"
            className="paper-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Zurück zur Startseite</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main card */}
      <main className="w-full max-w-sm mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <article className="paper-sheet p-6 sm:p-8 space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Zugangskontrolle</span>
            <span>UM-AUTH</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-normal text-foreground">
              Anmeldung
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Wähle deinen Zuständigkeitsbereich:
            </p>
          </div>

          {/* Minimalist Paper Tabs */}
          <div className="flex border-b border-border text-xs font-mono uppercase tracking-wider">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setError('');
                }}
                className={`flex-1 pb-2 text-center border-b-2 -mb-px transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-foreground text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Student */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Zugangscode
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(formatAccessKey(e.target.value))}
                  maxLength={9}
                  className="w-full px-3 py-2 text-center font-mono text-lg font-semibold tracking-wider border border-border rounded-sm bg-muted/30 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={accessKey.length < 9 || loading}
                className="w-full py-2.5 paper-btn-primary"
              >
                {loading ? 'Prüfe...' : 'Weiter zum Fragebogen'}
              </button>
            </form>
          )}

          {/* Tab 2: Teacher */}
          {activeTab === 'teacher' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-3.5 border border-border bg-muted/30 leading-relaxed text-muted-foreground">
                <strong className="text-foreground block mb-1 font-mono uppercase text-[11px]">
                  Hinweis für Lehrkräfte:
                </strong>
                Die Verwaltung von Schulklassen und Schülercodes erfolgt über den zentralen Schullizenz-Zugang. Melde dich bitte über den Tab <strong>Schule</strong> mit dem Schullizenz-Schlüssel und Schulkennwort an.
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('school')}
                className="w-full py-2.5 paper-btn-secondary font-mono text-xs"
              >
                Zum Schul-Login wechseln →
              </button>
            </div>
          )}

          {/* Tab 3: School */}
          {activeTab === 'school' && (
            <form onSubmit={handleSchoolLogin} className="space-y-4 font-sans">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Schullizenz-Schlüssel
                </label>
                <input
                  type="text"
                  placeholder="SCHULE-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(formatLicenseKey(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-xs border border-border rounded-sm bg-muted/30 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-border rounded-sm bg-muted/30 text-foreground focus:outline-none focus:border-foreground pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!licenseKey || !schoolPassword || loading}
                className="w-full py-2.5 paper-btn-primary"
              >
                {loading ? 'Prüfe...' : 'Schulportal öffnen'}
              </button>
            </form>
          )}

          {/* Tab 4: Admin */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 font-sans">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Admin-E-Mail
                </label>
                <input
                  type="email"
                  placeholder="admin@umweltmentoren.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border rounded-sm bg-muted/30 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Admin-Passwort
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border rounded-sm bg-muted/30 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={!email || !adminPassword || loading}
                className="w-full py-2.5 paper-btn-primary"
              >
                {loading ? 'Prüfe...' : 'Admin-Bereich öffnen'}
              </button>
            </form>
          )}

          {error && (
            <div className="p-3 border border-destructive/30 bg-destructive/5 text-destructive text-xs font-mono">
              {error}
            </div>
          )}
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
