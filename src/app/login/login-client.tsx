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
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
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

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherEmail, password: teacherPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Anmelden als Lehrkraft.');
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
      <main className="w-full max-w-md mx-auto px-3 sm:px-4 py-8 sm:py-16 flex-1 flex flex-col justify-center">
        <article className="paper-sheet p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Anmeldung & Zugang
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Wähle deinen Bereich für Schüler, Lehrkräfte, Schule oder Admin.
            </p>
          </div>

          {/* Mobile-First Segmented Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/60 rounded-xl border border-border text-xs font-medium text-center">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setError('');
                }}
                className={`py-2 px-2 rounded-lg transition-all cursor-pointer truncate ${
                  activeTab === tab.key
                    ? 'bg-background text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
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
                  className="w-full h-12 sm:h-14 px-3 text-center font-mono text-lg min-[360px]:text-xl sm:text-2xl font-bold tracking-wider sm:tracking-widest border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/30 placeholder:tracking-normal"
                />
                <span className="text-[11px] text-muted-foreground block text-center">
                  Den 8-stelligen Code erhältst du von deiner Lehrkraft.
                </span>
              </div>

              <button
                type="submit"
                disabled={accessKey.length < 9 || loading}
                className="w-full paper-btn-primary text-xs sm:text-sm font-semibold"
              >
                {loading ? 'Code wird geprüft...' : 'Weiter zum Fragebogen →'}
              </button>

              <div className="pt-3 border-t border-border">
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
                  className="w-full paper-btn-secondary text-xs sm:text-sm font-medium"
                >
                  Ohne Code: Als Gast starten →
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Teacher */}
          {activeTab === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">
                  E-Mail-Adresse der Lehrkraft
                </label>
                <input
                  type="email"
                  placeholder="lehrkraft@schule.de"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="paper-input text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-foreground">
                    Passwort
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer font-mono"
                  >
                    {showPassword ? 'Verbergen' : 'Anzeigen'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="paper-input text-xs font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 paper-btn-primary text-xs"
              >
                {loading ? 'Wird angemeldet...' : 'Als Lehrkraft anmelden →'}
              </button>

              <div className="p-3.5 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                <span className="font-semibold text-foreground block text-xs">
                  Zugang für Lehrkräfte:
                </span>
                <p>
                  Das Passwort für deine Klasse wird von deiner Schulleitung im Schulportal unter der Klassenverwaltung eingerichtet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('school')}
                  className="text-foreground underline underline-offset-2 hover:opacity-80 block pt-1 cursor-pointer font-medium"
                >
                  Zur Schullizenz-Anmeldung wechseln →
                </button>
              </div>
            </form>
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
