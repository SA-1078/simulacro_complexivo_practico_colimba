/**
 * ============================================================================
 * CLIENTE HTTP (AXIOS) CON INTERCEPTOR GLOBAL DE JWT (http.ts)
 * ============================================================================
 * Inyecta dinámicamente el accessToken almacenado en memoria global.
 */

import axios from "axios";
import { API_BASE_URL } from "../config";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

type GlobalAuthStore = {
  accessToken?: string;
  refreshToken?: string;
};

// Inyectar Authorization: Bearer <token>
http.interceptors.request.use((config) => {
  const store = globalThis as unknown as GlobalAuthStore;
  const token = store.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
