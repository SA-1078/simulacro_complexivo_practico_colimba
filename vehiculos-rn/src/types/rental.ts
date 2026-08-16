/**
 * ============================================================================
 * TIPOS: ALQUILERES (rental.ts - POSTGRESQL)
 * ============================================================================
 */

export type RentalStatus = "RESERVED" | "ACTIVE" | "CLOSED" | "CANCELLED";

export type Rental = {
  id: number;
  vehicle: number;
  vehicle_plate?: string;
  vehicle_brand?: string;
  customer_name: string;
  total: number;
  status: RentalStatus;
  created_at?: string;
};
