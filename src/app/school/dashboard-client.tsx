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
  Link2,
  GraduationCap,
  Edit2,
  X,
  Mail,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LegalFooter } from '@/components/legal-footer';

interface ClassData {
  id: string;
  className: string;
  teacherName?: string | null;
  teacherEmail?: string | null;
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
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [quizMode, setQuizMode] = useState<number>(60);
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherEmail, setEditTeacherEmail] = useState('');
  const [editQuizMode, setEditQuizMode] = useState<number>(60);
  const [updating, setUpdating] = useState(false);

  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [generatingKeys, setGeneratingKeys] = useState<string | null>(null);
  const [keyCount, setKeyCount] = useState(25);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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
        body: JSON.stringify({
          className,
          teacherName,
          teacherEmail,
          quizMode,
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setClassName('');
        setTeacherName('');
        setTeacherEmail('');
        setQuizMode(60);
        fetchClasses();
      }
    } catch {
      /* ignore */
    }
    setCreating(false);
  };

  const openEditModal = (cls: ClassData) => {
    setEditingClass(cls);
    setEditClassName(cls.className);
    setEditTeacherName(cls.teacherName || '');
    setEditTeacherEmail(cls.teacherEmail || '');
    setEditQuizMode(cls.quizMode || 60);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/school/classes/${editingClass.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: editClassName,
          teacherName: editTeacherName,
          teacherEmail: editTeacherEmail,
          quizMode: editQuizMode,
        }),
      });
      if (res.ok) {
        setEditingClass(null);
        fetchClasses();
      }
    } catch {
      /* ignore */
    }
    setUpdating(false);
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
    if (!confirm('Klasse und alle zugehörigen Zugangscodes wirklich löschen?')) return;
    await fetch(`/api/school/classes/${classId}`, { method: 'DELETE' });
    fetchClasses();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyDirectLink = (key: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/join/${key}`;
    navigator.clipboard.writeText(link);
    setCopiedKey(`link-${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllKeys = (students: ClassData['students']) => {
    const keys = students.map((s) => s.accessKey).join('\n');
    navigator.clipboard.writeText(keys);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllDirectLinks = (students: ClassData['students']) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const links = students.map((s, idx) => `Schüler ${idx + 1}: ${origin}/join/${s.accessKey}`).join('\n');
    navigator.clipboard.writeText(links);
    setCopiedKey('all-links');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const printKeys = (cls: ClassData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    printWindow.document.write(`
      <html><head><title>Zugangscodes – ${cls.className}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #1c1917; background: #fff; }
        h1 { font-size: 18px; font-weight: bold; margin-bottom: 4px; color: #047857; }
        p { font-size: 12px; color: #666; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .key { border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 14px; text-align: center; background: #f8fafc; }
        .key-code { font-size: 18px; font-family: monospace; font-weight: bold; letter-spacing: 2px; color: #0f172a; }
        .key-link { font-size: 9px; color: #475569; margin-top: 6px; word-break: break-all; }
        .key-label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-top: 6px; }
        .teacher-info { font-size: 11px; color: #475569; margin-bottom: 8px; }
      </style></head><body>
      <h1>CO₂-Rechner · Zugangscodes für Schüler:innen</h1>
      <p>Klasse: <strong>${cls.className}</strong> ${cls.teacherName ? `· Lehrkraft: <strong>${cls.teacherName}</strong>` : ''} · ${cls.students.length} Schülercodes · Modus: ${cls.quizMode} Fragen</p>
      <div class="grid">
        ${cls.students.map((s) => `
          <div class="key">
            <div class="key-code">${s.accessKey}</div>
            <div class="key-link">${origin}/join/${s.accessKey}</div>
            <div class="key-label">${s.isCompleted ? '✓ Abgeschlossen' : 'Offen'}</div>
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
      {/* Modern Header */}
      <header className="w-full border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              UM
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground tracking-tight block">
                Schulportal · Umweltmentoren
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Klassen- und Lehrkräfteverwaltung
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/school/analytics"
              className="paper-btn-secondary text-xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statistiken</span>
            </Link>
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="paper-sheet p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                Klassen insgesamt
              </span>
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {classes.length}
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="paper-sheet p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                Schüler-Zugangscodes
              </span>
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {totalStudents}
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
          </div>

          <div className="paper-sheet p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                Ausgefüllte Tests
              </span>
              <div className="text-3xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
                <span>{totalCompleted}</span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ({totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Section Header & Create Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Klassen & Lehrkräfte
            </h2>
            <p className="text-xs text-muted-foreground">
              Verwalte Klassen, weise Lehrkräfte zu und erstelle Zugangscodes oder Direktlinks für Schüler:innen.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(!showCreate)}
            className="paper-btn-primary text-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Neue Klasse & Lehrkraft anlegen</span>
          </button>
        </div>

        {/* Create Class Form */}
        {showCreate && (
          <article className="paper-sheet p-6 space-y-4 border-emerald-500/30 bg-card shadow-sm animate-fade-in">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Neue Klasse & Lehrkraft einrichten
                </h3>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Klassenbezeichnung <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="z.B. Klasse 9b oder 10a Biologie"
                    required
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Fragebogen-Umfang
                  </label>
                  <select
                    value={quizMode}
                    onChange={(e) => setQuizMode(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                  >
                    <option value={10}>10 Fragen (Kurz · ca. 5 Min)</option>
                    <option value={30}>30 Fragen (Mittel · ca. 12 Min)</option>
                    <option value={60}>60 Fragen (Vollständig · ca. 20 Min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Name der Lehrkraft
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="z.B. Frau Schneider oder Herr Dr. Weber"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    E-Mail der Lehrkraft (optional)
                  </label>
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="z.B. schneider@schule.de"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="paper-btn-secondary text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="paper-btn-primary text-xs"
                >
                  {creating ? 'Wird angelegt...' : 'Klasse anlegen'}
                </button>
              </div>
            </form>
          </article>
        )}

        {/* Classes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="paper-sheet p-8 text-center text-xs text-muted-foreground">
              Lade Klassen und Lehrkräfte...
            </div>
          ) : classes.length === 0 ? (
            <div className="paper-sheet p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Noch keine Klassen angelegt</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Lege deine erste Klasse an und weise die zuständige Lehrkraft zu, um Schülercodes zu erstellen.
              </p>
            </div>
          ) : (
            classes.map((cls) => {
              const completed = cls.students.filter((s) => s.isCompleted).length;
              const rate =
                cls._count.students > 0 ? Math.round((completed / cls._count.students) * 100) : 0;

              return (
                <article key={cls.id} className="paper-sheet overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-foreground tracking-tight">
                          {cls.className}
                        </h3>
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                          {cls.quizMode} Fragen
                        </span>
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {cls._count.students} Schüler:innen ({rate}% fertig)
                        </span>
                      </div>

                      {/* Teacher Attribution */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {cls.teacherName ? (
                          <span>
                            Lehrkraft: <strong className="text-foreground font-medium">{cls.teacherName}</strong>
                            {cls.teacherEmail && (
                              <span className="text-muted-foreground ml-1.5 font-mono text-[11px]">
                                ({cls.teacherEmail})
                              </span>
                            )}
                          </span>
                        ) : (
                          <button
                            onClick={() => openEditModal(cls)}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs cursor-pointer font-medium"
                          >
                            + Lehrkraft eintragen
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => openEditModal(cls)}
                        className="p-2 rounded-xl border border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Klasse & Lehrkraft bearbeiten"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => printKeys(cls)}
                        className="p-2 rounded-xl border border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Codes & Direktlinks drucken"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-2 rounded-xl border border-border hover:border-destructive/40 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                        title="Klasse löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedClass(expandedClass === cls.id ? null : cls.id)
                        }
                        className="paper-btn-secondary text-xs ml-1"
                      >
                        <span>Codes ({cls._count.students})</span>
                        {expandedClass === cls.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section: Student Codes & Direct Links */}
                  {expandedClass === cls.id && (
                    <div className="border-t border-border/80 p-5 bg-muted/20 space-y-4">
                      {/* Batch Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={keyCount}
                            onChange={(e) => setKeyCount(Number(e.target.value))}
                            className="w-18 px-2.5 py-1.5 border border-border rounded-xl bg-card text-xs text-foreground font-mono focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            onClick={() => handleGenerateKeys(cls.id)}
                            disabled={generatingKeys === cls.id}
                            className="paper-btn-primary text-xs"
                          >
                            <Key className="w-3 h-3" />
                            <span>
                              {generatingKeys === cls.id ? 'Generiere...' : 'Codes generieren'}
                            </span>
                          </button>
                        </div>

                        {cls.students.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => copyAllDirectLinks(cls.students)}
                              className="paper-btn-secondary text-xs"
                              title="Alle Direktlinks für die Klasse kopieren"
                            >
                              {copiedKey === 'all-links' ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Link2 className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>Direktlinks kopieren</span>
                            </button>
                            <button
                              onClick={() => copyAllKeys(cls.students)}
                              className="paper-btn-secondary text-xs"
                            >
                              {copiedKey === 'all' ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Alle Codes</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Keys Grid */}
                      {cls.students.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                          {cls.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-card text-xs font-mono shadow-2xs hover:border-emerald-500/40 transition-colors"
                            >
                              <span className={student.isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-foreground'}>
                                {student.accessKey}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => copyDirectLink(student.accessKey)}
                                  className="text-muted-foreground hover:text-emerald-600 cursor-pointer p-0.5"
                                  title="Direktlink für Schüler:in kopieren"
                                >
                                  {copiedKey === `link-${student.accessKey}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Link2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => copyKey(student.accessKey)}
                                  className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                  title="Code kopieren"
                                >
                                  {copiedKey === student.accessKey ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Noch keine Schülercodes generiert. Klicke oben auf &quot;Codes generieren&quot;.
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

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-card rounded-2xl p-6 border border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Klasse & Lehrkraft bearbeiten
                </h3>
              </div>
              <button
                onClick={() => setEditingClass(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Klassenbezeichnung
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Zuständige Lehrkraft
                </label>
                <input
                  type="text"
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  placeholder="z.B. Frau Schneider"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  E-Mail der Lehrkraft
                </label>
                <input
                  type="email"
                  value={editTeacherEmail}
                  onChange={(e) => setEditTeacherEmail(e.target.value)}
                  placeholder="z.B. schneider@schule.de"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Fragen-Umfang
                </label>
                <select
                  value={editQuizMode}
                  onChange={(e) => setEditQuizMode(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-xs text-foreground focus:outline-none focus:border-emerald-500"
                >
                  <option value={10}>10 Fragen (Kurz)</option>
                  <option value={30}>30 Fragen (Mittel)</option>
                  <option value={60}>60 Fragen (Vollständig)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="paper-btn-secondary text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="paper-btn-primary text-xs"
                >
                  {updating ? 'Speichern...' : 'Änderungen speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LegalFooter />
    </div>
  );
}
