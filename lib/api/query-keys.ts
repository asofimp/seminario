import type { ObjectId } from "@/lib/types/api";

// Claves centralizadas de React Query para invalidar/actualizar caché sin typos.
export const queryKeys = {
  surveys: {
    all: ["surveys"] as const,
    detail: (id: ObjectId) => ["surveys", id] as const,
  },
  presentations: {
    all: ["presentations"] as const,
    snapshot: (code: string) =>
      ["presentations", code.toUpperCase(), "snapshot"] as const,
  },
  results: {
    presentation: (code: string) =>
      ["results", code.toUpperCase()] as const,
    question: (code: string, questionId: ObjectId) =>
      ["results", code.toUpperCase(), questionId] as const,
  },
};
