// ============================================================
// CÓMO FUNCIONA
// ============================================================

'use client';

import Link from 'next/link';
import {
  Search,
  Calendar,
  CreditCard,
  MessageCircle,
  FileText,
  Wallet,
  Star,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const STEPS = [
  {
    icon: Search,
    title: 'Busca tu casa',
    description:
      'Explora nuestra selección de casas particulares verificadas en toda Cuba. Filtra por ciudad, fechas, huéspedes y precio.',
  },
  {
    icon: Calendar,
    title: 'Elige tus fechas',
    description:
      'Selecciona tu fecha de llegada y salida, e indica cuántos huéspedes viajan. Verás el precio total de tu estancia.',
  },
  {
    icon: CreditCard,
    title: 'Reserva con tu tarjeta',
    description:
      'Ingresa los datos de tu tarjeta para pre-autorizar el fee de plataforma. No se te cobra nada aún, solo se retiene el monto temporalmente.',
  },
  {
    icon: MessageCircle,
    title: 'Confirmación del anfitrión',
    description:
      'Nuestro asistente local contacta al anfitrión para verificar disponibilidad. Esto toma máximo 3 horas. Si no hay disponibilidad, se libera tu retención sin costo.',
  },
  {
    icon: FileText,
    title: 'Recibe tu voucher',
    description:
      'Una vez confirmada tu reserva, recibirás un email con tu voucher digital (PDF con QR). Preséntalo al llegar a la casa.',
  },
  {
    icon: Wallet,
    title: 'Paga la renta en efectivo',
    description:
      'Al llegar a Cuba, pagas la renta directamente al anfitrión en efectivo (USD o EUR). El anfitrión recibe el 100% de su tarifa.',
  },
  {
    icon: Star,
    title: 'Deja tu reseña',
    description:
      'Después de tu estancia, comparte tu experiencia con otros viajeros. Tu opinión ayuda a mejorar la comunidad.',
  },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: 'Anfitrión recibe 100%',
    description: 'Sin comisiones para el anfitrión. El precio que ves es el precio que paga.',
  },
  {
    icon: ShieldCheck,
    title: 'Verificado por locales',
    description: 'Cada casa es visitada y verificada por nuestros asistentes en Cuba.',
  },
  {
    icon: Wallet,
    title: 'Pago en efectivo al llegar',
    description: 'Solo pagas online el fee de plataforma. El resto, en efectivo al anfitrión.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Hero */}
        <section className="bg-gradient-to-br from-accent-coral/20 via-accent-sand/15 to-neutral-soft py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-text mb-4">
              ¿Cómo funciona?
            </h1>
            <p className="text-lg text-neutral-muted max-w-2xl mx-auto">
              Reservar una casa particular en Cuba nunca fue tan fácil y seguro.
              Te explicamos el proceso paso a paso.
            </p>
          </div>
        </section>

        <div className="container-custom py-16">
          {/* Pasos */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              Reserva en 7 simples pasos
            </h2>

            <div className="space-y-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="flex gap-4 md:gap-6 bg-white rounded-2xl border border-neutral-border p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Número + icono */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-14 h-14 bg-accent-coral/10 rounded-full flex items-center justify-center mb-2">
                        <Icon className="w-6 h-6 text-accent-coral" />
                      </div>
                      <span className="text-xs font-bold text-neutral-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 text-neutral-text">
                        {step.title}
                      </h3>
                      <p className="text-neutral-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ventajas */}
          <div className="max-w-4xl mx-auto mt-20">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              ¿Por qué elegirnos?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ADVANTAGES.map((adv, index) => {
                const Icon = adv.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-neutral-border p-6 text-center"
                  >
                    <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-success" />
                    </div>
                    <h3 className="font-semibold mb-2">{adv.title}</h3>
                    <p className="text-sm text-neutral-muted">
                      {adv.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto mt-20 text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-neutral-muted mb-8">
              Explora nuestras casas verificadas y reserva con confianza.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="btn-primary flex items-center justify-center gap-2"
              >
                Buscar casas
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/faq"
                className="btn-outline flex items-center justify-center gap-2"
              >
                Ver preguntas frecuentes
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}