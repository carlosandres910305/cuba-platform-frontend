// ============================================================
// ADMIN: CASAS (CRUD COMPLETO)
// ============================================================
// Permite:
// - Listar casas
// - Crear casa nueva
// - Editar casa
// - Desactivar/Activar casa
// - Asignar asistente
// - Subir fotos y videos
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Users,
  Plus,
  Edit,
  Eye,
  EyeOff,
  X,
  Save,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MediaUploader from '@/components/property/MediaUploader';
import { apiFetch, apiPublic } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Property } from '@/types/property';

interface Assistant {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PropertyForm {
  code: string;
  name: string;
  description: string;
  descriptionEn: string;
  descriptionFr: string;
  address: string;
  city: string;
  province: string;
  trueLatitude: string;
  trueLongitude: string;
  fuzzedLatitude: string;
  fuzzedLongitude: string;
  rentalPrice: string;
  rentalCurrency: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
  amenitiesEn: string;
  amenitiesFr: string;
  facebookUrl: string;
  ownerName: string;
  ownerPhone: string;
  assistantId: string;
}

const EMPTY_FORM: PropertyForm = {
  code: '',
  name: '',
  description: '',
  descriptionEn: '',
  descriptionFr: '',
  address: '',
  city: '',
  province: '',
  trueLatitude: '',
  trueLongitude: '',
  fuzzedLatitude: '',
  fuzzedLongitude: '',
  rentalPrice: '',
  rentalCurrency: 'USD',
  maxGuests: '4',
  bedrooms: '2',
  bathrooms: '1',
  amenities: '',
  amenitiesEn: '',
  amenitiesFr: '',
  facebookUrl: '',
  ownerName: '',
  ownerPhone: '',
  assistantId: '',
};

export default function AdminPropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<any[]>([]);

