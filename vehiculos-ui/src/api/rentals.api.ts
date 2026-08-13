import { http } from "./http";
    
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Rental = { id: number, 
        vehicle: number, 
        customer_name: string,
        total: number,
        status: string,
        created_at: string
    };

export async function listRentalsApi() {
  const { data } = await http.get<Paginated<Rental>>("/api/rentals/");
  return data; // { count, next, previous, results }
}

export async function createRentalApi(nombre: string) {
  const { data } = await http.post<Rental>("/api/rentals/", { nombre });
  return data;
}

export async function updateRentalApi(id: number, nombre: string) {
  const { data } = await http.put<Rental>(`/api/rentals/${id}/`, { nombre });
  return data;
}

export async function deleteRentalApi(id: number) {
  await http.delete(`/api/rentals/${id}/`);
}
