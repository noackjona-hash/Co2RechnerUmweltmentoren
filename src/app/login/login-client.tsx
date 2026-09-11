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
      <header className="w-full border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="paper-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Zurück zur Startseite</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main card */}
      <main className="w-full max-w-md mx-auto px-4 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        <article className="paper-sheet p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Anmeldung & Zugang
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Wähle deinen Bereich für Schüler, Lehrkräfte, Schule oder Admin.
            </p>
          </div>

          {/* Minimal Tabs */}
          <div className="border-b border-border flex gap-4 text-xs font-medium justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setError('');
                }}
                className={`pb-2 transition-colors cursor-pointer border-b-2 -mb-px ${
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
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Schüler-Zugangscode
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(formatAccessKey(e.target.value))}
                  maxLength={9}
                  autoFocus
                  className="w-full px-3 py-2.5 text-center font-mono text-lg font-bold tracking-widest border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40 placeholder:tracking-normal"
                />
                <span className="text-[11px] text-muted-foreground block text-center">
                  Den 8-stelligen Code erhältst du von deiner Lehrkraft.
                </span>
              </div>

              <button
                type="submit"
                disabled={accessKey.length < 9 || loading}
                className="w-full py-2.5 paper-btn-primary text-xs"
              >
                {loading ? 'Code wird geprüft...' : 'Weiter zum Fragebogen →'}
              </button>

              <div className="pt-3 border-t border-border text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await fetch('/api/auth/guest-login', { method: 'POST' });
                      const data = await res.json();
                      if (res.ok) {
                        router.push('/quiz');
                      } else {
                        setError(data.error || 'Fehler beim Starten der Gast-Sitzung.');
                        setLoading(false);
                      }
                    } catch {
                      setError('Verbindungsfehler.');
                      setLoading(false);
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  Kein Code? Als Gast ohne Speicherung starten →
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Teacher */}
          {activeTab === 'teacher' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-md border border-border bg-muted/40 leading-relaxed text-muted-foreground space-y-2">
                <span className="font-semibold text-foreground block text-xs">
                  Informationen für Lehrkräfte
                </span>
                <p>
                  Als Lehrkraft kannst du die Klassen und Schülercodes deiner Schule über das <strong>Schulportal</strong> einsehen und verwalten.
                </p>
                <p>
                  Falls deine Schulleitung bereits eine Schullizenz aktiviert hat, melde dich einfach mit den Zugangsdaten der Schule an.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('school')}
                className="w-full py-2.5 paper-btn-primary text-xs"
              >
                Zum Schul-Login wechseln →
              </button>
            </div>
          )}

          {/* Tab 3: School */}
          {activeTab === 'school' && (
            <form onSubmit={handleSchoolLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Schullizenz-Schlüssel
                </label>
                <input
                  type="text"
                  placeholder="SCHULE-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(formatLicenseKey(e.target.value))}
                  autoFocus
                  className="w-full px-3 py-2 text-xs font-mono border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-foreground transition-colors uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Schulkennwort
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-foreground transition-colors pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                    title={showPassword ? 'Verbergen' : 'Anzeigen'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!licenseKey || !schoolPassword || loading}
                className="w-full py-2.5 paper-btn-primary text-xs"
              >
                {loading ? 'Wird geprüft...' : 'Schulportal öffnen →'}
              </button>
            </form>
          )}

          {/* Tab 4: Admin */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Admin-E-Mail
                </label>
                <input
                  type="email"
                  placeholder="admin@umweltmentoren.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Admin-Passwort
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!email || !adminPassword || loading}
                className="w-full py-2.5 paper-btn-primary text-xs"
              >
                {loading ? 'Wird geprüft...' : 'Admin-Bereich öffnen →'}
              </button>
            </form>
          )}

          {error && (
            <div className="p-3 rounded-md border border-destructive/20 bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
