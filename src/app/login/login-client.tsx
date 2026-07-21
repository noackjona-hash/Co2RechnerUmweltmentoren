'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, KeyRound, School, Shield, ArrowLeft, Eye, EyeOff, Target, Trophy, Award, Lock, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { TiltCard } from '@/components/tilt-card';
import { MagneticButton } from '@/components/magnetic-button';
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
    { key: 'teacher', label: 'Lehrkraft', icon: <School className="w-4 h-4" /> },
    { key: 'school', label: 'Schule', icon: <School className="w-4 h-4" /> },
    { key: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-between">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-400/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-teal-400/15 dark:bg-teal-400/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 bg-cyan-300/10 dark:bg-cyan-400/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md px-6 py-8 flex-1 flex flex-col justify-center">
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
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 animate-glow-pulse">
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
        <TiltCard className="rounded-2xl shadow-2xl shadow-emerald-500/5 animate-slide-up" intensity={3} scale={1.01}>
          <div className="glass-strong rounded-2xl p-6" style={{ animationDelay: '0.2s' }}>
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
                <MagneticButton
                  type="submit"
                  disabled={accessKey.length < 9 || loading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                  strength={6}
                >
                  {loading ? 'Anmelden...' : 'Quiz starten'}
                </MagneticButton>
              </form>
            )}

            {(activeTab === 'school' || activeTab === 'teacher') && (
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
                      aria-label="Passwort umschalten"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <MagneticButton
                  type="submit"
                  disabled={!licenseKey || !schoolPassword || loading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                  strength={6}
                >
                  {loading ? 'Anmelden...' : (activeTab === 'teacher' ? 'Lehrer-Dashboard öffnen' : 'Schul-Dashboard öffnen')}
                </MagneticButton>
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
                      aria-label="Passwort umschalten"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <MagneticButton
                  type="submit"
                  disabled={!email || !adminPassword || loading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                  strength={6}
                >
                  {loading ? 'Anmelden...' : 'Admin-Dashboard öffnen'}
                </MagneticButton>
              </form>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-500 dark:text-red-400 text-center animate-fade-in">
                {error}
              </p>
            )}
          </div>
        </TiltCard>

        {/* Feature Highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: <Target className="w-4 h-4" />, label: 'Analyse', desc: 'Dein CO₂-Profil', gradient: 'from-emerald-500 to-teal-500' },
            { icon: <Trophy className="w-4 h-4" />, label: 'Challenge', desc: 'Klassen-Wettbewerb', gradient: 'from-amber-500 to-orange-500' },
            { icon: <Award className="w-4 h-4" />, label: 'Urkunde', desc: 'Klima-Versprechen', gradient: 'from-purple-500 to-pink-500' },
          ].map((item) => (
            <TiltCard key={item.label} className="rounded-xl h-full" intensity={12} scale={1.05}>
              <div className="glass rounded-xl p-3 text-center h-full">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-2 text-white`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold block">{item.label}</span>
                <span className="text-[9px] text-muted-foreground block">{item.desc}</span>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-muted-foreground animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>SSL verschlüsselt</span>
          </div>
          <span className="text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>100% anonym</span>
          </div>
          <span className="text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>DSGVO-konform</span>
          </div>
        </div>
      </div>

      <LegalFooter />
    </div>
  );
}
