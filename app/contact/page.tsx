// ============================================================
// CONTÁCTENOS
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  MessageCircle,
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSettings } from '@/lib/settings';

export default function ContactPage() {
  const { settings } = useSettings();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSending(true);

    // Simulación de envío (pendiente conectar con Resend)
    setTimeout(() => {
      setSuccess(true);
      setSending(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  // Limpiar teléfono para WhatsApp
  const whatsappNumber = (settings.social_whatsapp || '').replace(/\D/g, '');
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, necesito ayuda con mi reserva.')}`
    : '';

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al inicio
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-accent-coral" />
              Contáctenos
            </h1>
            <p className="text-neutral-muted">
              Estamos aquí para ayudarte
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-neutral-border p-6">
                <h2 className="text-xl font-serif font-bold mb-6">
                  Envíanos un mensaje
                </h2>

                {success && (
                  <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Mensaje enviado correctamente. Te responderemos pronto.
                  </div>
                )}

                {error && (
                  <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Tu nombre"
                        className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="¿En qué podemos ayudarte?"
                      className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Cuéntanos con detalle..."
                      className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar mensaje
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Info de contacto */}
            <div className="lg:col-span-1 space-y-4">
              {/* WhatsApp */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl border border-neutral-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-[#25D366]/10 rounded-lg flex items-center justify-center mb-3">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-sm text-neutral-muted">
                    Respuesta inmediata
                  </p>
                </a>
              )}

              {/* Email */}
              {settings.social_email && (
                <a
                  href={`mailto:${settings.social_email}`}
                  className="block bg-white rounded-2xl border border-neutral-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-accent-coral" />
                  </div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-sm text-neutral-muted break-all">
                    {settings.social_email}
                  </p>
                </a>
              )}

              {/* Facebook */}
              {settings.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl border border-neutral-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Facebook</h3>
                  <p className="text-sm text-neutral-muted">
                    Síguenos en redes
                  </p>
                </a>
              )}

              {/* Tiempo de respuesta */}
              <div className="bg-neutral-soft rounded-2xl p-5">
                <h3 className="font-semibold mb-2 text-sm">
                  ⏱️ Tiempo de respuesta
                </h3>
                <p className="text-xs text-neutral-muted">
                  Respondemos en menos de 24 horas hábiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}