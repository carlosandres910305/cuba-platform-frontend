// ============================================================
// TIPOS DE PROPIEDAD
// ============================================================

export interface Property {
  id: string;
  code: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  rentalPrice: number;
  rentalCurrency: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  facebookUrl?: string;
  status: string;
  media?: PropertyMedia[];
  reviews?: Review[];
  fuzzedLatitude?: number;
  fuzzedLongitude?: number;
}

export interface PropertyMedia {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
}

export interface Review {
  id: string;
  ratingOverall: number;
  comment?: string;
  guest?: { id: string; name: string };
}