'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Search,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  ArrowLeft,
  Home,
  X,
  Layers,
  GraduationCap,
  Calendar,
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

interface ClassItem {
  id: string;
  className: string;
  teacherName?: string | null;
  teacherEmail?: string | null;
  quizMode?: number;
  _count: { students: number };
}

interface License {
  id: string;
  schoolName: string;
  contactEmail: string;
  licenseKey: string;
  isActive: boolean;
  createdAt: string;
  classes: ClassItem[];
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

type Tab = 'stats' | 'schools' | 'questions' | 'materials' | 'admins' | 'system' | 'simulation';

import AdminMaterialsTab from '@/components/admin/admin-materials-tab';

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

  // Filter & Search states
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);

  const [questionSearch, setQuestionSearch] = useState('');
  const [questionCategory, setQuestionCategory] = useState<string>('all');
  const [questionTier, setQuestionTier] = useState<string>('all');

  const [adminSearch, setAdminSearch] = useState('');

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
        // Check URL search params for direct tab navigation
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const tabParam = params.get('tab') as Tab;
          if (tabParam && ['stats', 'schools', 'questions', 'materials', 'admins', 'system', 'simulation'].includes(tabParam)) {
            setActiveTab(tabParam);
          }
        }

        // Fetch Tab data
        await Promise.all([fetchStats(), fetchLicenses(), fetchQuestions()]);
        if (sessionData.adminRole === 'super-admin') {
          await Promise.all([fetchAdmins(), fetchSystemStats(), fetchSimulations()]);
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
      console.error('Error fetching stats:', err);
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
      console.error('Error fetching licenses:', err);
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
      console.error('Error fetching questions:', err);
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
      console.error('Error fetching admins:', err);
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

  // Actions
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleLicense = async (id: string, currentStatus: boolean) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setLicenses(licenses.map((l) => (l.id === id ? { ...l, isActive: !currentStatus } : l)));
        setSuccess(`Lizenz erfolgreich ${!currentStatus ? 'aktiviert' : 'deaktiviert'}.`);
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Aktualisieren der Lizenz.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

  const deleteLicense = async (id: string) => {
    if (!confirm('Schule und alle zugehörigen Klassen & Schülerdaten wirklich unwiderruflich löschen?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLicenses(licenses.filter((l) => l.id !== id));
        setSuccess('Schule erfolgreich gelöscht.');
        await fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen der Schule.');
      }
    } catch {
      setError('Verbindungsfehler.');
    }
  };

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
      if (res.ok) {
        setSuccess('Neue Schullizenz erfolgreich erstellt.');
        setShowCreateLicense(false);
        setLicenseFormData({ schoolName: '', contactEmail: '', password: '' });
        await fetchLicenses();
        await fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Erstellen der Lizenz.');
      }
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setCreatingLicense(false);
    }
  };

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
      if (res.ok) {
        setSuccess('Neuer Admin erfolgreich angelegt.');
        setShowCreateAdmin(false);
        setAdminFormData({ email: '', password: '', role: 'editor' });
        await fetchAdmins();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Erstellen des Admins.');
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

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionFormData),
      });
      if (res.ok) {
        setSuccess('Neue Frage erfolgreich angelegt.');
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
    if (!confirm(all ? 'Wirklich alle simulierten Testschulen und Schülerdaten löschen?' : 'Diese simulierte Schule löschen?')) return;
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

  // Filtered Lists
  const filteredSchools = useMemo(() => {
    return licenses.filter((lic) => {
      const matchesSearch =
        lic.schoolName.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        lic.contactEmail.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        lic.licenseKey.toLowerCase().includes(schoolSearch.toLowerCase());

      const matchesStatus =
        schoolFilter === 'all' ||
        (schoolFilter === 'active' && lic.isActive) ||
        (schoolFilter === 'inactive' && !lic.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [licenses, schoolSearch, schoolFilter]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.questionText.toLowerCase().includes(questionSearch.toLowerCase()) ||
        (q.helpText && q.helpText.toLowerCase().includes(questionSearch.toLowerCase())) ||
        (q.unit && q.unit.toLowerCase().includes(questionSearch.toLowerCase()));

      const matchesCategory = questionCategory === 'all' || q.category === questionCategory;
      const matchesTier = questionTier === 'all' || q.tier.toString() === questionTier;

      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [questions, questionSearch, questionCategory, questionTier]);

  const filteredAdmins = useMemo(() => {
    return admins.filter((adm) =>
      adm.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      adm.role.toLowerCase().includes(adminSearch.toLowerCase())
    );
  }, [admins, adminSearch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-3"></div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Admin-Portal wird geladen...
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
  const canModify = isSuperAdmin || isEditor;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9] dark:bg-[#0c0a09] text-foreground font-sans">
      {/* ═══ Header Bar (Clean Minimalist Swiss Style) ═══ */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-sm px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Startseite</span>
          </Link>
          <span className="text-muted-foreground/40 text-xs">/</span>
          <span className="font-serif text-sm font-semibold tracking-tight text-foreground">
            Admin-Portal
          </span>
          {session && (
            <span className="paper-stamp text-[10px] font-mono uppercase !py-0.5">
              {roleLabels[session.adminRole] || session.adminRole}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session && (
            <span className="text-xs font-mono text-muted-foreground hidden md:inline-block">
              {session.email}
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="paper-btn-secondary !min-h-[36px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5 cursor-pointer"
            title="Abmelden"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Abmelden</span>
          </button>
        </div>
      </header>

      {/* ═══ Main Admin Workspace ═══ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Banner Messages */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-mono animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {success && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/10 text-foreground text-xs font-mono animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="p-1 hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ═══ Segmented Tab Navigation ═══ */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3 text-xs">
          <button
            onClick={() => { setActiveTab('stats'); setError(''); setSuccess(''); }}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistiken</span>
          </button>

          <button
            onClick={() => { setActiveTab('schools'); setError(''); setSuccess(''); }}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schools'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Schulen & Lizenzen</span>
            <span className="text-[10px] font-mono opacity-80 ml-0.5">({licenses.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('questions'); setError(''); setSuccess(''); }}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quiz-Fragen</span>
            <span className="text-[10px] font-mono opacity-80 ml-0.5">({questions.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('materials'); setError(''); setSuccess(''); }}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stellwand & Materialien</span>
          </button>

          {isSuperAdmin && (
            <>
              <button
                onClick={() => { setActiveTab('admins'); setError(''); setSuccess(''); }}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admins'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Admins</span>
                <span className="text-[10px] font-mono opacity-80 ml-0.5">({admins.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab('system'); setError(''); setSuccess(''); }}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'system'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>System-Status</span>
              </button>

              <button
                onClick={() => { setActiveTab('simulation'); setError(''); setSuccess(''); }}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'simulation'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Simulations-Labor</span>
                <span className="text-[10px] font-mono opacity-80 ml-0.5">({simulations.length})</span>
              </button>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: STATS & ANALYTICS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Header / Actions Row */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div>
                <span className="paper-stamp text-[10px] uppercase font-mono">
                  Plattform-Analytics
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
                  Echtzeit-Statistiken & Auswertungen
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href="/api/admin/stats/export"
                  className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV-Export</span>
                </a>
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCleanupModal(true)}
                    className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3 text-destructive hover:border-destructive/60 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Datenbank bereinigen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Database Cleanup Modal */}
            {showCleanupModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex items-center gap-2.5 text-destructive border-b border-border pb-3">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-serif text-base font-bold">Schülerdaten zurücksetzen?</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Diese Aktion löscht alle Schüler-Accounts und deren eingereichte Quiz-Antworten. 
                    Schulen, Lehrkräfte, Klassen und Quizfragen bleiben vollständig erhalten.
                  </p>
                  <div className="border border-border/80 bg-muted/30 p-3.5 rounded-xl space-y-2">
                    <p className="text-[11px] font-mono text-destructive">
                      Tippe zur Bestätigung <code className="bg-destructive/10 px-1 py-0.5 rounded font-bold">CLEANUP</code> ein:
                    </p>
                    <input
                      type="text"
                      value={cleanupInput}
                      onChange={(e) => setCleanupInput(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-destructive text-xs font-mono tracking-widest text-center"
                      placeholder="CLEANUP"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => { setShowCleanupModal(false); setCleanupInput(''); }}
                      className="paper-btn-secondary !min-h-[36px] !text-xs !py-1.5 !px-3"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleCleanup}
                      disabled={cleanupInput !== 'CLEANUP' || cleaning}
                      className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3.5 bg-destructive border-destructive text-destructive-foreground disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${cleaning ? 'animate-spin' : ''}`} />
                      <span>{cleaning ? 'Wird gelöscht...' : 'Ja, jetzt bereinigen'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4 Hero KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="paper-sheet p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Teilnahmen</span>
                  <Users className="w-4 h-4 text-foreground/60" />
                </div>
                <div className="font-serif text-3xl font-bold text-foreground">
                  {stats.summary.totalStudents}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1.5 border-t border-border/60 flex items-center justify-between">
                  <span>Abgeschlossen:</span>
                  <span className="font-bold text-foreground">
                    {stats.summary.totalCompleted} ({stats.summary.completionRate}%)
                  </span>
                </div>
              </div>

              <div className="paper-sheet p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Schulen & Klassen</span>
                  <School className="w-4 h-4 text-foreground/60" />
                </div>
                <div className="font-serif text-3xl font-bold text-foreground">
                  {stats.summary.totalSchools}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1.5 border-t border-border/60 flex items-center justify-between">
                  <span>Klassen gesamt:</span>
                  <span className="font-bold text-foreground">{stats.summary.totalClasses}</span>
                </div>
              </div>

              <div className="paper-sheet p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Gesamter Ausstoß</span>
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <div className="font-serif text-3xl font-bold text-foreground">
                  {(stats.summary.totalCo2 / 1000).toFixed(1)} <span className="text-base font-normal">t</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1.5 border-t border-border/60">
                  Kumulierte CO₂-Menge aller Schüler
                </div>
              </div>

              <div className="paper-sheet p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Durchschnitt</span>
                  <BarChart3 className="w-4 h-4 text-foreground/60" />
                </div>
                <div className="font-serif text-3xl font-bold text-foreground">
                  {stats.summary.avgCo2PerStudent} <span className="text-base font-normal">t/J</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono pt-1.5 border-t border-border/60">
                  Pro Schüler:in / Jahr
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Breakdown Chart */}
              <div className="paper-sheet p-6 flex flex-col justify-between min-h-[380px] shadow-sm">
                <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Emissionsverteilung
                    </span>
                    <h3 className="font-serif text-base font-semibold text-foreground">CO₂ nach Lebensbereichen</h3>
                  </div>
                  <span className="paper-stamp text-[10px]">Durchschnitt pro Kopf</span>
                </div>

                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="category"
                        tickFormatter={(cat) => CATEGORY_LABELS[cat] || cat}
                        tick={{ fontSize: 11, fill: 'currentColor' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} unit=" kg" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          borderColor: 'var(--color-border)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`${val} kg CO₂/J`, 'Durchschnitt']}
                        labelFormatter={(cat) => CATEGORY_LABELS[cat] || cat}
                      />
                      <Bar dataKey="avgCo2" radius={[6, 6, 0, 0]}>
                        {stats.categoryStats.map((entry) => (
                          <Cell key={`cell-${entry.category}`} fill={CATEGORY_COLORS[entry.category] || '#71717a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Completion History Timeline */}
              <div className="paper-sheet p-6 flex flex-col justify-between min-h-[380px] shadow-sm">
                <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Verlauf
                    </span>
                    <h3 className="font-serif text-base font-semibold text-foreground">Tägliche Quiz-Abschlüsse</h3>
                  </div>
                  <span className="paper-stamp text-[10px]">Letzte 14 Tage</span>
                </div>

                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.completionHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          borderColor: 'var(--color-border)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completions"
                        name="Abschlüsse"
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

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: SCHOOLS & LICENSES (WITH CLASSES & TEACHERS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div>
                <span className="paper-stamp text-[10px] uppercase font-mono">
                  Schulverwaltung
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
                  Registrierte Schulen & Lizenzen
                </h2>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => setShowCreateLicense(!showCreateLicense)}
                  className="paper-btn-primary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Neue Schule registrieren</span>
                </button>
              )}
            </div>

            {/* Create school form modal / expandable */}
            {showCreateLicense && isSuperAdmin && (
              <div className="paper-sheet p-6 space-y-4 border-2 border-foreground/20 animate-in fade-in shadow-md">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-serif text-base font-bold text-foreground">
                    Neue Schule anlegen
                  </h3>
                  <button
                    onClick={() => setShowCreateLicense(false)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreateLicense} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Schulname</label>
                    <input
                      type="text"
                      value={licenseFormData.schoolName}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, schoolName: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="z.B. Max-Planck-Gymnasium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Kontakt-E-Mail</label>
                    <input
                      type="email"
                      value={licenseFormData.contactEmail}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, contactEmail: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="admin@mpg-schule.de"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Initiales Passwort</label>
                    <input
                      type="text"
                      value={licenseFormData.password}
                      onChange={(e) => setLicenseFormData({ ...licenseFormData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-foreground transition-colors text-xs"
                      placeholder="Passwort für Schulportal"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowCreateLicense(false)}
                      className="paper-btn-secondary !min-h-[36px] !text-xs !py-1.5 !px-3"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={creatingLicense}
                      className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3.5"
                    >
                      {creatingLicense ? 'Wird erstellt...' : 'Lizenz generieren & speichern'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Schulname, E-Mail oder Lizenzschlüssel suchen..."
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1 shrink-0 text-xs">
                <button
                  onClick={() => setSchoolFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    schoolFilter === 'all' ? 'bg-foreground text-background font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Alle ({licenses.length})
                </button>
                <button
                  onClick={() => setSchoolFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    schoolFilter === 'active' ? 'bg-foreground text-background font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Aktiv ({licenses.filter((l) => l.isActive).length})
                </button>
                <button
                  onClick={() => setSchoolFilter('inactive')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    schoolFilter === 'inactive' ? 'bg-foreground text-background font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Inaktiv ({licenses.filter((l) => !l.isActive).length})
                </button>
              </div>
            </div>

            {/* Schools Grid Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSchools.map((lic) => {
                const isExpanded = expandedSchoolId === lic.id;
                const totalStudents = lic.classes.reduce((sum, c) => sum + c._count.students, 0);

                return (
                  <div key={lic.id} className="paper-sheet p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* School Name and Active Status */}
                      <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
                        <div>
                          <h4 className="font-serif text-lg font-bold text-foreground">{lic.schoolName}</h4>
                          <span className="text-xs font-mono text-muted-foreground">{lic.contactEmail}</span>
                        </div>
                        <span
                          className={`paper-stamp text-[10px] font-mono uppercase ${
                            lic.isActive
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {lic.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>

                      {/* License Key Box */}
                      <div className="border border-border/80 bg-muted/20 p-3 rounded-xl flex items-center justify-between font-mono">
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase">
                            Lizenzschlüssel
                          </span>
                          <code className="text-xs font-bold text-foreground">{lic.licenseKey}</code>
                        </div>
                        <button
                          onClick={() => copyKey(lic.licenseKey)}
                          className="p-1.5 rounded-md border border-border hover:border-foreground text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Lizenzschlüssel kopieren"
                        >
                          {copiedKey === lic.licenseKey ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Classes & Teachers Accordion Preview */}
                      <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => setExpandedSchoolId(isExpanded ? null : lic.id)}
                          className="w-full px-3.5 py-2.5 bg-muted/30 hover:bg-muted/50 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-foreground/70" />
                            <span className="font-medium text-foreground">
                              {lic.classes.length} {lic.classes.length === 1 ? 'Klasse' : 'Klassen'} &middot; {totalStudents} Schüler:innen
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="p-3 bg-card divide-y divide-border/60 font-mono text-[11px] space-y-2">
                            {lic.classes.length === 0 ? (
                              <p className="text-muted-foreground py-2 text-center">
                                Noch keine Klassen angelegt.
                              </p>
                            ) : (
                              lic.classes.map((cls) => (
                                <div key={cls.id} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div>
                                    <span className="font-bold text-foreground">{cls.className}</span>
                                    <span className="text-muted-foreground ml-2">
                                      Modus: {cls.quizMode || 60}Q
                                    </span>
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    {cls.teacherName ? (
                                      <span>
                                        🧑‍🏫 {cls.teacherName} ({cls.teacherEmail})
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground/60 italic">Keine Lehrkraft zugewiesen</span>
                                    )}
                                    <span className="ml-2 font-bold text-foreground">
                                      ({cls._count.students} Schüler)
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 font-mono">
                      <span>Erstellt am: {new Date(lic.createdAt).toLocaleDateString('de-DE')}</span>

                      {isSuperAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleLicense(lic.id, lic.isActive)}
                            className="p-1.5 hover:text-foreground text-muted-foreground transition-colors cursor-pointer rounded-md hover:bg-muted"
                            title={lic.isActive ? 'Deaktivieren' : 'Aktivieren'}
                          >
                            {lic.isActive ? (
                              <ToggleRight className="w-5 h-5 text-primary" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteLicense(lic.id)}
                            className="p-1.5 text-destructive hover:opacity-80 transition-opacity cursor-pointer rounded-md hover:bg-destructive/10"
                            title="Schule löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredSchools.length === 0 && (
                <div className="col-span-2 paper-sheet p-8 text-center text-muted-foreground text-xs font-mono">
                  Keine Schulen gefunden, die den Suchkriterien entsprechen.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: QUESTIONS (60 QUESTIONS WITH FILTERS & SEARCH)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div>
                <span className="paper-stamp text-[10px] uppercase font-mono">
                  Fragenkatalog
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
                  Quiz-Fragen & CO₂-Faktoren
                </h2>
              </div>
              {canModify && (
                <button
                  onClick={() => setShowCreateQuestion(!showCreateQuestion)}
                  className="paper-btn-primary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Frage hinzufügen</span>
                </button>
              )}
            </div>

            {/* Create Question Form */}
            {showCreateQuestion && canModify && (
              <div className="paper-sheet p-6 space-y-4 border-2 border-foreground/20 animate-in fade-in shadow-md">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-serif text-base font-bold text-foreground">
                    Neue Quiz-Frage erstellen
                  </h3>
                  <button
                    onClick={() => setShowCreateQuestion(false)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Kategorie</label>
                      <select
                        value={questionFormData.category}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground"
                      >
                        <option value="mobility">Mobilität</option>
                        <option value="food">Ernährung</option>
                        <option value="heating">Heizung & Wärme</option>
                        <option value="electricity">Strom</option>
                        <option value="consumption">Konsum & Freizeit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Fragentyp</label>
                      <select
                        value={questionFormData.questionType}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, questionType: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground"
                      >
                        <option value="slider">Schieberegler (Slider)</option>
                        <option value="select">Auswahl (Select/Radio)</option>
                        <option value="number">Zahleneingabe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">CO₂-Faktor (kg pro Einheit)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={questionFormData.co2Factor}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, co2Factor: Number(e.target.value) })}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Fragetext</label>
                      <input
                        type="text"
                        value={questionFormData.questionText}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground"
                        placeholder="Wie viele Kilometer fährst du pro Tag mit dem Bus?"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Hilfetext / Didaktischer Tipp</label>
                      <input
                        type="text"
                        value={questionFormData.helpText}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, helpText: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground"
                        placeholder="Erklärung für Schüler:innen..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Einheit (optional)</label>
                      <input
                        type="text"
                        value={questionFormData.unit}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, unit: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                        placeholder="km, kWh, Tage etc."
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Sortierung (Order Index)</label>
                      <input
                        type="number"
                        value={questionFormData.orderIndex}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, orderIndex: Number(e.target.value) })}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Tier (1=10Q, 2=30Q, 3=60Q)</label>
                      <select
                        value={questionFormData.tier}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, tier: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                      >
                        <option value="1">Tier 1 (Im 10Q, 30Q & 60Q Modus)</option>
                        <option value="2">Tier 2 (Im 30Q & 60Q Modus)</option>
                        <option value="3">Tier 3 (Nur im 60Q Modus)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Standardwert</label>
                      <input
                        type="number"
                        value={questionFormData.defaultValue}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, defaultValue: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowCreateQuestion(false)}
                      className="paper-btn-secondary !min-h-[36px] !text-xs !py-1.5 !px-3"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3.5"
                    >
                      Frage speichern
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Question Modal */}
            {editingQuestion && canModify && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl my-auto">
                  <div className="border-b border-border pb-3 flex justify-between items-center">
                    <div>
                      <span className="paper-stamp text-[10px] font-mono">Bearbeitungsmodus</span>
                      <h3 className="font-serif text-lg font-bold text-foreground mt-1">Frage bearbeiten</h3>
                    </div>
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateQuestion} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Fragetext</label>
                      <input
                        type="text"
                        value={editingQuestion.questionText}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium mb-1 text-muted-foreground">CO₂-Faktor</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={editingQuestion.co2Factor}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, co2Factor: Number(e.target.value) })}
                          required
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1 text-muted-foreground">Einheit</label>
                        <input
                          type="text"
                          value={editingQuestion.unit || ''}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, unit: e.target.value || null })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                          placeholder="z.B. km, kWh, kg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1 text-muted-foreground">Tier (1, 2, 3)</label>
                        <select
                          value={editingQuestion.tier}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, tier: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-foreground"
                        >
                          <option value="1">Tier 1 (10Q Blitz)</option>
                          <option value="2">Tier 2 (30Q Standard)</option>
                          <option value="3">Tier 3 (60Q Deep Dive)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-muted-foreground">Hilfetext</label>
                      <input
                        type="text"
                        value={editingQuestion.helpText || ''}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, helpText: e.target.value || null })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion(null)}
                        className="paper-btn-secondary !min-h-[36px] !text-xs !py-1.5 !px-3"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        disabled={updatingQuestion}
                        className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3.5"
                      >
                        {updatingQuestion ? 'Wird gespeichert...' : 'Änderungen speichern'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Fragetext, Hilfetext oder Einheit suchen..."
                    className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <div className="text-xs font-mono text-muted-foreground flex items-center px-3 py-2 bg-card border border-border rounded-xl shrink-0">
                  <span>Zeige <strong>{filteredQuestions.length}</strong> von {questions.length} Fragen</span>
                </div>
              </div>

              {/* Category and Tier Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 overflow-x-auto">
                  <span className="text-[10px] font-mono text-muted-foreground px-2 uppercase">Kategorie:</span>
                  {[
                    { key: 'all', label: 'Alle' },
                    { key: 'mobility', label: 'Mobilität' },
                    { key: 'food', label: 'Ernährung' },
                    { key: 'heating', label: 'Heizung' },
                    { key: 'electricity', label: 'Strom' },
                    { key: 'consumption', label: 'Konsum' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setQuestionCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                        questionCategory === cat.key
                          ? 'bg-foreground text-background font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
                  <span className="text-[10px] font-mono text-muted-foreground px-2 uppercase">Tier:</span>
                  {[
                    { key: 'all', label: 'Alle' },
                    { key: '1', label: 'Tier 1 (10Q)' },
                    { key: '2', label: 'Tier 2 (30Q)' },
                    { key: '3', label: 'Tier 3 (60Q)' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setQuestionTier(t.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                        questionTier === t.key
                          ? 'bg-foreground text-background font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Table Container */}
            <div className="paper-sheet overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="p-3.5">Kategorie</th>
                      <th className="p-3.5 w-2/5">Frage & Hilfetext</th>
                      <th className="p-3.5">Tier</th>
                      <th className="p-3.5">CO₂-Faktor</th>
                      <th className="p-3.5">Einheit</th>
                      <th className="p-3.5 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/80">
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-medium"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[q.category] || '#71717a'}20`,
                              color: CATEGORY_COLORS[q.category] || 'currentColor',
                            }}
                          >
                            {CATEGORY_LABELS[q.category] || q.category}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-foreground block">{q.questionText}</span>
                          {q.helpText && (
                            <span className="text-[11px] text-muted-foreground block mt-0.5">{q.helpText}</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="paper-stamp text-[10px] !py-0.5">
                            Tier {q.tier}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-foreground">
                          {q.co2Factor}
                        </td>
                        <td className="p-3.5 font-mono text-muted-foreground">
                          {q.unit || '–'}
                        </td>
                        <td className="p-3.5 text-right">
                          {canModify ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingQuestion(q)}
                                className="p-1.5 rounded-md border border-border hover:border-foreground text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteQuestion(q.id)}
                                className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono uppercase">
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

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB: STELLWAND & MATERIALIEN (EXKLUSIV IM ADMIN-PORTAL)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'materials' && <AdminMaterialsTab />}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: ADMIN ACCOUNTS (SUPERADMIN)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'admins' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div>
                <span className="paper-stamp text-[10px] uppercase font-mono">
                  Sicherheitsverwaltung
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
                  Administrator-Konten
                </h2>
              </div>
              <button
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                className="paper-btn-primary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Admin anlegen</span>
              </button>
            </div>

            {/* Create Admin Form */}
            {showCreateAdmin && (
              <div className="paper-sheet p-6 space-y-4 border-2 border-foreground/20 animate-in fade-in shadow-md">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-serif text-base font-bold text-foreground">
                    Neues Administrator-Konto
                  </h3>
                  <button onClick={() => setShowCreateAdmin(false)} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreateAdmin} className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-medium mb-1 text-muted-foreground">E-Mail</label>
                    <input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-foreground text-xs"
                      placeholder="admin@co2rechner.de"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-muted-foreground">Rolle</label>
                    <select
                      value={adminFormData.role}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          role: e.target.value as 'super-admin' | 'editor' | 'viewer',
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-foreground text-xs text-foreground"
                    >
                      <option value="super-admin">Super Admin (Vollzugriff)</option>
                      <option value="editor">Editor (Fragen verwalten)</option>
                      <option value="viewer">Viewer (Statistiken einsehen)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-muted-foreground">Passwort</label>
                    <input
                      type="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-foreground text-xs"
                      placeholder="Sicheres Passwort"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowCreateAdmin(false)}
                      className="paper-btn-secondary !min-h-[36px] !text-xs !py-1.5 !px-3"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={creatingAdmin}
                      className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3.5"
                    >
                      {creatingAdmin ? 'Wird erstellt...' : 'Admin-Konto anlegen'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admins Table */}
            <div className="paper-sheet overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="p-3.5">Admin-E-Mail</th>
                      <th className="p-3.5">Berechtigungs-Rolle</th>
                      <th className="p-3.5">Erstellt am</th>
                      <th className="p-3.5 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/80">
                    {filteredAdmins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-medium text-foreground font-mono">{adm.email}</td>
                        <td className="p-3.5">
                          <span
                            className={`paper-stamp text-[10px] font-mono uppercase !py-0.5 ${
                              adm.role === 'super-admin'
                                ? 'bg-foreground text-background font-bold'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {roleLabels[adm.role] || adm.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground font-mono text-xs">
                          {new Date(adm.createdAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => deleteAdmin(adm.id)}
                            disabled={adm.id === session.id}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md disabled:opacity-20 transition-all cursor-pointer"
                            title={adm.id === session.id ? 'Eigenes Konto kann nicht gelöscht werden' : 'Löschen'}
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

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: SYSTEM STATUS & INFRASTRUCTURE (SUPERADMIN)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'system' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div>
                <span className="paper-stamp text-[10px] uppercase font-mono">
                  Infrastruktur
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
                  Server- & Systemressourcen
                </h2>
              </div>
              <button
                onClick={fetchSystemStats}
                disabled={loadingSystem}
                className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSystem ? 'animate-spin' : ''}`} />
                <span>Aktualisieren</span>
              </button>
            </div>

            {systemStats ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* CPU Card */}
                <div className="paper-sheet p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground border-b border-border pb-3">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-serif text-base font-semibold">Prozessor (CPU)</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground font-mono text-[10px] uppercase block">Modell:</span>
                      <p className="font-mono text-xs font-semibold text-foreground truncate" title={systemStats.cpu.model}>
                        {systemStats.cpu.model}
                      </p>
                    </div>
                    <div className="flex justify-between border-b border-border/40 py-1.5 font-mono text-[11px]">
                      <span className="text-muted-foreground">Kerne:</span>
                      <span className="font-bold text-foreground">{systemStats.cpu.cores} Cores</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 py-1.5 font-mono text-[11px]">
                      <span className="text-muted-foreground">Last (1m / 5m / 15m):</span>
                      <span className="font-bold text-foreground">
                        {systemStats.cpu.load1m} / {systemStats.cpu.load5m} / {systemStats.cpu.load15m}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RAM Card */}
                <div className="paper-sheet p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground border-b border-border pb-3">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-serif text-base font-semibold">Arbeitsspeicher (RAM)</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Auslastung:</span>
                        <span className="font-bold text-foreground">{systemStats.ram.percent}</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/60">
                        <div
                          className="bg-primary h-full transition-all duration-300 rounded-full"
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
                <div className="paper-sheet p-6 space-y-4 shadow-sm md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-foreground border-b border-border pb-3">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-serif text-base font-semibold">Festplatte & Host</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Partition (/):</span>
                        <span className="font-bold text-foreground">{systemStats.disk.percent}</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/60">
                        <div
                          className="bg-primary h-full transition-all duration-300 rounded-full"
                          style={{ width: systemStats.disk.percent }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs font-mono text-[11px]">
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">Speicher:</span>
                        <span className="font-bold text-foreground">{systemStats.disk.free} frei / {systemStats.disk.total}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-muted-foreground">Betriebssystem:</span>
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
              <div className="paper-sheet p-8 text-center text-muted-foreground text-xs font-mono">
                Systemdaten werden geladen...
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 6: SIMULATION & TEST DATA GENERATOR (SUPERADMIN)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'simulation' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="paper-sheet p-6 space-y-4 shadow-sm">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <span className="paper-stamp text-[10px] uppercase font-mono">
                    Testumgebung
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mt-1">
                    Schul- & Datensatz-Simulation
                  </h2>
                </div>
                <span className="paper-stamp text-[10px] font-mono">Demo-Labor</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generiere realistische Testschulen inklusive Klassen, Schülern und wissenschaftlich plausiblen Fragebogen-Antworten.
                Ideal für Live-Präsentationen (z.B. am 25.09. im Innenministerium Stuttgart) und Testläufe.
              </p>

              {/* Preset Selector */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Simulations-Vorlage wählen:
                </span>
                <div className="grid sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  {[
                    { id: 'standard', title: 'Standard-Schule', desc: '4 Klassen · 100 Schüler' },
                    { id: 'large', title: 'Große Gesamtschule', desc: '8 Klassen · 224 Schüler' },
                    { id: 'small', title: 'Kleine Realschule', desc: '2 Klassen · 40 Schüler' },
                    { id: 'custom', title: 'Individuell', desc: 'Eigene Parameter festlegen' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSimulationPreset(p.id as any)}
                      className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer ${
                        simulationPreset === p.id
                          ? 'border-foreground bg-foreground text-background font-bold shadow-sm'
                          : 'border-border bg-card hover:bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      <span className="block">{p.title}</span>
                      <span className="text-[10px] opacity-80 font-normal">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Inputs */}
              {simulationPreset === 'custom' && (
                <div className="grid sm:grid-cols-3 gap-3 p-4 border border-border bg-muted/20 rounded-xl text-xs font-mono">
                  <div>
                    <label className="block text-muted-foreground uppercase text-[10px] mb-1">Schulname</label>
                    <input
                      type="text"
                      placeholder="z.B. Schiller-Gymnasium"
                      value={customSimData.schoolName}
                      onChange={(e) => setCustomSimData({ ...customSimData, schoolName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
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
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
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
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGenerateSimulation}
                  disabled={generatingSimulation}
                  className="paper-btn-primary !min-h-[40px] !text-xs !py-2 !px-4 cursor-pointer"
                >
                  {generatingSimulation ? 'Generiere Schule & Schülerantworten...' : 'Simulation jetzt starten →'}
                </button>

                {simulations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSimulation(undefined, true)}
                    className="paper-btn-secondary !min-h-[40px] !text-xs !py-2 !px-3.5 text-destructive hover:border-destructive/60 cursor-pointer"
                  >
                    Alle Simulationen löschen
                  </button>
                )}
              </div>
            </div>

            {/* Active Simulations */}
            <div className="paper-sheet p-6 space-y-4 shadow-sm">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-foreground">
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
                  Keine simulierten Schulen aktiv. Wähle oben eine Vorlage und starte die Simulation.
                </p>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {simulations.map((sim) => (
                    <div key={sim.id} className="p-4 border border-border bg-card rounded-xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                        <div>
                          <span className="font-bold text-foreground font-serif text-sm block">
                            {sim.schoolName}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            Lizenzschlüssel: <strong className="text-foreground">{sim.licenseKey}</strong> &middot; PW: schule123
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
                        <div>Schüler: <strong className="text-foreground">{sim.totalStudents}</strong></div>
                        <div>Abgeschlossen: <strong className="text-foreground">{sim.totalCompleted} ({sim.completionRate}%)</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <LegalFooter />
    </div>
  );
}
