/**
 * ============================================================================
 * SERVICIO API: VEHÍCULOS (vehicles.api.ts - POSTGRESQL)
 * ============================================================================
 */

import { http } from "./http";
import type { Vehicle } from "../types/vehicle";
import type { MaybePaginated } from "../types/drf";

export async function listVehiclesApi(): Promise<MaybePaginated<Vehicle>> {
  const { data } = await http.get<MaybePaginated<Vehicle>>("/api/vehicles/");
  return data;
}
