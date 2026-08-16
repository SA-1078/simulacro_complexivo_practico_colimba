/**
 * ============================================================================
 * TIPOS: BITÁCORA DE FLOTA (fleetLog.ts - MONGODB)
 * ============================================================================
 */

export type FleetAction = "CREATED" | "UPDATED" | "MAINTENANCE" | "DISABLED";
export type EventSource = "SYSTEM" | "MOBILE" | "WEB";

export type FleetLog = {
  id: string;
  vehicle_id: number;
  action: FleetAction;
  note?: string;
  source: EventSource;
  created_at?: string;
};
