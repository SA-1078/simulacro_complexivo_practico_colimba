/**
 * ============================================================================
 * TIPOS: EVENTOS OPERATIVOS (rentalEvent.ts - MONGODB)
 * ============================================================================
 */

export type RentalEventType =
  | "CREATED"
  | "PICKED_UP"
  | "RETURNED"
  | "PAID"
  | "CANCELLED";

export type EventSource = "WEB" | "MOBILE" | "SYSTEM";

export type RentalEvent = {
  id: string;
  rental_id: number;
  event_type: RentalEventType;
  source: EventSource;
  note?: string;
  created_at?: string;
};
