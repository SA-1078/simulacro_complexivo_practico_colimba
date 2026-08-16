/**
 * ============================================================================
 * SERVICIO API: ALQUILERES (rentals.api.ts - POSTGRESQL)
 * ============================================================================
 */

import { http } from "./http";
import type { Rental } from "../types/rental";
import type { MaybePaginated } from "../types/drf";

export async function listRentalsApi(): Promise<MaybePaginated<Rental>> {
  const { data } = await http.get<MaybePaginated<Rental>>("/api/rentals/");
  return data;
}
