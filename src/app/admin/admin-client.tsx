'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  LogOut,
  Plus,
  School,
  Key,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  Users,
  Shield,
  BarChart3,
  HelpCircle,
  UserPlus,
  Edit2,
  Lock,
  Unlock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Cpu,
  HardDrive,
  Server,
  Activity,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

// Recharts components
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface License {
  id: string;
  schoolName: string;
  contactEmail: string;
  licenseKey: string;
  isActive: boolean;
  createdAt: string;
  classes: {
    id: string;
    className: string;
    _count: { students: number };
  }[];
}

interface AdminUser {
  id: string;
  email: string;
  role: 'super-admin' | 'editor' | 'viewer';
  createdAt: string;
}

interface QuizQuestion {
  id: string;
  category: string;
  questionText: string;
  questionType: string;
  unit: string | null;
  co2Factor: number;
  minValue: number | null;
  maxValue: number | null;
  step: number | null;
  defaultValue: number | null;
  helpText: string | null;
  orderIndex: number;
  tier: number;
}

interface StatsSummary {
  totalStudents: number;
  totalCompleted: number;
  completionRate: number;
  totalSchools: number;
  totalClasses: number;
  totalCo2: number;
  avgCo2PerStudent: number;
}

interface CategoryStat {
  category: string;
  totalCo2: number;
  avgCo2: number;
}

interface CompletionHistory {
  date: string;
  completions: number;
}

interface TransportDistribution {
  label: string;
  count: number;
}

interface StatsData {
  summary: StatsSummary;
  categoryStats: CategoryStat[];
  completionHistory: CompletionHistory[];
  transportDistribution: TransportDistribution[];
}

type Tab = 'stats' | 'schools' | 'questions' | 'admins' | 'system';

const CATEGORY_COLORS: Record<string, string> = {
  mobility: '#10b981', // emerald
  food: '#f59e0b', // amber
  heating: '#ef4444', // red
  electricity: '#3b82f6', // blue
  consumption: '#8b5cf6', // purple
};

const CATEGORY_LABELS: Record<string, string> = {
  mobility: 'Mobilität',
  food: 'Ernährung',
  heating: 'Heizung',
  electricity: 'Strom',
  consumption: 'Konsum',
};

