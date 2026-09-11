'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
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
    <div className="min-h-screen flex flex-col justify-between pb-8 selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Top bar */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border/80">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg paper-btn-secondary text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Startseite</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main card */}
      <main className="w-full max-w-sm mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="paper-card p-6 sm:p-7 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-foreground">Anmeldung</h1>
            <p className="text-xs text-muted-foreground">Wähle deinen Bereich:</p>
          </div>

          {/* Minimalist Tabs */}
          <div className="flex border-b border-border text-xs font-semibold">
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
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Forms */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="student-access-key"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Zugangscode
                </label>
                <input
                  id="student-access-key"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(formatAccessKey(e.target.value))}
                  maxLength={9}
                  className="w-full px-3 py-2.5 text-center font-mono font-bold text-xl rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:border-primary"
                  autoComplete="off"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Erhalten von deiner Lehrkraft.
                </span>
              </div>

              <button
                type="submit"
                disabled={accessKey.length < 9 || loading}
                className="w-full py-2.5 rounded-xl paper-btn-primary text-xs cursor-pointer disabled:opacity-40"
              >
                {loading ? 'Wird geprüft...' : 'Quiz starten'}
              </button>
            </form>
          )}

          {(activeTab === 'school' || activeTab === 'teacher') && (
            <form onSubmit={handleSchoolLogin} className="space-y-3">
              <div>
                <label
                  htmlFor="school-license-key"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Lizenzschlüssel
                </label>
                <input
                  id="school-license-key"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(formatLicenseKey(e.target.value))}
                  maxLength={19}
                  className="w-full px-3 py-2 text-xs font-mono text-center rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:border-primary"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="school-password"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="school-password"
                    type={showPassword ? 'text' : 'password'}
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:border-primary pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!licenseKey || !schoolPassword || loading}
                className="w-full py-2.5 rounded-xl paper-btn-primary text-xs cursor-pointer disabled:opacity-40 mt-1"
              >
                {loading ? 'Wird angemeldet...' : 'Zum Schul-Bereich'}
              </button>
            </form>
          )}

          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  E-Mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:border-primary pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!email || !adminPassword || loading}
                className="w-full py-2.5 rounded-xl paper-btn-primary text-xs cursor-pointer disabled:opacity-40 mt-1"
              >
                {loading ? 'Wird angemeldet...' : 'Zum Admin-Bereich'}
              </button>
            </form>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium text-center">
              {error}
            </div>
          )}
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
