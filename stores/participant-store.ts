import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ParticipantState {
  participantId: string | null;
  // Nombre que escribe el participante al unirse (se muestra en sus preguntas).
  name: string | null;
  setName: (name: string) => void;
  // Devuelve el id existente o crea uno nuevo (solo en el navegador).
  ensureParticipantId: () => string;
}

// Identificador anónimo y estable del participante: el backend hace upsert por
// (presentación, pregunta, participantId), así que reutilizarlo permite cambiar el voto.
export const useParticipantStore = create<ParticipantState>()(
  persist(
    (set, get) => ({
      participantId: null,
      name: null,
      setName: (name) => set({ name: name.trim() || null }),
      ensureParticipantId: () => {
        const current = get().participantId;
        if (current) return current;
        const id = crypto.randomUUID();
        set({ participantId: id });
        return id;
      },
    }),
    { name: "seminario-participant" },
  ),
);
