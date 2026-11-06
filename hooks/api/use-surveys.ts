"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { surveysApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import type { CreateSurveyInput, ObjectId } from "@/lib/types/api";

export function useSurveys() {
  return useQuery({ queryKey: queryKeys.surveys.all, queryFn: surveysApi.list });
}

export function useSurvey(id: ObjectId | undefined) {
  return useQuery({
    queryKey: queryKeys.surveys.detail(id ?? ""),
    queryFn: () => surveysApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSurveyInput) => surveysApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.surveys.all }),
  });
}

export function useReplaceSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: ObjectId; input: CreateSurveyInput }) =>
      surveysApi.replace(id, input),
    onSuccess: (survey) => {
      qc.setQueryData(queryKeys.surveys.detail(survey._id), survey);
      qc.invalidateQueries({ queryKey: queryKeys.surveys.all });
    },
  });
}

export function useDeleteSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ObjectId) => surveysApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.surveys.all }),
  });
}