  // Redirigir si no es admin
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user && user.role !== 'admin') router.push('/');
  }, [user, authLoading, router]);

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsData, usersData] = await Promise.all([
        apiPublic<Property[]>('/properties'),
        apiFetch<Assistant[]>('/users'),
      ]);
      setProperties(propsData);
      setAssistants(usersData.filter((u) => u.role === 'assistant'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Cambiar campo del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setForm(EMPTY_FORM);
    setEditingCode(null);
    setMedia([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abrir formulario para editar
  const handleEdit = (property: Property) => {
    setForm({
      code: property.code,
      name: property.name,
      description: property.description || '',
      descriptionEn: (property as any).descriptionEn || '',
      descriptionFr: (property as any).descriptionFr || '',
      address: property.address || '',
      city: property.city,
      province: property.province,
      trueLatitude: (property as any).trueLatitude?.toString() || '',
      trueLongitude: (property as any).trueLongitude?.toString() || '',
      fuzzedLatitude: (property as any).fuzzedLatitude?.toString() || '',
      fuzzedLongitude: (property as any).fuzzedLongitude?.toString() || '',
      rentalPrice: property.rentalPrice.toString(),
      rentalCurrency: property.rentalCurrency,
      maxGuests: property.maxGuests.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      amenities: (property.amenities || []).join(', '),
      amenitiesEn: ((property as any).amenitiesEn || []).join(', '),
      amenitiesFr: ((property as any).amenitiesFr || []).join(', '),
      facebookUrl: property.facebookUrl || '',
      ownerName: (property as any).ownerName || '',
      ownerPhone: (property as any).ownerPhone || '',
      assistantId: (property as any).assistantId || '',
    });
    setEditingCode(property.code);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cargar los medios de esta propiedad
    apiPublic<any[]>(`/properties/${property.code}/media`)
      .then((data) => setMedia(data))
      .catch(() => setMedia([]));
  };

  // Guardar (crear o editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        code: form.code,
        name: form.name,
        description: form.description,
        descriptionEn: form.descriptionEn || null,
        descriptionFr: form.descriptionFr || null,
        address: form.address,
        city: form.city,
        province: form.province,
        trueLatitude: parseFloat(form.trueLatitude) || 0,
        trueLongitude: parseFloat(form.trueLongitude) || 0,
        fuzzedLatitude: parseFloat(form.fuzzedLatitude) || 0,
        fuzzedLongitude: parseFloat(form.fuzzedLongitude) || 0,
        rentalPrice: parseFloat(form.rentalPrice) || 0,
        rentalCurrency: form.rentalCurrency,
        maxGuests: parseInt(form.maxGuests) || 1,
        bedrooms: parseInt(form.bedrooms) || 1,
        bathrooms: parseInt(form.bathrooms) || 1,
        amenities: form.amenities.split(',').map((a) => a.trim()).filter((a) => a !== ''),
        amenitiesEn: form.amenitiesEn.split(',').map((a) => a.trim()).filter((a) => a !== ''),
        amenitiesFr: form.amenitiesFr.split(',').map((a) => a.trim()).filter((a) => a !== ''),
        facebookUrl: form.facebookUrl || null,
        ownerName: form.ownerName || null,
        ownerPhone: form.ownerPhone || null,
        assistantId: form.assistantId || null,
      };

      if (editingCode) {
        await apiFetch(`/properties/${editingCode}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/properties', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingCode(null);
      setMedia([]);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Alternar estado (Activo / Inactivo)
  const handleToggleStatus = async (property: Property) => {
    const newStatus = property.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activar' : 'desactivar';

    if (!confirm(`¿Estás seguro que deseas ${actionText} la casa ${property.name}?`)) return;

    try {
      await apiFetch(`/properties/${property.code}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar el estado');
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
        {/* Encabezado con gradiente */}
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
                  <Home className="w-8 h-8 text-accent-coral" />
                  Casas
                </h1>
                <p className="text-neutral-muted">
                  {properties.length} casa{properties.length !== 1 ? 's' : ''} registrada{properties.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva casa
              </button>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Formulario */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-accent-coral/30 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold">
                  {editingCode ? `Editar casa ${editingCode}` : 'Nueva casa'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(EMPTY_FORM);
                    setEditingCode(null);
                    setMedia([]);
                  }}
                  className="text-neutral-muted hover:text-error"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Datos básicos */}
              <h3 className="font-semibold text-sm text-neutral-muted uppercase mb-3">Datos básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Código *</label>
                  <input type="text" name="code" value={form.code} onChange={handleChange} required disabled={!!editingCode} placeholder="HAV-001" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Casa Colonial Vedado" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción (Español) *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description (English)</label>
                  <textarea name="descriptionEn" value={form.descriptionEn} onChange={handleChange} rows={3} placeholder="Optional" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description (Français)</label>
                  <textarea name="descriptionFr" value={form.descriptionFr} onChange={handleChange} rows={3} placeholder="Optionnel" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {/* Ubicación */}
              <h3 className="font-semibold text-sm text-neutral-muted uppercase mb-3">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Dirección *</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} required className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad *</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Provincia *</label>
                  <input type="text" name="province" value={form.province} onChange={handleChange} required className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latitud real</label>
                  <input type="number" step="0.0000001" name="trueLatitude" value={form.trueLatitude} onChange={handleChange} className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitud real</label>
                  <input type="number" step="0.0000001" name="trueLongitude" value={form.trueLongitude} onChange={handleChange} className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latitud fuzzed (pública)</label>
                  <input type="number" step="0.0000001" name="fuzzedLatitude" value={form.fuzzedLatitude} onChange={handleChange} className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitud fuzzed (pública)</label>
                  <input type="number" step="0.0000001" name="fuzzedLongitude" value={form.fuzzedLongitude} onChange={handleChange} className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {/* Detalles */}
              <h3 className="font-semibold text-sm text-neutral-muted uppercase mb-3">Detalles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio por noche *</label>
                  <input type="number" name="rentalPrice" value={form.rentalPrice} onChange={handleChange} required min="0" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Moneda *</label>
                  <select name="rentalCurrency" value={form.rentalCurrency} onChange={handleChange} className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Habitaciones *</label>
                  <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} required min="1" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Baños *</label>
                  <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} required min="1" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Máx. huéspedes *</label>
                  <input type="number" name="maxGuests" value={form.maxGuests} onChange={handleChange} required min="1" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Comodidades en Español (separadas por coma)</label>
                  <input type="text" name="amenities" value={form.amenities} onChange={handleChange} placeholder="wifi, ac, agua caliente" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Amenities in English (comma-separated)</label>
                  <input type="text" name="amenitiesEn" value={form.amenitiesEn} onChange={handleChange} placeholder="wifi, ac, hot water" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Équipements en Français (séparés par des virgules)</label>
                  <input type="text" name="amenitiesFr" value={form.amenitiesFr} onChange={handleChange} placeholder="wifi, clim, eau chaude" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">URL de Facebook (opcional)</label>
                  <input type="url" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del dueño</label>
                  <input type="text" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Juan Pérez" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono del dueño (WhatsApp)</label>
                  <input type="tel" name="ownerPhone" value={form.ownerPhone} onChange={handleChange} placeholder="+53 5 123 4567" className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {/* Asignación */}
              <h3 className="font-semibold text-sm text-neutral-muted uppercase mb-3">Asignación</h3>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Asistente asignado</label>
                <select name="assistantId" value={form.assistantId} onChange={handleChange} className="w-full md:w-1/2 px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Sin asignar</option>
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </div>

              {/* Fotos y videos */}
              {editingCode && (
                <MediaUploader
                  propertyCode={editingCode}
                  media={media}
                  onMediaChange={setMedia}
                />
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-neutral-border">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : editingCode ? 'Guardar cambios' : 'Crear casa'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(EMPTY_FORM);
                    setEditingCode(null);
                    setMedia([]);
                  }}
                  className="btn-outline"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
          )}

          {/* Lista */}
          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <Home className="w-16 h-16 text-neutral-muted mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-neutral-muted mb-4">No hay casas registradas.</p>
              <button onClick={handleCreate} className="btn-primary">Crear primera casa</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const isActive = property.status === 'active';
                
                return (
                  <div key={property.id} className={`bg-white rounded-xl border p-6 transition-shadow ${isActive ? 'border-neutral-border hover:shadow-md' : 'border-error/30 bg-neutral-soft/50 opacity-80'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-neutral-muted">{property.code}</span>
                        {!isActive && (
                          <span className="text-[10px] uppercase font-bold text-error bg-error/10 px-2 py-0.5 rounded-sm w-fit">Inactiva</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(property)} className="text-neutral-muted hover:text-accent-coral" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(property)} className={isActive ? 'text-neutral-muted hover:text-error' : 'text-neutral-muted hover:text-success'} title={isActive ? 'Desactivar casa' : 'Activar casa'}>
                          {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-1">{property.name}</h3>
                    <p className="text-sm text-neutral-muted flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {property.city}, {property.province}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-neutral-muted mb-3">
                      <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {property.maxGuests}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        ${property.rentalPrice} {property.rentalCurrency}
                      </p>
                      <Link href={`/properties/${property.code}`} className="text-xs text-accent-coral hover:underline font-semibold">
                        Ver ficha →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}