// ============================================================
// PREGUNTAS FRECUENTES
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  HelpCircle,
  Home,
  CreditCard,
  ShieldCheck,
  XCircle,
  Wallet,
  MessageCircle,
  Star,
  Car,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface FAQItem {
  icon: any;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    icon: Home,
    question: '¿Cómo reservo una casa?',
    answer:
      'Busca tu destino y fechas en la página principal, elige la casa que más te guste, selecciona tus fechas y huéspedes, y haz clic en "Reservar ahora". Te pediremos tus datos y los de tu tarjeta para pre-autorizar el fee de plataforma. No se te cobrará nada hasta que el anfitrión confirme disponibilidad.',
  },
  {
    icon: CreditCard,
    question: '¿Cómo funciona el pago?',
    answer:
      'Pagas online solo el fee de plataforma (una tarifa fija por reserva). Este monto se retiene temporalmente en tu tarjeta y solo se cobra cuando el anfitrión confirma. La renta de la casa se paga 100% en efectivo (USD o EUR) al llegar al alojamiento. Así el anfitrión recibe el 100% y tú evitas comisiones ocultas.',
  },
  {
    icon: ShieldCheck,
    question: '¿Qué es el KYC y por qué lo necesito?',
    answer:
      'KYC significa "Know Your Customer" (conoce a tu cliente). Antes de reservar, necesitamos verificar tu identidad subiendo una foto de tu pasaporte y su número. Esto nos ayuda a garantizar la seguridad de todos: tú, el anfitrión y la plataforma. Tu información se usa solo para verificar tu identidad y no se comparte con terceros.',
  },
  {
    icon: XCircle,
    question: '¿Puedo cancelar mi reserva?',
    answer:
      'Sí. La política de cancelación depende de cuántos días faltan para tu llegada: más de 30 días antes, reembolso del 100%; entre 7 y 30 días, reembolso del 50%; menos de 7 días, sin reembolso. Si el anfitrión cancela, recibes el 100% de vuelta.',
  },
  {
    icon: Wallet,
    question: '¿Cómo pago la renta en efectivo?',
    answer:
      'Al llegar a la casa, pagas directamente al anfitrión en efectivo (USD o EUR). No se acepta pago con tarjeta en Cuba. Te recomendamos llevar suficiente efectivo para toda tu estancia, ya que los cajeros automáticos son limitados.',
  },
  {
    icon: XCircle,
    question: '¿Qué pasa si el anfitrión rechaza mi reserva?',
    answer:
      'Si el anfitrión no tiene disponibilidad, se libera inmediatamente la retención de tu tarjeta y no se te cobra nada. Te ofreceremos casas alternativas en la misma zona para que puedas elegir otra opción.',
  },
  {
    icon: MessageCircle,
    question: '¿Cómo contacto a mi anfitrión?',
    answer:
      'Una vez confirmada tu reserva, recibirás un email y un voucher con los datos de contacto del anfitrión. También puedes contactar al asistente local que gestiona la casa, quien estará disponible por WhatsApp para ayudarte con cualquier consulta.',
  },
  {
    icon: CreditCard,
    question: '¿Qué incluye el precio?',
    answer:
      'El precio que ves es por noche e incluye el alojamiento. El fee de plataforma es una tarifa fija adicional por reserva. La renta se paga en efectivo al llegar. Algunos servicios adicionales (comidas, tours, taxi) pueden tener costos extra que se pagan directamente al anfitrión.',
  },
  {
    icon: Car,
    question: '¿Puedo pedir un taxi?',
    answer:
      'Sí. Próximamente tendremos un módulo de taxi integrado donde podrás solicitar transporte desde el aeropuerto, entre ciudades o por horas. Mientras tanto, el asistente local puede ayudarte a coordinar tu transporte.',
  },
  {
    icon: Star,
    question: '¿Cómo dejo una reseña?',
    answer:
      'Después de tu estancia, recibirás un email invitándote a dejar tu reseña. También puedes hacerlo desde tu cuenta en "Mis reservas". Tu opinión ayuda a otros viajeros a elegir mejor y a los anfitriones a mejorar su servicio.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
              <HelpCircle className="w-8 h-8 text-accent-coral" />
              Preguntas frecuentes
            </h1>
            <p className="text-neutral-muted">
              Todo lo que necesitas saber antes de reservar
            </p>
          </div>
        </div>

        <div className="container-custom py-8 max-w-3xl">
          {/* Acordeón */}
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-neutral-border overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-neutral-soft/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent-coral" />
                    </div>
                    <span className="flex-1 font-semibold text-neutral-text">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-muted transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pl-19 border-t border-neutral-border">
                      <p className="text-neutral-muted leading-relaxed pt-4">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA final */}
          <div className="mt-12 bg-neutral-soft rounded-2xl p-8 text-center">
            <h2 className="text-xl font-serif font-bold mb-2">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="text-neutral-muted mb-4">
              Contáctanos y te ayudaremos personalmente.
            </p>
            <Link href="/contact" className="btn-primary inline-block">
              Contáctenos
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}