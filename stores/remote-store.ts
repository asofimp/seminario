import { create } from "zustand";
import { persist } from "zustand/middleware";

// Permiso que dio el backend a la clave del control remoto.
export type RemoteAccess = { role: "admin" } | { role: "presenter"; phase: number };

interface RemoteState {
  key: string | null;
  access: RemoteAccess | null;
  login: (key: string, access: RemoteAccess) => void;
  logout: () => void;
}

// Sesión del control remoto (/remote), separada del panel /admin.
export const useRemoteStore = create<RemoteState>()(
  persist(
    (set) => ({
      key: null,
      access: null,
      login: (key, access) => set({ key, access }),
      logout: () => set({ key: null, access: null }),
    }),
    { name: "seminario-remote" },
  ),
);
