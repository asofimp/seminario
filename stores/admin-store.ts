import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  adminKey: string | null;
  setAdminKey: (key: string | null) => void;
}

// Admin key guardada en localStorage; el cliente axios la envía como x-admin-key.
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      adminKey: null,
      setAdminKey: (adminKey) => set({ adminKey }),
    }),
    { name: "seminario-admin" },
  ),
);
