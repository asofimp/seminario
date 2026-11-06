"use client";

import { useMutation } from "@tanstack/react-query";
import { responsesApi } from "@/lib/api/endpoints";
import type { AnswerValue, ObjectId } from "@/lib/types/api";
import { useParticipantStore } from "@/stores/participant-store";

// Envía (o reemplaza) la respuesta del participante a la pregunta actual vía REST.
// Alternativa en tiempo real: useLivePresentation().answer(...)
export function useSubmitResponse(code: string) {
  const ensureParticipantId = useParticipantStore((s) => s.ensureParticipantId);
  return useMutation({
    mutationFn: ({
      questionId,
      value,
    }: {
      questionId: ObjectId;
      value: AnswerValue;
    }) =>
      responsesApi.submit(code, {
        participantId: ensureParticipantId(),
        questionId,
        value,
      }),
  });
}
