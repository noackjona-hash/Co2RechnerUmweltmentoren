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
import { ParticleField } from '@/components/particle-field';

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

type Tab = 'stats' | 'schools' | 'questions' | 'admins' | 'system' | 'simulation';

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

  // Simulation state
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [generatingSimulation, setGeneratingSimulation] = useState(false);
  const [simulationPreset, setSimulationPreset] = useState<'standard' | 'large' | 'small' | 'custom'>('standard');
  const [customSimData, setCustomSimData] = useState({
    schoolName: '',
    classesCount: 4,
    studentsPerClass: 25,
    quizMode: 60,
    completionRate: 85,
  });

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

  const fetchSimulations = async () => {
    try {
      setLoadingSimulation(true);
      const res = await fetch('/api/admin/simulation');
      if (res.ok) {
        const data = await res.json();
        setSimulations(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSimulation(false);
    }
  };

  const handleGenerateSimulation = async () => {
    setGeneratingSimulation(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: simulationPreset,
          ...customSimData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Schule und Datensätze erfolgreich simuliert.');
        await fetchSimulations();
        await fetchLicenses();
        await fetchStats();
      } else {
        setError(data.error || 'Fehler bei der Simulation.');
      }
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setGeneratingSimulation(false);
    }
  };

  const handleDeleteSimulation = async (licenseId?: string, all?: boolean) => {
    if (!confirm(all ? 'Wirklich alle simulierten Testschulen und deren Schülerdaten löschen?' : 'Diese simulierte Schule löschen?')) return;
    try {
      const url = all ? '/api/admin/simulation?all=true' : `/api/admin/simulation?licenseId=${licenseId}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        await fetchSimulations();
        await fetchLicenses();
        await fetchStats();
      } else {
        setError(data.error || 'Fehler beim Löschen.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

  useEffect(() => {
    if (activeTab === 'system' && session?.adminRole === 'super-admin') {
      fetchSystemStats();
    }
    if (activeTab === 'simulation' && session?.adminRole === 'super-admin') {
      fetchSimulations();
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Admin-Bereich wird geladen...
        </p>
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
    <div className="min-h-screen relative flex flex-col justify-between bg-background">
      {/* Nav Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm font-semibold text-foreground">
              Umweltmentoren
            </span>
            <span className="text-border">/</span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Admin-Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden md:flex flex-col items-end border-r border-border pr-3 font-mono">
                <span className="text-xs font-semibold text-foreground">{session.email}</span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {roleLabels[session.adminRole] || session.adminRole}
                </span>
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="paper-btn-secondary text-xs"
              title="Abmelden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Banner Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 border border-destructive bg-destructive/10 text-destructive text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted text-foreground border border-border text-xs font-mono">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-6 overflow-x-auto pb-1 scrollbar-hide text-xs font-mono">
          <button
            onClick={() => { setActiveTab('stats'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 pb-2.5 font-medium border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'stats'
                ? 'border-foreground text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Statistiken
          </button>
          <button
            onClick={() => { setActiveTab('schools'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 pb-2.5 font-medium border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'schools'
                ? 'border-foreground text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            Schulen & Lizenzen
          </button>
          <button
            onClick={() => { setActiveTab('questions'); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 pb-2.5 font-medium border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'questions'
                ? 'border-foreground text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Quiz-Fragen
          </button>
          {isSuperAdmin && (
            <>
              <button
                onClick={() => { setActiveTab('admins'); setError(''); setSuccess(''); }}
                className={`flex items-center gap-2 pb-2.5 font-medium border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'admins'
                    ? 'border-foreground text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Admins
              </button>
              <button
                onClick={() => { setActiveTab('system'); setError(''); setSuccess(''); }}
                className={`flex items-center gap-2 pb-2.5 font-medium border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'system'
                    ? 'border-foreground text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                System
              </button>
              <button
                onClick={() => { setActiveTab('simulation'); setError(''); setSuccess(''); }}
                className={`flex items-center gap-2 pb-2.5 font-medium border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'simulation'
                    ? 'border-foreground text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Simulation
              </button>
            </>
          )}
        </div>

        {/* -------------------- STATS TAB -------------------- */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6 animate-slide-up">
            {/* Action Row */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-border pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Übersicht
                </span>
                <h2 className="font-serif text-xl font-normal text-foreground">Systemstatistiken</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/stats/export"
                  className="paper-btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Daten exportieren (CSV)
                </a>
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCleanupModal(true)}
                    className="paper-btn-secondary text-xs text-destructive hover:border-destructive flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Datenbank zurücksetzen
                  </button>
                )}
              </div>
            </div>

            {/* Cleanup Modal */}
            {showCleanupModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
                <div className="border border-border bg-background p-6 max-w-md w-full space-y-4">
                  <div className="flex items-center gap-2 text-destructive border-b border-border pb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="font-serif text-base font-normal">Datenbank zurücksetzen?</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Diese Aktion löscht alle Schüler-Accounts und deren eingegebenen CO₂-Ergebnisse unwiderruflich. 
                    Schulen, Klassen, Quiz-Fragen und Admins bleiben erhalten.
                  </p>
                  <div className="border border-border bg-muted/30 p-3 space-y-2">
                    <p className="text-[11px] font-mono text-destructive">
                      Um fortzufahren, bitte <code className="bg-destructive/10 px-1 py-0.5 border border-destructive/30 font-bold">CLEANUP</code> eintippen:
                    </p>
                    <input
                      type="text"
                      value={cleanupInput}
                      onChange={(e) => setCleanupInput(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-destructive text-xs font-mono tracking-widest text-center"
                      placeholder="CLEANUP"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => { setShowCleanupModal(false); setCleanupInput(''); }}
                      className="paper-btn-secondary text-xs"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleCleanup}
                      disabled={cleanupInput !== 'CLEANUP' || cleaning}
                      className="paper-btn-primary text-xs bg-destructive border-destructive text-destructive-foreground disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${cleaning ? 'animate-spin' : ''}`} />
                      {cleaning ? 'Wird gelöscht...' : 'Ja, unwiderruflich löschen'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-border bg-card p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Teilnahmen Gesamt
                </span>
                <div className="font-serif text-3xl font-normal text-foreground">{stats.summary.totalStudents}</div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/60">
                  <span className="font-semibold text-foreground">{stats.summary.totalCompleted}</span> beendet ({stats.summary.completionRate}%)
                </div>
              </div>

              <div className="border border-border bg-card p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Registrierte Schulen
                </span>
                <div className="font-serif text-3xl font-normal text-foreground">{stats.summary.totalSchools}</div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/60">
                  In <span className="font-semibold text-foreground">{stats.summary.totalClasses}</span> Klassen
                </div>
              </div>

              <div className="border border-border bg-card p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  CO₂ Ausstoß Gesamt
                </span>
                <div className="font-serif text-3xl font-normal text-foreground">
                  {(stats.summary.totalCo2 / 1000).toFixed(1)} t
                </div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/60">
                  Gesamter Ausstoß
                </div>
              </div>

              <div className="border border-border bg-card p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Schnitt pro Schüler:in
                </span>
                <div className="font-serif text-3xl font-normal text-foreground">
                  {stats.summary.avgCo2PerStudent} t
                </div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/60">
                  Pro Jahr / Schüler:in
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Pie Chart */}
              <div className="border border-border bg-card p-5 flex flex-col justify-between min-h-[350px]">
                <div className="border-b border-border pb-2 mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Aufschlüsselung
                  </span>
                  <h3 className="font-serif text-sm font-normal text-foreground">
                    Verteilung nach Kategorien (Schnitt pro Kopf)
                  </h3>
                </div>
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
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#71717a'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} t CO₂/Jahr`, 'Durchschnitt']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transport Bar Chart */}
              <div className="border border-border bg-card p-5 flex flex-col justify-between min-h-[350px]">
                <div className="border-b border-border pb-2 mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Mobilität
                  </span>
                  <h3 className="font-serif text-sm font-normal text-foreground">
                    Schulweg-Transportmittel
                  </h3>
                </div>
                {stats.transportDistribution.length > 0 ? (
                  <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.transportDistribution} margin={{ bottom: 15 }}>
                        <XAxis dataKey="label" angle={-15} textAnchor="end" interval={0} fontSize={10} />
                        <YAxis allowDecimals={false} fontSize={10} />
                        <Tooltip formatter={(value) => [`${value} Schüler`, 'Anzahl']} />
                        <Bar dataKey="count" fill="#52525b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs font-mono">
                    Keine Daten vorhanden.
                  </div>
                )}
              </div>

              {/* History completions */}
              <div className="border border-border bg-card p-5 md:col-span-2 min-h-[300px] flex flex-col">
                <div className="border-b border-border pb-2 mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Aktivität
                  </span>
                  <h3 className="font-serif text-sm font-normal text-foreground">
                    Quiz-Abschlüsse der letzten 7 Tage
                  </h3>
                </div>
                <div className="flex-1 min-h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.completionHistory}>
                      <defs>
                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis allowDecimals={false} fontSize={10} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="completions"
                        stroke="#27272a"
                        fillOpacity={1}
                        fill="url(#colorCompletions)"
                        strokeWidth={1.5}
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
                  className="paper-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Schule anlegen
                </button>
              )}
            </div>

            {/* Create school form */}
            {showCreateLicense && isSuperAdmin && (
              <div className="paper-sheet p-6 space-y-4">
                <h3 className="text-sm font-semibold mb-2">Neue Schule registrieren</h3>
                <form onSubmit={handleCreateLicense} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Schulname</label>
                    <input
                      type="text"
                      value={licenseFormData.schoolName}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, schoolName: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="z. B. Max-Planck-Gymnasium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Kontakt-E-Mail</label>
                    <input
                      type="email"
                      value={licenseFormData.contactEmail}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, contactEmail: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="admin@mpg-schule.de"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Passwort</label>
                    <input
                      type="text"
                      value={licenseFormData.password}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="Zukünftiges Schul-Passwort"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 mt-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowCreateLicense(false)}
                      className="paper-btn-secondary text-xs"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={creatingLicense}
                      className="paper-btn-primary text-xs"
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
                <div key={lic.id} className="border border-border bg-card p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between border-b border-border pb-3">
                    <div>
                      <h4 className="font-serif text-base font-normal text-foreground">{lic.schoolName}</h4>
                      <span className="text-xs font-mono text-muted-foreground">{lic.contactEmail}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider ${
                        lic.isActive
                          ? 'border-foreground/30 text-foreground bg-muted/40 font-semibold'
                          : 'border-border text-muted-foreground bg-muted/10'
                      }`}
                    >
                      {lic.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>

                  <div className="border border-border bg-muted/20 p-3 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">
                        Lizenzschlüssel
                      </span>
                      <code className="text-xs font-bold">{lic.licenseKey}</code>
                    </div>
                    <button
                      onClick={() => copyKey(lic.licenseKey)}
                      className="p-1.5 border border-border hover:border-foreground text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Kopieren"
                    >
                      {copiedKey === lic.licenseKey ? (
                        <Check className="w-3.5 h-3.5 text-foreground" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 font-mono">
                    <span>
                      Klassen:{' '}
                      <span className="font-bold text-foreground">{lic.classes.length}</span> (
                      {lic.classes.reduce((sum, c) => sum + c._count.students, 0)} Schüler:innen)
                    </span>

                    {isSuperAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLicense(lic.id, lic.isActive)}
                          className="p-1 hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                          title={lic.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          {lic.isActive ? (
                            <ToggleRight className="w-5 h-5 text-foreground" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteLicense(lic.id)}
                          className="p-1 text-destructive hover:opacity-80 transition-opacity cursor-pointer"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {licenses.length === 0 && (
                <div className="col-span-2 border border-border bg-card p-8 text-center text-muted-foreground text-xs font-mono">
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
                  className="paper-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Frage hinzufügen
                </button>
              )}
            </div>

            {/* Create Question form */}
            {showCreateQuestion && canModify && (
              <div className="paper-sheet p-6 space-y-4">
                <h3 className="text-sm font-semibold mb-2">Neue Frage erstellen</h3>
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Kategorie</label>
                      <select
                        value={questionFormData.category}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs text-foreground"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs text-foreground"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs font-mono"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                        placeholder="Wie viele Kilometer fährst du pro Tag?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Hilfetext</label>
                      <input
                        type="text"
                        value={questionFormData.helpText}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, helpText: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs font-mono"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Standardwert</label>
                      <input
                        type="number"
                        value={questionFormData.defaultValue}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, defaultValue: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowCreateQuestion(false)}
                      className="paper-btn-secondary text-xs"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="paper-btn-primary text-xs"
                    >
                      Frage erstellen
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Editing modal/form */}
            {editingQuestion && canModify && (
              <div className="paper-sheet p-6 space-y-4 mb-6 border-foreground/30">
                <div className="border-b border-border pb-2 flex justify-between items-center">
                  <h3 className="font-serif text-base font-normal text-foreground">Frage bearbeiten</h3>
                  <span className="text-[10px] font-mono text-muted-foreground">ID: {editingQuestion.id.slice(0, 8)}...</span>
                </div>
                <form onSubmit={handleUpdateQuestion} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Fragetext</label>
                      <input
                        type="text"
                        value={editingQuestion.questionText}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs font-mono"
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
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                        placeholder="z. B. km, kWh, kg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Hilfetext</label>
                      <input
                        type="text"
                        value={editingQuestion.helpText || ''}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, helpText: e.target.value || null })}
                        className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="paper-btn-secondary text-xs"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={updatingQuestion}
                      className="paper-btn-primary text-xs"
                    >
                      {updatingQuestion ? 'Wird gespeichert...' : 'Änderungen speichern'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List Table */}
            <div className="border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Kategorie</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-1/3">Frage</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Typ</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Faktor</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Einheit</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 border border-border text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                            {CATEGORY_LABELS[q.category] || q.category}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-foreground">{q.questionText}</td>
                        <td className="p-3 font-mono text-[10px] text-muted-foreground uppercase">{q.questionType}</td>
                        <td className="p-3 font-mono font-bold text-foreground">
                          {q.co2Factor}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">{q.unit || '–'}</td>
                        <td className="p-3 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingQuestion(q)}
                                className="p-1 border border-border hover:border-foreground text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteQuestion(q.id)}
                                className="p-1 text-destructive hover:opacity-80 transition-opacity cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
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
                className="paper-btn-primary text-xs flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Admin anlegen
              </button>
            </div>

            {/* Create Admin Form */}
            {showCreateAdmin && (
              <div className="paper-sheet p-6 space-y-4">
                <h3 className="text-sm font-semibold mb-2">Neues Admin-Konto erstellen</h3>
                <form onSubmit={handleCreateAdmin} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">E-Mail</label>
                    <input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="admin@co2rechner.de"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Rolle</label>
                    <select
                      value={adminFormData.role}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          role: e.target.value as 'super-admin' | 'editor' | 'viewer',
                        })
                      }
                      className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs text-foreground"
                    >
                      <option value="super-admin">Super Admin (Vollzugriff)</option>
                      <option value="editor">Editor (Fragen verwalten)</option>
                      <option value="viewer">Viewer (Statistiken lesen)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Passwort</label>
                    <input
                      type="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="Sicheres Passwort"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 mt-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowCreateAdmin(false)}
                      className="paper-btn-secondary text-xs"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={creatingAdmin}
                      className="paper-btn-primary text-xs"
                    >
                      {creatingAdmin ? 'Wird erstellt...' : 'Konto erstellen'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admins List Table */}
            <div className="border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Admin E-Mail</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Rolle</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Erstellt am</th>
                      <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {admins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{adm.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 border border-border text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                            {roleLabels[adm.role] || adm.role}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{new Date(adm.createdAt).toLocaleDateString('de-DE')}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deleteAdmin(adm.id)}
                            disabled={adm.id === session.id}
                            className="p-1 text-destructive hover:opacity-80 disabled:opacity-20 transition-opacity cursor-pointer"
                            title={adm.id === session.id ? 'Sie können sich nicht selbst löschen' : 'Löschen'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Infrastruktur
                </span>
                <h2 className="font-serif text-lg font-normal text-foreground">Server System-Status</h2>
              </div>
              <button
                onClick={fetchSystemStats}
                disabled={loadingSystem}
                className="paper-btn-secondary text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSystem ? 'animate-spin' : ''}`} />
                Aktualisieren
              </button>
            </div>

            {systemStats ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* CPU Card */}
                <div className="border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2 text-foreground border-b border-border pb-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-serif text-sm font-normal">Prozessor (CPU)</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground font-mono text-[10px] uppercase block">Modell:</span>
                      <p className="font-mono text-xs font-semibold text-foreground truncate" title={systemStats.cpu.model}>
                        {systemStats.cpu.model}
                      </p>
                    </div>
                    <div className="flex justify-between border-b border-border/40 py-1 font-mono text-[11px]">
                      <span className="text-muted-foreground">Kerne:</span>
                      <span className="font-bold text-foreground">{systemStats.cpu.cores} Cores</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 py-1 font-mono text-[11px]">
                      <span className="text-muted-foreground">Last (1/5/15m):</span>
                      <span className="font-bold text-foreground">
                        {systemStats.cpu.load1m} / {systemStats.cpu.load5m} / {systemStats.cpu.load15m}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RAM Card */}
                <div className="border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2 text-foreground border-b border-border pb-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-serif text-sm font-normal">Arbeitsspeicher (RAM)</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Auslastung:</span>
                        <span className="font-bold text-foreground">{systemStats.ram.percent}</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 overflow-hidden border border-border">
                        <div
                          className="bg-foreground h-full transition-all duration-300"
                          style={{ width: systemStats.ram.percent }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs font-mono text-[11px]">
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">Belegt:</span>
                        <span className="font-bold text-foreground">{systemStats.ram.used}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">Gesamt:</span>
                        <span className="font-bold text-foreground">{systemStats.ram.total}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">Frei:</span>
                        <span className="font-bold text-foreground">{systemStats.ram.free}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disk & Platform */}
                <div className="border border-border bg-card p-5 space-y-3 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-foreground border-b border-border pb-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-serif text-sm font-normal">Festplatte & OS</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Festplatte (/):</span>
                        <span className="font-bold text-foreground">{systemStats.disk.percent}</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 overflow-hidden border border-border">
                        <div
                          className="bg-foreground h-full transition-all duration-300"
                          style={{ width: systemStats.disk.percent }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs font-mono text-[11px]">
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">Frei:</span>
                        <span className="font-bold text-foreground">{systemStats.disk.free} / {systemStats.disk.total}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">OS:</span>
                        <span className="font-bold text-foreground capitalize">
                          {systemStats.platform} ({systemStats.arch})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="font-bold text-foreground">{systemStats.uptime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-border bg-card p-8 text-center text-muted-foreground text-xs font-mono">
                Systemdaten werden geladen...
              </div>
            )}
          </div>
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulation' && isSuperAdmin && (
          <div className="space-y-6">
            <article className="paper-sheet p-6 space-y-4">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground block">
                    Superadmin-Werkzeuge
                  </span>
                  <h2 className="text-xl font-serif font-normal text-foreground">
                    Schul- und Datensatz-Simulation
                  </h2>
                </div>
                <span className="paper-stamp">Test-Umgebung</span>
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Erstelle realitätsnahe Testschulen mit Klassen, Schülern und detailliert berechneten Fragebogen-Antworten. 
                Perfekt zum Testen von Auswertungen, didaktischen Vergleichen und zur Demonstration für Lehrkräfte.
              </p>

              {/* Preset Selector */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Simulations-Vorlage wählen:
                </span>
                <div className="grid sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  {[
                    { id: 'standard', title: 'Standard-Schule', desc: '4 Klassen · 100 Schüler:innen' },
                    { id: 'large', title: 'Große Gesamtschule', desc: '8 Klassen · 224 Schüler:innen' },
                    { id: 'small', title: 'Kleine Realschule', desc: '2 Klassen · 40 Schüler:innen' },
                    { id: 'custom', title: 'Individuell', desc: 'Eigene Parameter festlegen' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSimulationPreset(p.id as any)}
                      className={`p-3 border text-left rounded-sm transition-all cursor-pointer ${
                        simulationPreset === p.id
                          ? 'border-foreground bg-muted/40 text-foreground font-bold'
                          : 'border-border bg-card hover:bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      <span className="block text-foreground">{p.title}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Inputs if custom */}
              {simulationPreset === 'custom' && (
                <div className="grid sm:grid-cols-3 gap-3 p-4 border border-border bg-muted/20 text-xs font-mono">
                  <div>
                    <label className="block text-muted-foreground uppercase text-[10px] mb-1">Schulname</label>
                    <input
                      type="text"
                      placeholder="z.B. Schiller-Gymnasium"
                      value={customSimData.schoolName}
                      onChange={(e) => setCustomSimData({ ...customSimData, schoolName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-border bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground uppercase text-[10px] mb-1">Anzahl Klassen (1-12)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={customSimData.classesCount}
                      onChange={(e) => setCustomSimData({ ...customSimData, classesCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-2.5 py-1.5 border border-border bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground uppercase text-[10px] mb-1">Schüler pro Klasse (5-35)</label>
                    <input
                      type="number"
                      min={5}
                      max={35}
                      value={customSimData.studentsPerClass}
                      onChange={(e) => setCustomSimData({ ...customSimData, studentsPerClass: parseInt(e.target.value) || 10 })}
                      className="w-full px-2.5 py-1.5 border border-border bg-card text-foreground"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleGenerateSimulation}
                  disabled={generatingSimulation}
                  className="paper-btn-primary text-xs"
                >
                  {generatingSimulation ? 'Generiere Schule & Schülerantworten...' : 'Simulation jetzt generieren →'}
                </button>

                {simulations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSimulation(undefined, true)}
                    className="paper-btn-secondary text-xs text-destructive hover:border-destructive"
                  >
                    Alle Simulationen löschen
                  </button>
                )}
              </div>
            </article>

            {/* Existing Simulated Schools List */}
            <article className="paper-sheet p-6 space-y-4">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <h3 className="font-serif text-base font-normal text-foreground">
                  Aktive simulierte Schulen ({simulations.length})
                </h3>
                <button
                  type="button"
                  onClick={fetchSimulations}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Aktualisieren
                </button>
              </div>

              {loadingSimulation ? (
                <p className="font-mono text-xs text-muted-foreground text-center py-6">Lade Simulationen...</p>
              ) : simulations.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground text-center py-6">
                  Keine simulierten Schulen vorhanden. Wähle oben eine Vorlage und klicke auf "Simulation jetzt generieren".
                </p>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {simulations.map((sim) => (
                    <div key={sim.id} className="p-4 border border-border bg-card space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                        <div>
                          <span className="font-bold text-foreground font-serif text-sm block">
                            {sim.schoolName}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            Lizenzschlüssel: <strong className="text-foreground">{sim.licenseKey}</strong> · PW: schule123
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSimulation(sim.id)}
                          className="text-destructive hover:underline text-[11px] self-start sm:self-auto cursor-pointer"
                        >
                          Löschen
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground pt-1">
                        <div>Klassen: <strong className="text-foreground">{sim.classesCount}</strong></div>
                        <div>Schüler:innen: <strong className="text-foreground">{sim.totalStudents}</strong></div>
                        <div>Abgeschlossen: <strong className="text-foreground">{sim.totalCompleted} ({sim.completionRate}%)</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        )}
      </div>

      <LegalFooter />
    </div>
  );
}
