'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, KeyRound, School, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

type Tab = 'student' | 'school' | 'admin';

export default function LoginPage() {
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
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const parts = [];
    for (let i = 0; i < clean.length && i < 16; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join('-');
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
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push(data.isCompleted ? '/results' : '/quiz');
    } catch { setError('Verbindungsfehler.'); setLoading(false); }
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
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/school');
    } catch { setError('Verbindungsfehler.'); setLoading(false); }
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
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/admin');
    } catch { setError('Verbindungsfehler.'); setLoading(false); }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'student', label: 'Schüler:in', icon: <KeyRound className="w-4 h-4" /> },
    { key: 'school', label: 'Schule', icon: <School className="w-4 h-4" /> },
    { key: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-400/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-teal-400/15 dark:bg-teal-400/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Zurück</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Anmelden</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wähle deinen Zugangstyp
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-strong rounded-2xl p-1.5 mb-4 flex gap-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? 'gradient-primary text-white shadow-lg shadow-emerald-500/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Forms */}
        <div className="glass-strong rounded-2xl p-6 shadow-2xl shadow-emerald-500/5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label htmlFor="student-access-key" className="block text-sm font-medium mb-2">
                  Zugangscode
                </label>
                <input
                  id="student-access-key"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(formatAccessKey(e.target.value))}
                  maxLength={9}
                  className="w-full px-4 py-3 text-lg font-mono tracking-widest text-center rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  autoComplete="off"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Den Code hast du von deiner Lehrkraft erhalten.
                </p>
              </div>
              <button
                type="submit"
                disabled={accessKey.length < 9 || loading}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 transition-all duration-300"
              >
                {loading ? 'Anmelden...' : 'Quiz starten'}
              </button>
            </form>
          )}

          {activeTab === 'school' && (
            <form onSubmit={handleSchoolLogin} className="space-y-4">
              <div>
                <label htmlFor="school-license-key" className="block text-sm font-medium mb-2">
                  Lizenzschlüssel
                </label>
                <input
                  id="school-license-key"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(formatLicenseKey(e.target.value))}
                  maxLength={19}
                  className="w-full px-4 py-3 font-mono tracking-wider text-center rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="school-password" className="block text-sm font-medium mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="school-password"
                    type={showPassword ? 'text' : 'password'}
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={!licenseKey || !schoolPassword || loading}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 transition-all duration-300"
              >
                {loading ? 'Anmelden...' : 'Schul-Dashboard öffnen'}
              </button>
            </form>
          )}

          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium mb-2">
                  E-Mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@co2rechner.de"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={!email || !adminPassword || loading}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 transition-all duration-300"
              >
                {loading ? 'Anmelden...' : 'Admin-Dashboard öffnen'}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500 dark:text-red-400 text-center animate-fade-in">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