export default function AdminClient() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // System state
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loadingSystem, setLoadingSystem] = useState(false);

  // New question form state
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    category: 'mobility',
    questionText: '',
    questionType: 'slider',
    co2Factor: 0,
    unit: '',
    helpText: '',
    orderIndex: 10,
    tier: 3,
    minValue: 0,
    maxValue: 100,
    step: 1,
    defaultValue: 0,
  });

  // Licenses state
  const [licenses, setLicenses] = useState<License[]>([]);
  const [showCreateLicense, setShowCreateLicense] = useState(false);
  const [licenseFormData, setLicenseFormData] = useState({
    schoolName: '',
    contactEmail: '',
    password: '',
  });
  const [creatingLicense, setCreatingLicense] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Admins state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    email: '',
    password: '',
    role: 'editor' as 'super-admin' | 'editor' | 'viewer',
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [updatingQuestion, setUpdatingQuestion] = useState(false);

  // Stats state
  const [stats, setStats] = useState<StatsData | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cleanup state
  const [cleanupInput, setCleanupInput] = useState('');
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const router = useRouter();

  // Load Session and Dashboard data
  useEffect(() => {
    async function initDashboard() {
      try {
        const sessionRes = await fetch('/api/auth/me');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await sessionRes.json();
        setSession(sessionData);

        // Fetch Tab data
        await fetchStats();
        await fetchLicenses();
        await fetchQuestions();
        if (sessionData.adminRole === 'super-admin') {
          await fetchAdmins();
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, [router]);

  // Fetch functions
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Fetch stats failed', err);
    }
  };

  const fetchLicenses = async () => {
    try {
      const res = await fetch('/api/admin/licenses');
      if (res.ok) {
        const data = await res.json();
        setLicenses(data);
      }
    } catch (err) {
      console.error('Fetch licenses failed', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Fetch questions failed', err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error('Fetch admins failed', err);
    }
  };

  // Auth Operations
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  // License Operations (Super Admin Only)
  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingLicense(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(licenseFormData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Erstellen der Lizenz.');
      } else {
        setSuccess(`Lizenz für "${licenseFormData.schoolName}" erfolgreich erstellt.`);
        setShowCreateLicense(false);
        setLicenseFormData({ schoolName: '', contactEmail: '', password: '' });
        await fetchLicenses();
        await fetchStats();
      }
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setCreatingLicense(false);
    }
  };

  const toggleLicense = async (id: string, isActive: boolean) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        await fetchLicenses();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Ändern des Status.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

  const deleteLicense = async (id: string) => {
    if (!confirm('Lizenz und alle zugehörigen Klassen und Schüler-Daten unwiderruflich löschen?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Lizenz erfolgreich gelöscht.');
        await fetchLicenses();
        await fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Admin User Operations (Super Admin Only)
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Erstellen des Admins.');
      } else {
        setSuccess(`Admin "${adminFormData.email}" erfolgreich erstellt.`);
        setShowCreateAdmin(false);
        setAdminFormData({ email: '', password: '', role: 'editor' });
        await fetchAdmins();
      }
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm('Admin wirklich löschen?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Admin erfolgreich gelöscht.');
        await fetchAdmins();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen des Admins.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

  // Question Operations (Super Admin & Editor)
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setUpdatingQuestion(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuestion),
      });
      if (res.ok) {
        setSuccess('Frage erfolgreich aktualisiert.');
        setEditingQuestion(null);
        await fetchQuestions();
        await fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Speichern der Frage.');
      }
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setUpdatingQuestion(false);
    }
  };

  const handleCleanup = async () => {
    if (cleanupInput !== 'CLEANUP') {
      setError('Bitte geben Sie das Bestätigungswort korrekt ein.');
      return;
    }
    setCleaning(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/stats/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: cleanupInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setCleanupInput('');
        setShowCleanupModal(false);
        await fetchStats();
      } else {
        setError(data.error || 'Fehler beim Zurücksetzen.');
      }
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setCleaning(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      setLoadingSystem(true);
      const res = await fetch('/api/admin/system');
      if (res.ok) {
        const data = await res.json();
        setSystemStats(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSystem(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'system' && session?.adminRole === 'super-admin') {
      fetchSystemStats();
    }
  }, [activeTab, session]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionFormData),
      });
      if (res.ok) {
        setSuccess('Frage erfolgreich erstellt.');
        setShowCreateQuestion(false);
        setQuestionFormData({
          category: 'mobility',
          questionText: '',
          questionType: 'slider',
          co2Factor: 0,
          unit: '',
          helpText: '',
          orderIndex: 10,
          tier: 3,
          minValue: 0,
          maxValue: 100,
          step: 1,
          defaultValue: 0,
        });
        await fetchQuestions();
        await fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Erstellen.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Frage und alle zugehörigen Antworten wirklich löschen?')) return;
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess('Frage erfolgreich gelöscht.');
        await fetchQuestions();
        await fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-glow-pulse">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    'super-admin': 'Super Admin',
    editor: 'Editor (Fragen)',
    viewer: 'Viewer (Read-Only)',
  };

  const isSuperAdmin = session?.adminRole === 'super-admin';
  const isEditor = session?.adminRole === 'editor';
  const isViewer = session?.adminRole === 'viewer';
  const canModify = isSuperAdmin || isEditor;

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />

      {/* Nav Header */}
      <nav className="sticky top-0 z-20 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base block tracking-tight">Umweltmentoren</span>
              <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider -mt-1">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden md:flex flex-col items-end border-r border-border/60 pr-3">
                <span className="text-xs font-semibold">{session.email}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {roleLabels[session.adminRole] || session.adminRole}
                </span>
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
              title="Abmelden"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Banner Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 animate-scale-in text-sm font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-scale-in text-sm font-medium">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-border/60 gap-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => { setActiveTab('stats'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'stats'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Statistiken
          </button>
          <button
            onClick={() => { setActiveTab('schools'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'schools'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <School className="w-4 h-4" />
            Schulen & Lizenzen
          </button>
          <button
            onClick={() => { setActiveTab('questions'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'questions'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Quiz-Fragen
          </button>
          {isSuperAdmin && (
            <>
              <button
                onClick={() => { setActiveTab('admins'); setError(''); setSuccess(''); }}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
                  activeTab === 'admins'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                Admins verwalten
              </button>
              <button
                onClick={() => { setActiveTab('system'); setError(''); setSuccess(''); }}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
                  activeTab === 'system'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Server className="w-4 h-4" />
                System-Status
              </button>
            </>
          )}
        </div>

        {/* -------------------- STATS TAB -------------------- */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6 animate-slide-up">
            {/* Action Row */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-lg font-bold">Systemstatistiken</h2>
              <div className="flex items-center gap-3">
                <a
                  href="/api/admin/stats/export"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  Daten exportieren (CSV)
                </a>
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCleanupModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-all hover:scale-[1.02]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Datenbank zurücksetzen
                  </button>
                )}
              </div>
            </div>

            {/* Cleanup Modal */}
            {showCleanupModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="glass-strong rounded-3xl p-6 max-w-md w-full border border-destructive/20 shadow-2xl animate-scale-in">
                  <div className="flex items-center gap-3 text-destructive mb-4">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                    <h3 className="font-extrabold text-lg">Datenbank zurücksetzen?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Diese Aktion löscht alle Schüler-Accounts und deren eingegebenen CO₂-Ergebnisse unwiderruflich. 
                    Schulen, Klassen, Quiz-Fragen und Admins bleiben erhalten.
                  </p>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-4">
                    <p className="text-xs font-semibold text-destructive mb-2">
                      Um fortzufahren, tippen Sie bitte das Wort <code className="bg-destructive/20 px-1.5 py-0.5 rounded font-mono font-bold">CLEANUP</code> ein:
                    </p>
                    <input
                      type="text"
                      value={cleanupInput}
                      onChange={(e) => setCleanupInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-destructive/30 focus:border-destructive focus:ring-2 focus:ring-destructive/20 transition-all text-sm font-mono tracking-widest text-center"
                      placeholder="CLEANUP"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setShowCleanupModal(false); setCleanupInput(''); }}
                      className="px-4 py-2 rounded-xl hover:bg-muted text-sm font-semibold transition-all"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleCleanup}
                      disabled={cleanupInput !== 'CLEANUP' || cleaning}
                      className="px-5 py-2 rounded-xl bg-destructive text-white text-sm font-semibold disabled:opacity-50 transition-all hover:bg-destructive/90 shadow-lg shadow-destructive/25 flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${cleaning ? 'animate-spin' : ''}`} />
                      {cleaning ? 'Wird gelöscht...' : 'Ja, unwiderruflich löschen'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-strong rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Teilnahmen Gesamt
                </div>
                <div className="text-3xl font-extrabold gradient-text mt-1">{stats.summary.totalStudents}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {stats.summary.totalCompleted}
                  </span>{' '}
                  beendet ({stats.summary.completionRate}%)
                </div>
              </div>

              <div className="glass-strong rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Registrierte Schulen
                </div>
                <div className="text-3xl font-extrabold gradient-text mt-1">{stats.summary.totalSchools}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  In insgesamt <span className="font-semibold">{stats.summary.totalClasses}</span> Klassen
                </div>
              </div>

              <div className="glass-strong rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  CO₂ Ausstoß Gesamt
                </div>
                <div className="text-3xl font-extrabold gradient-text mt-1">
                  {(stats.summary.totalCo2 / 1000).toFixed(1)} t
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Gesamtberechneter Ausstoß aller Teilnehmer
                </div>
              </div>

              <div className="glass-strong rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Schnitt pro Schüler:in
                </div>
                <div className="text-3xl font-extrabold gradient-text mt-1">
                  {stats.summary.avgCo2PerStudent} t
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Durchschnittlicher CO₂-Fußabdruck / Jahr
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Pie Chart */}
              <div className="glass-strong rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
                <h3 className="text-sm font-bold tracking-tight mb-4">Verteilung nach Kategorien (Schnitt pro Kopf)</h3>
                <div className="flex-1 min-h-[220px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryStats}
                        dataKey="avgCo2"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ category, avgCo2 }: any) =>
                          avgCo2 > 0 ? `${CATEGORY_LABELS[category] || category}: ${avgCo2}t` : ''
                        }
                      >
                        {stats.categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#9ca3af'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} t CO₂/Jahr`, 'Durchschnitt']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transport Bar Chart */}
              <div className="glass-strong rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
                <h3 className="text-sm font-bold tracking-tight mb-4">Schulweg-Transportmittel</h3>
                {stats.transportDistribution.length > 0 ? (
                  <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.transportDistribution} margin={{ bottom: 15 }}>
                        <XAxis dataKey="label" angle={-15} textAnchor="end" interval={0} fontSize={10} />
                        <YAxis allowDecimals={false} fontSize={10} />
                        <Tooltip formatter={(value) => [`${value} Schüler`, 'Anzahl']} />
                        <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
                    Keine Daten vorhanden.
                  </div>
                )}
              </div>

              {/* History completions */}
              <div className="glass-strong rounded-2xl p-6 md:col-span-2 min-h-[300px] flex flex-col">
                <h3 className="text-sm font-bold tracking-tight mb-4">Quiz-Abschlüsse der letzten 7 Tage</h3>
                <div className="flex-1 min-h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.completionHistory}>
                      <defs>
                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis allowDecimals={false} fontSize={10} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="completions"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorCompletions)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- LICENSES TAB -------------------- */}
        {activeTab === 'schools' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Verwaltete Schullizenzen</h2>
              {isSuperAdmin && (
                <button
                  onClick={() => setShowCreateLicense(!showCreateLicense)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Schule anlegen
                </button>
              )}
            </div>

            {/* Create school form */}
            {showCreateLicense && isSuperAdmin && (
              <div className="glass-strong rounded-2xl p-6 animate-scale-in border border-border/60">
                <h3 className="text-sm font-bold mb-4">Neue Schule registrieren</h3>
                <form onSubmit={handleCreateLicense} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Schulname</label>
                    <input
                      type="text"
                      value={licenseFormData.schoolName}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, schoolName: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      placeholder="z. B. Max-Planck-Gymnasium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Kontakt-E-Mail</label>
                    <input
                      type="email"
                      value={licenseFormData.contactEmail}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, contactEmail: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      placeholder="admin@mpg-schule.de"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Passwort</label>
                    <input
                      type="text"
                      value={licenseFormData.password}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      placeholder="Zukünftiges Schul-Passwort"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateLicense(false)}
                      className="px-4 py-2 rounded-xl hover:bg-muted text-sm font-semibold transition-all"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={creatingLicense}
                      className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    >
                      {creatingLicense ? 'Wird erstellt...' : 'Lizenz erstellen'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* School Licenses List */}
            <div className="grid md:grid-cols-2 gap-4">
              {licenses.map((lic) => (
                <div key={lic.id} className="glass-strong rounded-2xl p-5 border border-border/40 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{lic.schoolName}</h4>
                      <span className="text-[10px] text-muted-foreground">{lic.contactEmail}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                        lic.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {lic.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>

                  <div className="bg-muted/30 border border-border/40 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-semibold uppercase">
                        Lizenzschlüssel
                      </span>
                      <code className="text-xs font-mono font-bold">{lic.licenseKey}</code>
                    </div>
                    <button
                      onClick={() => copyKey(lic.licenseKey)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                      title="Kopieren"
                    >
                      {copiedKey === lic.licenseKey ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
                    <span>
                      Klassen:{' '}
                      <span className="font-bold text-foreground">{lic.classes.length}</span> (
                      {lic.classes.reduce((sum, c) => sum + c._count.students, 0)} Schüler)
                    </span>

                    {isSuperAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleLicense(lic.id, lic.isActive)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          title={lic.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          {lic.isActive ? (
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteLicense(lic.id)}
                          className="p-1.5 rounded-lg hover:bg-muted text-destructive hover:bg-destructive/10 transition-all"
                          title="Löschen"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {licenses.length === 0 && (
                <div className="col-span-2 glass-strong rounded-2xl p-8 text-center text-muted-foreground text-sm">
                  Keine registrierten Schullizenzen gefunden.
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- QUESTIONS TAB -------------------- */}
        {activeTab === 'questions' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Quiz-Fragen konfigurieren</h2>
              {canModify && (
                <button
                  onClick={() => setShowCreateQuestion(!showCreateQuestion)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Frage hinzufügen
                </button>
              )}
            </div>

            {/* Create Question form */}
            {showCreateQuestion && canModify && (
              <div className="glass-strong rounded-2xl p-6 border border-border/60 animate-scale-in">
                <h3 className="text-sm font-bold mb-4">Neue Frage erstellen</h3>
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Kategorie</label>
                      <select
                        value={questionFormData.category}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm text-foreground"
                      >
                        <option value="mobility">Mobilität</option>
                        <option value="food">Ernährung</option>
                        <option value="heating">Heizung</option>
                        <option value="electricity">Strom</option>
                        <option value="consumption">Konsum</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Typ</label>
                      <select
                        value={questionFormData.questionType}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, questionType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm text-foreground"
                      >
                        <option value="slider">Slider (Schieberegler)</option>
                        <option value="number">Zahleneingabe</option>
                        <option value="radio">Radio Buttons (Ja/Nein)</option>
                        <option value="select">Dropdown-Auswahl</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">CO₂-Faktor (kg/Einheit)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={questionFormData.co2Factor}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, co2Factor: Number(e.target.value) })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Fragetext</label>
                      <input
                        type="text"
                        value={questionFormData.questionText}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                        placeholder="Wie viele Kilometer fährst du pro Tag?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Hilfetext</label>
                      <input
                        type="text"
                        value={questionFormData.helpText}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, helpText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                        placeholder="Zusatzinfo für Schüler..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Einheit (optional)</label>
                      <input
                        type="text"
                        value={questionFormData.unit}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, unit: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                        placeholder="km, kWh etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Sortierung (Order Index)</label>
                      <input
                        type="number"
                        value={questionFormData.orderIndex}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, orderIndex: Number(e.target.value) })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Tier (1 = Kurz, 3 = Lang)</label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        value={questionFormData.tier}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, tier: Number(e.target.value) })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Standardwert</label>
                      <input
                        type="number"
                        value={questionFormData.defaultValue}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, defaultValue: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateQuestion(false)}
                      className="px-4 py-2 rounded-xl hover:bg-muted text-sm font-semibold transition-all"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold transition-all"
                    >
                      Frage erstellen
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Editing modal/form */}
            {editingQuestion && canModify && (
              <div className="glass-strong rounded-2xl p-6 border border-border/60 animate-scale-in">
                <h3 className="text-sm font-bold mb-4">Frage bearbeiten</h3>
                <form onSubmit={handleUpdateQuestion} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Fragetext</label>
                      <input
                        type="text"
                        value={editingQuestion.questionText}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">CO₂-Faktor</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editingQuestion.co2Factor}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, co2Factor: Number(e.target.value) })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Einheit (optional)</label>
                      <input
                        type="text"
                        value={editingQuestion.unit || ''}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, unit: e.target.value || null })}
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                        placeholder="z. B. km, kWh, kg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Hilfetext</label>
                      <input
                        type="text"
                        value={editingQuestion.helpText || ''}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, helpText: e.target.value || null })}
                        className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 rounded-xl hover:bg-muted text-sm font-semibold transition-all"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={updatingQuestion}
                      className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    >
                      {updatingQuestion ? 'Wird gespeichert...' : 'Änderungen speichern'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List Table */}
            <div className="glass-strong rounded-2xl border border-border/40 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60">
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground">Kategorie</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground w-1/3">Frage</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground">Typ</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground">Faktor</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground">Einheit</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[q.category]}15`,
                              color: CATEGORY_COLORS[q.category],
                            }}
                          >
                            {CATEGORY_LABELS[q.category] || q.category}
                          </span>
                        </td>
                        <td className="p-4 font-medium">{q.questionText}</td>
                        <td className="p-4 font-mono text-[10px] text-muted-foreground uppercase">{q.questionType}</td>
                        <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {q.co2Factor}
                        </td>
                        <td className="p-4 text-muted-foreground">{q.unit || '-'}</td>
                        <td className="p-4 text-right flex items-center justify-end gap-1">
                          {canModify ? (
                            <>
                              <button
                                onClick={() => setEditingQuestion(q)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteQuestion(q.id)}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                                title="Löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                              Read-Only
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- ADMINS TAB -------------------- */}
        {activeTab === 'admins' && isSuperAdmin && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Admin-Konten verwalten</h2>
              <button
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-4.5 h-4.5" />
                Admin anlegen
              </button>
            </div>

            {/* Create Admin Form */}
            {showCreateAdmin && (
              <div className="glass-strong rounded-2xl p-6 border border-border/60 animate-scale-in">
                <h3 className="text-sm font-bold mb-4">Neues Admin-Konto erstellen</h3>
                <form onSubmit={handleCreateAdmin} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">E-Mail</label>
                    <input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      placeholder="admin@co2rechner.de"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Rolle</label>
                    <select
                      value={adminFormData.role}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          role: e.target.value as 'super-admin' | 'editor' | 'viewer',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm text-foreground"
                    >
                      <option value="super-admin">Super Admin (Vollzugriff)</option>
                      <option value="editor">Editor (Fragen verwalten)</option>
                      <option value="viewer">Viewer (Statistiken lesen)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Passwort</label>
                    <input
                      type="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                      placeholder="Sicheres Passwort"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateAdmin(false)}
                      className="px-4 py-2 rounded-xl hover:bg-muted text-sm font-semibold transition-all"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={creatingAdmin}
                      className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    >
                      {creatingAdmin ? 'Wird erstellt...' : 'Konto erstellen'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admins List Table */}
            <div className="glass-strong rounded-2xl border border-border/40 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60">
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground">Admin E-Mail</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground">Rolle</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground">Erstellt am</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {admins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-semibold">{adm.email}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              adm.role === 'super-admin'
                                ? 'bg-red-500/10 text-red-500'
                                : adm.role === 'editor'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            {roleLabels[adm.role] || adm.role}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(adm.createdAt).toLocaleDateString('de-DE')}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteAdmin(adm.id)}
                            disabled={adm.id === session.id}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive disabled:opacity-30 transition-all"
                            title={adm.id === session.id ? 'Sie können sich nicht selbst löschen' : 'Löschen'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- SYSTEM STATUS TAB -------------------- */}
        {activeTab === 'system' && isSuperAdmin && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Server System-Status</h2>
              <button
                onClick={fetchSystemStats}
                disabled={loadingSystem}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/70 hover:bg-muted text-xs font-semibold disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loadingSystem ? 'animate-spin' : ''}`} />
                Aktualisieren
              </button>
            </div>

            {systemStats ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* CPU Card */}
                <div className="glass-strong rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <Cpu className="w-6 h-6" />
                    <h3 className="font-bold text-sm">Prozessor (CPU)</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground font-semibold">Modell:</span>
                      <p className="font-mono mt-0.5 font-bold truncate" title={systemStats.cpu.model}>
                        {systemStats.cpu.model}
                      </p>
                    </div>
                    <div className="flex justify-between border-b border-border/40 py-1.5">
                      <span className="text-muted-foreground">Kerne:</span>
                      <span className="font-bold font-mono">{systemStats.cpu.cores} Cores</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 py-1.5">
                      <span className="text-muted-foreground">Systemlast (1m/5m/15m):</span>
                      <span className="font-bold font-mono">
                        {systemStats.cpu.load1m} / {systemStats.cpu.load5m} / {systemStats.cpu.load15m}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RAM Card */}
                <div className="glass-strong rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-blue-500">
                    <Activity className="w-6 h-6" />
                    <h3 className="font-bold text-sm">Arbeitsspeicher (RAM)</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Auslastung:</span>
                        <span className="font-bold font-mono">{systemStats.ram.percent}</span>
                      </div>
                      <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden border border-border/30">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: systemStats.ram.percent }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Belegt:</span>
                        <span className="font-bold font-mono">{systemStats.ram.used}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1.5">
                        <span className="text-muted-foreground">Gesamt:</span>
                        <span className="font-bold font-mono">{systemStats.ram.total}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1.5">
                        <span className="text-muted-foreground">Frei:</span>
                        <span className="font-bold font-mono">{systemStats.ram.free}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disk & Platform */}
                <div className="glass-strong rounded-2xl p-6 space-y-4 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 text-purple-500">
                    <HardDrive className="w-6 h-6" />
                    <h3 className="font-bold text-sm">Festplatte & OS</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Festplatten-Auslastung (/):</span>
                        <span className="font-bold font-mono">{systemStats.disk.percent}</span>
                      </div>
                      <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden border border-border/30">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: systemStats.disk.percent }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Freier Speicher:</span>
                        <span className="font-bold font-mono">{systemStats.disk.free} von {systemStats.disk.total}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1.5">
                        <span className="text-muted-foreground">Betriebssystem:</span>
                        <span className="font-bold font-mono capitalize">
                          {systemStats.platform} ({systemStats.arch})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1.5">
                        <span className="text-muted-foreground">System-Uptime:</span>
                        <span className="font-bold font-mono">{systemStats.uptime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-strong rounded-2xl p-8 text-center text-muted-foreground text-sm">
                Systemdaten werden geladen...
              </div>
            )}
          </div>
        )}
      </div>

      <LegalFooter />
    </div>
  );
}
