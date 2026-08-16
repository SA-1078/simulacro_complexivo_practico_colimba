/**
 * ============================================================================
 * SERVICIO API: ALQUILERES (RENTALS - POSTGRESQL)
 * ============================================================================
 */

import { http } from "./http";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

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

export async function listRentalsApi() {
  const { data } = await http.get<Paginated<Rental>>("/api/rentals/");
  return data;
}

export async function createRentalApi(payload: Omit<Rental, "id" | "created_at" | "vehicle_plate" | "vehicle_brand">) {
  const { data } = await http.post<Rental>("/api/rentals/", payload);
  return data;
}

export async function updateRentalApi(id: number, payload: Partial<Omit<Rental, "id" | "created_at" | "vehicle_plate" | "vehicle_brand">>) {
  const { data } = await http.patch<Rental>(`/api/rentals/${id}/`, payload);
  return data;
}

export async function deleteRentalApi(id: number) {
  await http.delete(`/api/rentals/${id}/`);
}
