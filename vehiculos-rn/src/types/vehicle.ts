/**
 * ============================================================================
 * TIPOS: VEHÍCULOS (vehicle.ts - POSTGRESQL)
 * ============================================================================
 */

export type Vehicle = {
  id: number;
  plate: string;
  brand: string;
  daily_rate: number;
  is_available: boolean;
};
