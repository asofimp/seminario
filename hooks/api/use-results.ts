"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import type { ObjectId } from "@/lib/types/api";

export function usePresentationResults(code: string | undefined) {
  return useQuery({
    queryKey: queryKeys.results.presentation(code ?? ""),
    queryFn: () => analyticsApi.presentation(code!),
    enabled: !!code,
  });
}

export function useQuestionResults(
  code: string | undefined,
  questionId: ObjectId | null | undefined,
) {
  return useQuery({
    queryKey: queryKeys.results.question(code ?? "", questionId ?? ""),
    queryFn: () => analyticsApi.question(code!, questionId!),
    enabled: !!code && !!questionId,
  });
}
