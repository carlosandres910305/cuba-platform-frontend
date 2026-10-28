// ============================================================
// ADMIN: USUARIOS
// ============================================================
// Lista todos los usuarios y permite gestionar roles, editarlos o eliminarlos.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Edit,
  X,
  Check,
  Trash2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  passportVerified?: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  guest: { label: 'Huésped', color: 'bg-accent-sand/20 text-accent-sand' },
  assistant: { label: 'Asistente', color: 'bg-accent-coral/20 text-accent-coral' },
  admin: { label: 'Admin', color: 'bg-primary/10 text-primary' },
  auditor: { label: 'Auditor', color: 'bg-success/20 text-success' },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Estados para Edición (Ahora guardamos un objeto completo)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });

  // Formulario de crear
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'assistant',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user && user.role !== 'admin') router.push('/');
  }, [user, authLoading, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<User[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setShowCreateForm(false);
      setForm({ name: '', email: '', password: '', role: 'assistant' });
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setCreating(false);
    }
  };

  // Nueva función para guardar la edición completa
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await apiFetch(`/users/${editingUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
        }),
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  // Nueva función para eliminar usuario
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro que deseas eliminar a ${name}? Esta acción no se puede deshacer.`)) return;

    try {
      await apiFetch(`/users/${id}`, {
        method: 'DELETE',
      });
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar. Puede que tenga reservas asociadas.');
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
                  <Users className="w-8 h-8 text-accent-coral" />
                  Usuarios
                </h1>
                <p className="text-neutral-muted">
                  {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {showCreateForm ? 'Cancelar' : 'Nuevo usuario'}
              </button>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Formulario de crear */}
          {showCreateForm && (
            <form
              onSubmit={handleCreate}
              className="bg-white rounded-2xl border border-neutral-border p-6 mb-6"
            >
              <h2 className="text-lg font-semibold mb-4">Crear nuevo usuario</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="assistant">Asistente</option>
                    <option value="admin">Admin</option>
                    <option value="auditor">Auditor</option>
                    <option value="guest">Huésped</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="mt-4 btn-primary disabled:opacity-50"
              >
                {creating ? 'Creando...' : 'Crear usuario'}
              </button>
            </form>
          )}

          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Lista */}
          <div className="bg-white rounded-2xl border border-neutral-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-soft">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Usuario</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Rol</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleConfig = ROLE_LABELS[u.role] || ROLE_LABELS.guest;
                  const isEditing = editingUser?.id === u.id;

                  return (
                    <tr key={u.id} className="border-t border-neutral-border">
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <p className="font-semibold">{u.name || 'Sin nombre'}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-muted">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="px-3 py-1.5 border border-neutral-border rounded-lg text-sm"
                          >
                            <option value="guest">Huésped</option>
                            <option value="assistant">Asistente</option>
                            <option value="admin">Admin</option>
                            <option value="auditor">Auditor</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${roleConfig.color}`}>
                            {roleConfig.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex gap-3 justify-end">
                            <button onClick={handleUpdateUser} className="text-success hover:opacity-80">
                              <Check className="w-5 h-5" />
                            </button>
                            <button onClick={() => setEditingUser(null)} className="text-error hover:opacity-80">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditForm({ name: u.name, email: u.email, role: u.role });
                              }}
                              className="text-neutral-muted hover:text-accent-coral"
                              title="Editar usuario"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-neutral-muted hover:text-error"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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