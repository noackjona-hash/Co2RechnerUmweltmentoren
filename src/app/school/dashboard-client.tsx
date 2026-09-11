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
        body { font-family: 'Courier New', monospace; padding: 32px; color: #1c1917; background: #fff; }
        h1 { font-size: 16px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        p { font-size: 11px; color: #666; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .key { border: 1px solid #1c1917; padding: 12px; text-align: center; }
        .key-code { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
        .key-label { font-size: 9px; text-transform: uppercase; color: #666; margin-top: 4px; }
      </style></head><body>
      <h1>CO₂-Rechner – Zugangscodes · Umweltmentoren</h1>
      <p>Klasse: ${cls.className} · Anzahl: ${cls.students.length} Codes · Fragebogen-Modus: ${cls.quizMode} Fragen</p>
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
    <div className="min-h-screen flex flex-col justify-between pb-12 bg-background">
      {/* Editorial Header */}
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground uppercase tracking-widest">Schulportal</span>
            <span className="text-border">/</span>
            <span className="font-semibold text-foreground uppercase tracking-wider">
              Klassenregister
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/school/analytics"
              className="paper-btn-secondary text-xs"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Statistiken</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="paper-btn-secondary text-xs"
              title="Abmelden"
            >
              <LogOut className="w-3 h-3" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6">
        {/* Ledger Overview Cards */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="paper-sheet p-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              Klassen
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-foreground">
              {classes.length}
            </div>
          </div>

          <div className="paper-sheet p-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              Schülercodes
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-foreground">
              {totalStudents}
            </div>
          </div>

          <div className="paper-sheet p-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              Teilnahmequote
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-foreground">
              {totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground block">
              Verwaltung
            </span>
            <h2 className="text-xl font-serif font-normal text-foreground">
              Klassen & Zugangscodes
            </h2>
          </div>

          <button
            onClick={() => setShowCreate(!showCreate)}
            className="paper-btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Neue Klasse anlegen
          </button>
        </div>

        {/* Create Class Form */}
        {showCreate && (
          <article className="paper-sheet p-5 space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-foreground">
              Klasse neu anlegen
            </h3>
            <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Bezeichnung (z.B. Klasse 8b)"
                required
                className="flex-1 px-3 py-2 border border-border rounded-sm bg-muted/30 text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
              />
              <div className="flex gap-2">
                <select
                  value={quizMode}
                  onChange={(e) => setQuizMode(Number(e.target.value))}
                  className="px-3 py-2 border border-border rounded-sm bg-muted/30 text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
                >
                  <option value={10}>10 Fragen (Kurz)</option>
                  <option value={30}>30 Fragen (Mittel)</option>
                  <option value={60}>60 Fragen (Vollständig)</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="paper-btn-primary text-xs"
                >
                  {creating ? 'Speichern...' : 'Anlegen'}
                </button>
              </div>
            </form>
          </article>
        )}

        {/* Classes List */}
        <div className="space-y-3">
          {loading ? (
            <div className="paper-sheet p-6 text-center font-mono text-xs text-muted-foreground">
              Laden...
            </div>
          ) : classes.length === 0 ? (
            <div className="paper-sheet p-10 text-center space-y-2">
              <Users className="w-6 h-6 text-muted-foreground mx-auto opacity-40" />
              <p className="font-mono text-xs text-muted-foreground">
                Noch keine Klassen angelegt.
              </p>
            </div>
          ) : (
            classes.map((cls) => {
              const completed = cls.students.filter((s) => s.isCompleted).length;
              const rate =
                cls._count.students > 0 ? Math.round((completed / cls._count.students) * 100) : 0;

              return (
                <article key={cls.id} className="paper-sheet overflow-hidden">
                  <div className="p-4 sm:p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <h3 className="font-serif font-normal text-base text-foreground">{cls.className}</h3>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-border bg-muted/40 text-muted-foreground">
                          {cls.quizMode} Fragen
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted-foreground">
                        <span>{cls._count.students} Codes</span>
                        <span>·</span>
                        <span>{completed} abgeschlossen ({rate}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => printKeys(cls)}
                        className="p-1.5 border border-border hover:border-foreground text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Codes drucken"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-1.5 border border-border hover:border-destructive text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Klasse löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedClass(expandedClass === cls.id ? null : cls.id)
                        }
                        className="p-1.5 border border-border hover:border-foreground text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Codes anzeigen"
                      >
                        {expandedClass === cls.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="px-4 pb-3">
                    <div className="w-full h-1 bg-border overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all duration-300"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded keys section */}
                  {expandedClass === cls.id && (
                    <div className="border-t border-border p-4 bg-muted/20 space-y-3 font-mono">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted-foreground uppercase tracking-wider">Codes generieren:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={keyCount}
                          onChange={(e) => setKeyCount(parseInt(e.target.value) || 1)}
                          className="w-14 px-2 py-1 text-xs border border-border bg-card text-center"
                        />
                        <button
                          onClick={() => handleGenerateKeys(cls.id)}
                          disabled={generatingKeys === cls.id}
                          className="paper-btn-primary text-xs"
                        >
                          <Key className="w-3 h-3 inline mr-1" />
                          {generatingKeys === cls.id ? 'Erzeuge...' : 'Erzeugen'}
                        </button>

                        {cls.students.length > 0 && (
                          <button
                            onClick={() => copyAllKeys(cls.students)}
                            className="paper-btn-secondary text-xs ml-auto"
                          >
                            {copiedKey === 'all' ? (
                              <Check className="w-3 h-3 inline mr-1 text-foreground" />
                            ) : (
                              <Copy className="w-3 h-3 inline mr-1" />
                            )}
                            Alle kopieren
                          </button>
                        )}
                      </div>

                      {/* Keys Grid */}
                      {cls.students.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                          {cls.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between px-2.5 py-1.5 border border-border bg-card text-xs font-mono"
                            >
                              <span className={student.isCompleted ? 'text-foreground font-bold' : 'text-muted-foreground'}>
                                {student.accessKey}
                              </span>
                              <button
                                onClick={() => copyKey(student.accessKey)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                              >
                                {copiedKey === student.accessKey ? (
                                  <Check className="w-3 h-3 text-foreground" />
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
                </article>
              );
            })
          )}
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
