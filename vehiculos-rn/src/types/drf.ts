/**
 * ============================================================================
 * TIPOS: DRF PAGINADO Y UTILIDADES (drf.ts)
 * ============================================================================
 */

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type MaybePaginated<T> = Paginated<T> | T[];

export function toArray<T>(data: MaybePaginated<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}
