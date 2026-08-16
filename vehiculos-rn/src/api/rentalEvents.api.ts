/**
 * ============================================================================
 * SERVICIO API: EVENTOS OPERATIVOS (rentalEvents.api.ts - MONGODB)
 * ============================================================================
 */

import { http } from "./http";
import type { RentalEvent, RentalEventType, EventSource } from "../types/rentalEvent";
import type { MaybePaginated } from "../types/drf";
import { toArray } from "../types/drf";

export async function listRentalEventsApi(): Promise<RentalEvent[]> {
  const { data } = await http.get<MaybePaginated<RentalEvent>>("/api/rental_events/");
  return toArray(data);
}

export type CreateRentalEventPayload = {
  rental_id: number;
  event_type: RentalEventType;
  source: EventSource;
  note?: string;
};

export async function createRentalEventApi(payload: CreateRentalEventPayload): Promise<RentalEvent> {
  const { data } = await http.post<RentalEvent>("/api/rental_events/", payload);
  return data;
}

export async function deleteRentalEventApi(id: string): Promise<void> {
  await http.delete(`/api/rental_events/${id}/`);
}
