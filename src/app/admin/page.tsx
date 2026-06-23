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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

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

export default function AdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    contactEmail: '',
    password: '',
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const fetchLicenses = async () => {
    try {
      const res = await fetch('/api/admin/licenses');
      const data = await res.json();
      setLicenses(data);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowCreate(false);
        setFormData({ schoolName: '', contactEmail: '', password: '' });
        fetchLicenses();
      }
    } catch {
      /* ignore */
    }
    setCreating(false);
  };

  const toggleLicense = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/licenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchLicenses();
  };

  const deleteLicense = async (id: string) => {
    if (!confirm('Lizenz und alle zugehörigen Daten wirklich löschen?')) return;
    await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' });
    fetchLicenses();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const totalStudents = licenses.reduce(
    (sum, l) => sum + l.classes.reduce((s, c) => s + c._count.students, 0),
    0
  );

  return (
    <div className="min-h-screen relative">
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
            <span className="font-bold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
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
            <div className="text-2xl font-bold gradient-text">{licenses.length}</div>
            <div className="text-sm text-muted-foreground">Schulen</div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-2xl font-bold gradient-text">
              {licenses.reduce((s, l) => s + l.classes.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Klassen</div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-2xl font-bold gradient-text">{totalStudents}</div>
            <div className="text-sm text-muted-foreground">Schüler:innen</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold">Schullizenzen</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Neue Lizenz
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="glass-strong rounded-2xl p-6 animate-scale-in">
            <h3 className="text-lg font-bold mb-4">Neue Schullizenz erstellen</h3>
            <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Schulname</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Max-Planck-Gymnasium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kontakt E-Mail
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="schule@example.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passwort</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Sicheres Passwort"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl hover:bg-muted text-sm transition-all"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-50 transition-all"
                >
                  {creating ? 'Erstellen...' : 'Lizenz erstellen'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* License list */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <p className="text-muted-foreground animate-pulse">Laden...</p>
            </div>
          ) : licenses.length === 0 ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <School className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Noch keine Lizenzen erstellt.
              </p>
            </div>
          ) : (
            licenses.map((license) => (
              <div
                key={license.id}
                className="glass-strong rounded-2xl overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        license.isActive ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <h3 className="font-semibold">{license.schoolName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {license.contactEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-mono">
                      <Key className="w-3 h-3" />
                      {license.licenseKey}
                      <button
                        onClick={() => copyKey(license.licenseKey)}
                        className="ml-1 hover:text-primary transition-colors"
                      >
                        {copiedKey === license.licenseKey ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {license.classes.reduce(
                        (s, c) => s + c._count.students,
                        0
                      )}
                    </div>

                    <button
                      onClick={() => toggleLicense(license.id, license.isActive)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      title={license.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    >
                      {license.isActive ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteLicense(license.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setExpandedLicense(
                          expandedLicense === license.id ? null : license.id
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      {expandedLicense === license.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedLicense === license.id && (
                  <div className="border-t border-border/50 p-4 bg-muted/20 animate-fade-in">
                    <div className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-mono mb-3">
                      <Key className="w-3 h-3" />
                      {license.licenseKey}
                      <button
                        onClick={() => copyKey(license.licenseKey)}
                        className="ml-1"
                      >
                        {copiedKey === license.licenseKey ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Erstellt:{' '}
                      {new Date(license.createdAt).toLocaleDateString('de-DE')}
                    </p>
                    {license.classes.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold mb-1">Klassen:</p>
                        {license.classes.map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-muted/50"
                          >
                            <span>{cls.className}</span>
                            <span className="text-xs text-muted-foreground">
                              {cls._count.students} Schüler:innen
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Noch keine Klassen angelegt.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
