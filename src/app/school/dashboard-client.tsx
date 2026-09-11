'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Leaf,
  LogOut,
  Plus,
  Users,
  Key,
  Copy,
  Check,
  Trash2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';
import { ParticleField } from '@/components/particle-field';

interface ClassData {
  id: string;
  className: string;
  quizMode: number;
  createdAt: string;
  students: {
    id: string;
    accessKey: string;
    isCompleted: boolean;
    completedAt: string | null;
  }[];
  _count: { students: number };
}

export default function SchoolDashboardClient() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [className, setClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [generatingKeys, setGeneratingKeys] = useState<string | null>(null);
  const [keyCount, setKeyCount] = useState(25);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState<number>(60);
  const router = useRouter();

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/school/classes');
      const data = await res.json();
      setClasses(data || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/school/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className, quizMode }),
      });
      if (res.ok) {
        setShowCreate(false);
        setClassName('');
        setQuizMode(60);
        fetchClasses();
      }
    } catch {
      /* ignore */
    }
    setCreating(false);
  };

  const handleGenerateKeys = async (classId: string) => {
    setGeneratingKeys(classId);
    try {
      await fetch(`/api/school/classes/${classId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: keyCount }),
      });
      fetchClasses();
    } catch {
      /* ignore */
    }
    setGeneratingKeys(null);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Klasse und alle verknüpften Zugangscodes wirklich löschen?')) return;
    await fetch(`/api/school/classes/${classId}`, { method: 'DELETE' });
    fetchClasses();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllKeys = (students: ClassData['students']) => {
    const keys = students.map((s) => s.accessKey).join('\n');
    navigator.clipboard.writeText(keys);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const printKeys = (cls: ClassData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Zugangscodes – ${cls.className}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; }
        h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
        p { font-size: 13px; color: #64748b; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .key { border: 2px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; }
        .key-code { font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #065f46; }
        .key-label { font-size: 11px; color: #64748b; margin-top: 4px; }
      </style></head><body>
      <h1>CO₂ Rechner – Zugangscodes</h1>
      <p>Klasse ${cls.className} • ${cls.students.length} Codes • Modus: ${cls.quizMode} Fragen</p>
      <div class="grid">
        ${cls.students.map((s) => `
          <div class="key">
            <div class="key-code">${s.accessKey}</div>
            <div class="key-label">${s.isCompleted ? '✅ Abgeschlossen' : '⬜ Offen'}</div>
          </div>
        `).join('')}
      </div>
      <script>window.print()</script>
      </body></html>
    `);
  };

  const totalStudents = classes.reduce((s, c) => s + c._count.students, 0);
  const totalCompleted = classes.reduce(
    (s, c) => s + c.students.filter((st) => st.isCompleted).length,
    0
  );

  return (
    <div className="min-h-screen relative flex flex-col justify-between pb-12">
      <ParticleField />

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-foreground block leading-tight">
                Schul-Dashboard
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                Umweltmentoren
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/school/analytics"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-muted/60 hover:bg-muted text-foreground transition-all border border-border/60"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistiken</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 animate-scale-in">
          <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Klassen
            </span>
            <div className="text-3xl sm:text-4xl font-black text-foreground font-mono">
              {classes.length}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Schülercodes
            </span>
            <div className="text-3xl sm:text-4xl font-black text-foreground font-mono">
              {totalStudents}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Abgeschlossen
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Klassen & Zugangscodes
            </h2>
            <p className="text-xs text-muted-foreground">
              Verwalte Klassen, generiere Schüler-Codes und drucke Kärtchen für den Unterricht aus.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl gradient-primary text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all btn-bounce cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Neue Klasse anlegen
          </button>
        </div>

        {/* Create Class Form */}
        {showCreate && (
          <div className="bg-card rounded-3xl p-6 border-2 border-emerald-500/30 shadow-md animate-scale-in">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Neue Schulklasse einrichten
            </h3>
            <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="z.B. Klasse 8b"
                required
                className="flex-1 px-4 py-2.5 rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 text-sm font-semibold focus:outline-none"
              />
              <div className="flex gap-2">
                <select
                  value={quizMode}
                  onChange={(e) => setQuizMode(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 text-sm font-semibold focus:outline-none text-foreground"
                >
                  <option value={10}>Kurz (10 Fragen)</option>
                  <option value={30}>Mittel (30 Fragen)</option>
                  <option value={60}>Vollständig (60 Fragen)</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-2xl gradient-primary text-white text-sm font-bold shadow-sm hover:opacity-95 disabled:opacity-50 btn-bounce cursor-pointer shrink-0"
                >
                  {creating ? 'Erstelle...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Classes List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-card rounded-3xl p-8 text-center text-xs text-muted-foreground animate-pulse">
              Klassen werden geladen...
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-card rounded-3xl p-10 text-center border border-border">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-base text-foreground mb-1">Noch keine Klassen angelegt</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Klicke oben auf &quot;Neue Klasse anlegen&quot;, um für deine Schüler:innen Zugangscodes zu generieren.
              </p>
            </div>
          ) : (
            classes.map((cls) => {
              const completed = cls.students.filter((s) => s.isCompleted).length;
              const rate =
                cls._count.students > 0 ? Math.round((completed / cls._count.students) * 100) : 0;

              return (
                <div
                  key={cls.id}
                  className="bg-card rounded-3xl border border-border overflow-hidden shadow-xs"
                >
                  <div className="p-4 sm:p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground">{cls.className}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          {cls.quizMode} Fragen
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                        <span>{cls._count.students} Codes</span>
                        <span>•</span>
                        <span>{completed}/{cls._count.students} abgeschlossen ({rate}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => printKeys(cls)}
                        className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Codes drucken"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        title="Klasse löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedClass(expandedClass === cls.id ? null : cls.id)
                        }
                        className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                        title="Details aufklappen"
                      >
                        {expandedClass === cls.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-5 pb-4">
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded keys section */}
                  {expandedClass === cls.id && (
                    <div className="border-t border-border p-5 bg-muted/30 animate-fade-in">
                      {/* Generate keys */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-foreground">Neue Codes:</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={keyCount}
                            onChange={(e) => setKeyCount(parseInt(e.target.value) || 1)}
                            className="w-16 px-2.5 py-1 text-xs rounded-xl bg-card border border-border text-center font-bold"
                          />
                        </div>

                        <button
                          onClick={() => handleGenerateKeys(cls.id)}
                          disabled={generatingKeys === cls.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gradient-primary text-white text-xs font-bold disabled:opacity-50 btn-bounce cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                          {generatingKeys === cls.id ? 'Generiere...' : 'Generieren'}
                        </button>

                        {cls.students.length > 0 && (
                          <button
                            onClick={() => copyAllKeys(cls.students)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-xs font-bold border border-border transition-colors cursor-pointer"
                          >
                            {copiedKey === 'all' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            Alle Codes kopieren
                          </button>
                        )}
                      </div>

                      {/* Keys Grid */}
                      {cls.students.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {cls.students.map((student) => (
                            <div
                              key={student.id}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
                                student.isCompleted
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                                  : 'bg-card border-border text-foreground'
                              }`}
                            >
                              <span>{student.accessKey}</span>
                              <div className="flex items-center gap-1">
                                {student.isCompleted && (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                )}
                                <button
                                  onClick={() => copyKey(student.accessKey)}
                                  className="hover:text-emerald-500 transition-colors p-0.5 cursor-pointer"
                                  title="Code kopieren"
                                >
                                  {copiedKey === student.accessKey ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Noch keine Zugangscodes für diese Klasse generiert.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
