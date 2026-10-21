// ============================================================
// ADMIN: CONFIGURACIÓN
// ============================================================
// Lista todos los settings editables.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Save, Check, X, History } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  isCritical: boolean;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user && user.role !== 'admin') router.push('/');
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Setting[]>('/settings');
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      await apiFetch(`/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value: editValue }),
      });
      setEditingKey(null);
      setEditValue('');
      await fetchSettings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-neutral-muted">Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/admin"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al panel
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-accent-coral" />
                  Configuración
                </h1>
                <p className="text-neutral-muted">
                  {settings.length} parámetros configurables
                </p>
              </div>
              <Link
                href="/admin/settings/history"
                className="btn-outline flex items-center gap-2 text-sm"
              >
                <History className="w-4 h-4" />
                Ver historial
              </Link>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neutral-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-soft">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold">
                    Clave
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">
                    Valor
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {settings.map((setting) => {
                  const isEditing = editingKey === setting.key;

                  return (
                    <tr key={setting.id} className="border-t border-neutral-border">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{setting.key}</span>
                          {setting.isCritical && (
                            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                              crítico
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-3 py-1.5 border border-neutral-border rounded-lg text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm">{setting.value || '(vacío)'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleSave(setting.key)}
                              disabled={saving}
                              className="text-success hover:opacity-80 disabled:opacity-50"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="text-error hover:opacity-80"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingKey(setting.key);
                              setEditValue(setting.value);
                            }}
                            className="text-neutral-muted hover:text-accent-coral"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}