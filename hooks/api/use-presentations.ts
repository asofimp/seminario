"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { presentationsApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  CreatePresentationInput,
  Presentation,
  PresentationSnapshot,
  UpdateStateInput,
} from "@/lib/types/api";

export function usePresentations() {
  return useQuery({
    queryKey: queryKeys.presentations.all,
    queryFn: presentationsApi.list,
  });
}

export function usePresentationSnapshot(code: string | undefined) {
  return useQuery({
    queryKey: queryKeys.presentations.snapshot(code ?? ""),
    queryFn: () => presentationsApi.snapshot(code!),
    enabled: !!code,
  });
}

export function useCreatePresentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePresentationInput) =>
      presentationsApi.create(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.presentations.all }),
  });
}

// Mantiene el snapshot cacheado en sync con la respuesta del backend.
function useSyncPresentation() {
  const qc = useQueryClient();
  return (p: Presentation) =>
    qc.setQueryData<PresentationSnapshot>(
      queryKeys.presentations.snapshot(p.code),
      (prev) => (prev ? { ...prev, presentation: p } : prev),
    );
}

export function useUpdatePresentationState(code: string) {
  const sync = useSyncPresentation();
  return useMutation({
    mutationFn: (input: UpdateStateInput) =>
      presentationsApi.updateState(code, input),
    onSuccess: sync,
  });
}

export function useEndPresentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => presentationsApi.end(code),
    onSuccess: (p) => {
      qc.setQueryData<PresentationSnapshot>(
        queryKeys.presentations.snapshot(p.code),
        (prev) => (prev ? { ...prev, presentation: p } : prev),
      );
      qc.invalidateQueries({ queryKey: queryKeys.presentations.all });
    },
  });
}

export function usePresentationStep(code: string) {
  const sync = useSyncPresentation();
  return useMutation({
    mutationFn: (direction: "next" | "prev") =>
      direction === "next"
        ? presentationsApi.next(code)
        : presentationsApi.prev(code),
    onSuccess: sync,
  });
}
