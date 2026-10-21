// ============================================================
// TIPOS DE RESERVA
// ============================================================

export interface Booking {
  id: string;
  code: string;
  guestId: string;
  propertyId: string;
  assistantId?: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  rentalAmount: number;
  rentalCurrency: string;
  platformFeeCharged: number;
  platformFeeCurrency: string;
  status: BookingStatus;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  
  guest?: BookingGuest;
  voucher?: BookingVoucher;
  review?: any;
  ownerNotified?: boolean;
  ownerNotifiedAt?: string;
  property?: BookingProperty & {
    ownerName?: string;
    ownerPhone?: string;
};
}
export type BookingStatus =
  | 'pending_authorization'
  | 'awaiting_host'
  | 'confirmed'
  | 'rejected_by_host'
  | 'communication_timeout'
  | 'cancelled_by_guest'
  | 'cancelled_by_host'
  | 'disputed';

export interface BookingProperty {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  province: string;
  rentalPrice: number;
  rentalCurrency: string;
  media?: { url: string; type: string }[];
}

export interface BookingGuest {
  id: string;
  name: string;
  email: string;
}

export interface BookingVoucher {
  id: string;
  qrCode: string;
  pdfUrl: string;
  issuedAt: string;
}