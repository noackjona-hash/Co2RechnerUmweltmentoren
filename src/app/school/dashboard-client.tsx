'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
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
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; color: #1c1917; }
        h1 { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
        p { font-size: 12px; color: #78716c; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .key { border: 1px solid #e7e5df; border-radius: 8px; padding: 12px; text-align: center; }
        .key-code { font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; }
        .key-label { font-size: 10px; color: #78716c; margin-top: 4px; }
      </style></head><body>
      <h1>CO₂-Rechner – Zugangscodes</h1>
      <p>${cls.className} • ${cls.students.length} Codes • Modus: ${cls.quizMode} Fragen</p>
      <div class="grid">
        ${cls.students.map((s) => `
          <div class="key">
            <div class="key-code">${s.accessKey}</div>
            <div class="key-label">${s.isCompleted ? 'Abgeschlossen' : 'Offen'}</div>
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
    <div className="min-h-screen flex flex-col justify-between pb-12 selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border/80">
        <div>
          <span className="font-bold text-base text-foreground block">
            Schul-Dashboard
          </span>
          <span className="text-xs text-muted-foreground block">
            Klassen- und Codeverwaltung
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/school/analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg paper-btn-secondary text-xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistiken</span>
          </Link>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="paper-card p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
              Klassen
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
              {classes.length}
            </div>
          </div>

          <div className="paper-card p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
              Schülercodes
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
              {totalStudents}
            </div>
          </div>

          <div className="paper-card p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
              Abgeschlossen
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
              {totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Klassen
            </h2>
            <p className="text-xs text-muted-foreground">
              Erstelle Klassen und generiere Schüler-Codes.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl paper-btn-primary text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Neue Klasse
          </button>
        </div>

        {/* Create Class Form */}
        {showCreate && (
          <div className="paper-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Neue Klasse anlegen
            </h3>
            <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="z.B. Klasse 8b"
                required
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-xs font-semibold focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <select
                  value={quizMode}
                  onChange={(e) => setQuizMode(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-xs font-semibold focus:outline-none focus:border-primary text-foreground"
                >
                  <option value={10}>Kurz (10 Fragen)</option>
                  <option value={30}>Mittel (30 Fragen)</option>
                  <option value={60}>Vollständig (60 Fragen)</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-lg paper-btn-primary text-xs cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Classes List */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="paper-card p-6 text-center text-xs text-muted-foreground">
              Laden...
            </div>
          ) : classes.length === 0 ? (
            <div className="paper-card p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs text-muted-foreground">
                Noch keine Klassen angelegt.
              </p>
            </div>
          ) : (
            classes.map((cls) => {
              const completed = cls.students.filter((s) => s.isCompleted).length;
              const rate =
                cls._count.students > 0 ? Math.round((completed / cls._count.students) * 100) : 0;

              return (
                <div key={cls.id} className="paper-card overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{cls.className}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground">
                          {cls.quizMode} Fragen
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{cls._count.students} Codes</span>
                        <span>•</span>
                        <span>{completed} abgeschlossen ({rate}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => printKeys(cls)}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Codes drucken"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Klasse löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedClass(expandedClass === cls.id ? null : cls.id)
                        }
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Codes aufklappen"
                      >
                        {expandedClass === cls.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="px-4 pb-3">
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded keys section */}
                  {expandedClass === cls.id && (
                    <div className="border-t border-border p-4 bg-muted/20 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-foreground">Codes generieren:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={keyCount}
                          onChange={(e) => setKeyCount(parseInt(e.target.value) || 1)}
                          className="w-14 px-2 py-1 text-xs rounded border border-border bg-card text-center"
                        />
                        <button
                          onClick={() => handleGenerateKeys(cls.id)}
                          disabled={generatingKeys === cls.id}
                          className="px-3 py-1 rounded paper-btn-primary text-xs cursor-pointer disabled:opacity-50"
                        >
                          <Key className="w-3 h-3 inline mr-1" />
                          {generatingKeys === cls.id ? 'Generiere...' : 'Erzeugen'}
                        </button>

                        {cls.students.length > 0 && (
                          <button
                            onClick={() => copyAllKeys(cls.students)}
                            className="px-3 py-1 rounded paper-btn-secondary text-xs cursor-pointer ml-auto"
                          >
                            {copiedKey === 'all' ? (
                              <Check className="w-3 h-3 inline mr-1 text-primary" />
                            ) : (
                              <Copy className="w-3 h-3 inline mr-1" />
                            )}
                            Alle kopieren
                          </button>
                        )}
                      </div>

                      {/* Keys Grid */}
                      {cls.students.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {cls.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded border border-border bg-card text-xs font-mono"
                            >
                              <span className={student.isCompleted ? 'text-primary font-bold' : ''}>
                                {student.accessKey}
                              </span>
                              <button
                                onClick={() => copyKey(student.accessKey)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                              >
                                {copiedKey === student.accessKey ? (
                                  <Check className="w-3 h-3 text-primary" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Noch keine Codes generiert.
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
