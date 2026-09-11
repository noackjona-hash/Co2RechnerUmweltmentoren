'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  KeyRound,
  School,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ParticleField } from '@/components/particle-field';
import Link from 'next/link';
import { LegalFooter } from '@/components/legal-footer';

type Tab = 'student' | 'school' | 'admin' | 'teacher';

export default function LoginClient() {
  const [activeTab, setActiveTab] = useState<Tab>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Student form
  const [accessKey, setAccessKey] = useState('');

  // School form
  const [licenseKey, setLicenseKey] = useState('');
  const [schoolPassword, setSchoolPassword] = useState('');

  // Admin form
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
      setError('Verbindungsfehler. Bitte versuche es erneut.');
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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'student', label: 'Schüler:in', icon: <KeyRound className="w-4 h-4" /> },
    { key: 'teacher', label: 'Lehrkraft', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'school', label: 'Schule', icon: <School className="w-4 h-4" /> },
    { key: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between relative pb-8">
      <ParticleField />

      {/* Top bar */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors btn-bounce"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zur Startseite</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main card */}
      <main className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        <div className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-border shadow-xl animate-scale-in">
          {/* Logo Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-3 text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Anmelden</h1>
            <p className="text-xs text-muted-foreground mt-1">Wähle deinen Zugangstyp aus:</p>
          </div>

          {/* Role tabs */}
          <div className="bg-muted/60 p-1 rounded-2xl mb-6 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setError('');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Forms */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label htmlFor="student-access-key" className="block text-xs font-bold text-foreground mb-1.5">
                  Zugangscode
                </label>
                <input
                  id="student-access-key"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(formatAccessKey(e.target.value))}
                  maxLength={9}
                  className="w-full px-4 py-3 text-lg font-mono tracking-widest text-center rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 text-foreground font-bold focus:outline-none transition-all"
                  autoComplete="off"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Diesen 8-stelligen Code hast du von deiner Lehrkraft erhalten.
                </p>
              </div>

              <button
                type="submit"
                disabled={accessKey.length < 9 || loading}
                className="w-full py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 transition-all btn-bounce cursor-pointer flex items-center justify-center"
              >
                {loading ? 'Anmelden...' : 'Quiz starten 🚀'}
              </button>
            </form>
          )}

          {(activeTab === 'school' || activeTab === 'teacher') && (
            <form onSubmit={handleSchoolLogin} className="space-y-4">
              <div>
                <label htmlFor="school-license-key" className="block text-xs font-bold text-foreground mb-1.5">
                  Lizenzschlüssel
                </label>
                <input
                  id="school-license-key"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(formatLicenseKey(e.target.value))}
                  maxLength={19}
                  className="w-full px-4 py-2.5 font-mono tracking-wider text-center text-sm rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 text-foreground font-bold focus:outline-none transition-all"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="school-password" className="block text-xs font-bold text-foreground mb-1.5">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="school-password"
                    type={showPassword ? 'text' : 'password'}
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 text-foreground text-sm font-semibold focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!licenseKey || !schoolPassword || loading}
                className="w-full py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 transition-all btn-bounce cursor-pointer flex items-center justify-center"
              >
                {loading ? 'Anmelden...' : 'Zum Schul-Dashboard'}
              </button>
            </form>
          )}

          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-bold text-foreground mb-1.5">
                  E-Mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 text-foreground text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-bold text-foreground mb-1.5">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 text-foreground text-sm font-semibold focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!email || !adminPassword || loading}
                className="w-full py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 transition-all btn-bounce cursor-pointer flex items-center justify-center"
              >
                {loading ? 'Anmelden...' : 'Zum Admin-Bereich'}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs font-medium animate-fade-in text-center">
              {error}
            </div>
          )}
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
