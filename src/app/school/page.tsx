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
  Download,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Printer,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

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

export default function SchoolDashboard() {
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
      setClasses(data);
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
    if (!confirm('Klasse und alle Zugangscodes wirklich löschen?')) return;
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
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        p { font-size: 12px; color: #666; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .key { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
        .key-code { font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; }
        .key-label { font-size: 10px; color: #999; margin-top: 4px; }
      </style></head><body>
      <h1>CO₂ Rechner – Zugangscodes</h1>
      <p>${cls.className} • ${cls.students.length} Codes • ${cls.quizMode} Fragen</p>
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
    <div className="min-h-screen relative flex flex-col justify-between">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 glass-strong border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Schul-Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/school/analytics"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm hover:bg-muted transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistiken</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-slide-up">
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-2xl font-bold gradient-text">{classes.length}</div>
            <div className="text-sm text-muted-foreground">Klassen</div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-2xl font-bold gradient-text">{totalStudents}</div>
            <div className="text-sm text-muted-foreground">Zugangscodes</div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-2xl font-bold gradient-text">
              {totalStudents > 0
                ? Math.round((totalCompleted / totalStudents) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-muted-foreground">Abgeschlossen</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold">Klassen</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Neue Klasse
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="glass-strong rounded-2xl p-6 animate-scale-in">
            <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="z.B. Klasse 9a"
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              <div className="flex gap-3">
                <select
                  value={quizMode}
                  onChange={(e) => setQuizMode(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none dark:bg-gray-950 text-foreground"
                >
                  <option value={10}>Kurz (10 Fragen)</option>
                  <option value={30}>Mittel (30 Fragen)</option>
                  <option value={60}>Vollständig (60 Fragen)</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-50 shrink-0"
                >
                  {creating ? 'Erstellen...' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Class list */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="glass-strong rounded-2xl p-8 text-center animate-pulse">
              <p className="text-muted-foreground">Laden...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Noch keine Klassen angelegt. Erstelle eine Klasse und generiere
                Zugangscodes.
              </p>
            </div>
          ) : (
            classes.map((cls) => {
              const completed = cls.students.filter(
                (s) => s.isCompleted
              ).length;
              const rate =
                cls._count.students > 0
                  ? Math.round((completed / cls._count.students) * 100)
                  : 0;

              return (
                <div
                  key={cls.id}
                  className="glass-strong rounded-2xl overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{cls.className}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          cls.quizMode === 10
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                            : cls.quizMode === 30
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                        }`}>
                          {cls.quizMode} Fragen
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cls._count.students} Codes
                        </span>
                        <span>
                          {completed}/{cls._count.students} abgeschlossen ({rate}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => printKeys(cls)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                        title="Codes drucken"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedClass(
                            expandedClass === cls.id ? null : cls.id
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
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
                  <div className="px-4 pb-3">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>

                  {expandedClass === cls.id && (
                    <div className="border-t border-border/50 p-4 bg-muted/20 animate-fade-in">
                      {/* Generate keys */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Neue Codes:</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={keyCount}
                            onChange={(e) =>
                              setKeyCount(parseInt(e.target.value) || 1)
                            }
                            className="w-16 px-2 py-1 text-sm rounded-lg bg-muted/50 border border-border text-center"
                          />
                        </div>
                        <button
                          onClick={() => handleGenerateKeys(cls.id)}
                          disabled={generatingKeys === cls.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-semibold disabled:opacity-50"
                        >
                          <Key className="w-3 h-3" />
                          {generatingKeys === cls.id
                            ? 'Generieren...'
                            : 'Generieren'}
                        </button>
                        {cls.students.length > 0 && (
                          <button
                            onClick={() => copyAllKeys(cls.students)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted-foreground/10 text-xs font-medium transition-colors"
                          >
                            {copiedKey === 'all' ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            Alle kopieren
                          </button>
                        )}
                      </div>

                      {/* Keys grid */}
                      {cls.students.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {cls.students.map((student) => (
                            <div
                              key={student.id}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono ${
                                student.isCompleted
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-muted/50'
                              }`}
                            >
                              <span>{student.accessKey}</span>
                              <div className="flex items-center gap-1">
                                {student.isCompleted && (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                )}
                                <button
                                  onClick={() => copyKey(student.accessKey)}
                                  className="hover:text-primary transition-colors"
                                >
                                  {copiedKey === student.accessKey ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Noch keine Zugangscodes generiert.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
