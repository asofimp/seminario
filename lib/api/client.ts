import axios, { AxiosError } from "axios";
import { API_URL } from "@/lib/env";
import { useAdminStore } from "@/stores/admin-store";
import type { ApiErrorBody } from "@/lib/types/api";

export const ADMIN_KEY_HEADER = "x-admin-key";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta la admin key (si existe) a todas las peticiones. El backend solo la
// exige en las rutas protegidas con AdminKeyGuard.
api.interceptors.request.use((config) => {
  const adminKey = useAdminStore.getState().adminKey;
  if (adminKey) config.headers.set(ADMIN_KEY_HEADER, adminKey);
  return config;
});

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Normaliza los errores de Nest a ApiError con un mensaje legible.
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorBody>) => {
    const raw = err.response?.data;
    const body = typeof raw === "object" && raw !== null ? raw : undefined;
    // Sin respuesta JSON de Nest = el backend no respondió (caído o el proxy
    // /api de Next no pudo conectar).
    if (!err.response || !body) {
      return Promise.reject(
        new ApiError(
          "No se pudo conectar con el backend",
          err.response?.status ?? null,
        ),
      );
    }
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? err.message);
    return Promise.reject(
      new ApiError(message, err.response?.status ?? null, body),
    );
  },
);
