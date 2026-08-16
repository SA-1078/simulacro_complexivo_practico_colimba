/**
 * ============================================================================
 * CLIENTE HTTP (AXIOS) CON INTERCEPTOR JWT
 * ============================================================================
 * Inyecta automáticamente el token de autenticación en cada petición y
 * proporciona una función para extraer mensajes de error legibles del backend.
 */

import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para inyectar token en cabecera Authorization
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Extrae mensajes de error legibles devueltos por Django REST Framework (400, 401, 403, 500).
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      if ("detail" in data && typeof data.detail === "string") {
        return data.detail;
      }
      const entries = Object.entries(data);
      if (entries.length > 0) {
        const [field, val] = entries[0];
        const msg = Array.isArray(val) ? val.join(" ") : String(val);
        return `${field}: ${msg}`;
      }
    }
  }
  return fallback;
}