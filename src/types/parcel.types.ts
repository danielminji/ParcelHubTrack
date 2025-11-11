/**
 * Parcel Type Definitions
 */

export type ParcelStatus =
  | 'EXPECTED'
  | 'ARRIVED_UNCLAIMED'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'RETURNED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'WAIVED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'QR_CODE' | 'CARD' | 'ONLINE';

export interface Parcel {
  id: string;
  tracking_id: string;
  recipient_id: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  weight_kg: number | null;
  storage_location: string | null;
  storage_zone: string | null;
  fee_amount: number | null;
  fee_currency: string;
  payment_status: PaymentStatus;
  payment_method: string | null;
  status: ParcelStatus;
  is_damaged: boolean;
  is_fragile: boolean;
  requires_signature: boolean;
  expected_arrival_date: Date | null;
  arrived_at: Date | null;
  ready_for_pickup_at: Date | null;
  collected_at: Date | null;
  created_at: Date;
  updated_at: Date;
  checked_in_by: string | null;
  checked_out_by: string | null;
  notes: string | null;
  damage_description: string | null;
  photo_urls: string[] | null;
}

export interface CreateParcelInput {
  tracking_id: string;
  courier?: string;
  recipient_id?: string;
  expected_arrival_date?: Date;
}

export interface CheckInParcelInput {
  trackingId: string;
  courier?: string;
  weightKg: number;
  dimensionsCm?: string;
  isDamaged?: boolean;
  notes?: string;
}

export interface CheckOutParcelInput {
  parcelId: string;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
}

export interface ParcelWithRecipient extends Parcel {
  recipient?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
}
