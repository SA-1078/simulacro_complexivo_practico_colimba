/**
 * ============================================================================
 * SERVICIO API: BITÁCORA DE FLOTA (fleetLogs.api.ts - MONGODB)
 * ============================================================================
 */

import { http } from "./http";
import type { FleetLog, FleetAction, EventSource } from "../types/fleetLog";
import type { MaybePaginated } from "../types/drf";
import { toArray } from "../types/drf";

export async function listFleetLogsApi(): Promise<FleetLog[]> {
  const { data } = await http.get<MaybePaginated<FleetLog>>("/api/fleet_logs/");
  return toArray(data);
}

export type CreateFleetLogPayload = {
  vehicle_id: number;
  action: FleetAction;
  note?: string;
  source: EventSource;
};

export async function createFleetLogApi(payload: CreateFleetLogPayload): Promise<FleetLog> {
  const { data } = await http.post<FleetLog>("/api/fleet_logs/", payload);
  return data;
}

export async function deleteFleetLogApi(id: string): Promise<void> {
  await http.delete(`/api/fleet_logs/${id}/`);
}
