// ============================================================
// BOOKING STATUS BADGE
// ============================================================

'use client';

import { BookingStatus } from '@/types/booking';
import { useLanguage } from '@/lib/language';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

// Configuración de cada estado (colores y estilos)
const STATUS_CONFIG: Record<BookingStatus, { className: string }> = {
  pending_authorization: {
    className: 'bg-neutral-soft text-neutral-muted',
  },
  awaiting_host: {
    className: 'bg-warning/10 text-warning border border-warning',
  },
  confirmed: {
    className: 'bg-success/10 text-success border border-success',
  },
  rejected_by_host: {
    className: 'bg-error/10 text-error border border-error',
  },
  communication_timeout: {
    className: 'bg-neutral-soft text-neutral-muted border border-neutral-border',
  },
  cancelled_by_guest: {
    className: 'bg-neutral-soft text-neutral-muted border border-neutral-border',
  },
  cancelled_by_host: {
    className: 'bg-error/10 text-error border border-error',
  },
  disputed: {
    className: 'bg-error/10 text-error border border-error',
  },
};

export default function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { t } = useLanguage();
  
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_authorization;
  const label = t(`status.${status}`);

  return (
    <span
      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${config.className}`}
    >
      {label}
    </span>
  );
}