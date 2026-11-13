"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { queryKeys } from "@/lib/api/query-keys";
import {
  createLiveSocket,
  type ClientRole,
  type LiveSocket,
} from "@/lib/socket/live-socket";
import type {
  AnswerValue,
  AudienceQuestion,
  ObjectId,
  PresentationSnapshot,
  PresentationState,
  QuestionResults,
  UpdateStateInput,
} from "@/lib/types/api";
import { useAdminStore } from "@/stores/admin-store";
import { useParticipantStore } from "@/stores/participant-store";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface UseLivePresentationResult {
  status: ConnectionStatus;
  error: string | null;
  snapshot: PresentationSnapshot | undefined;
  state: PresentationState | undefined;
  results: QuestionResults | null;
  participants: number;
  // ronda de preguntas (todos los roles la reciben)
  qa: AudienceQuestion[];
  // audience
  answer: (questionId: ObjectId, value: AnswerValue) => Promise<void>;
  ask: (text: string) => Promise<void>;
  // admin
  updateState: (input: UpdateStateInput) => Promise<PresentationState>;
  next: () => Promise<PresentationState>;
  prev: () => Promise<PresentationState>;
}

const ACK_TIMEOUT_MS = 5_000;

// Conecta al namespace /live con el rol indicado y vuelca los eventos en la
// caché de React Query (snapshot) y en estado local (resultados, participantes).
export function useLivePresentation(
  code: string,
  role: ClientRole,
): UseLivePresentationResult {
  const qc = useQueryClient();
  const adminKey = useAdminStore((s) => s.adminKey);
  const ensureParticipantId = useParticipantStore((s) => s.ensureParticipantId);
  const snapshotKey = queryKeys.presentations.snapshot(code);

  const socketRef = useRef<LiveSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuestionResults | null>(null);
  const [participants, setParticipants] = useState(0);
  const [qa, setQa] = useState<AudienceQuestion[]>([]);
  const participantName = useParticipantStore((s) => s.name);
  const [snapshot, setSnapshot] = useState<PresentationSnapshot | undefined>(
    () => qc.getQueryData(snapshotKey),
  );

  useEffect(() => {
    const socket = createLiveSocket({
      code,
      role,
      adminKey: role === "admin" ? (adminKey ?? undefined) : undefined,
    });
    socketRef.current = socket;

    const writeSnapshot = (
      updater: (prev?: PresentationSnapshot) => PresentationSnapshot | undefined,
    ) => {
      const next = qc.setQueryData<PresentationSnapshot>(snapshotKey, updater);
      setSnapshot(next);
    };

    socket.on("connect", () => {
      setStatus("connected");
      setError(null);
    });
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", (err) => {
      setStatus("disconnected");
      setError(err.message);
    });
    socket.on("exception", (err) =>
      setError(
        typeof err.message === "string"
          ? err.message
          : JSON.stringify(err.message),
      ),
    );
    socket.on("presentation:snapshot", (s) => writeSnapshot(() => s));
    socket.on("presentation:state", (state) => {
      writeSnapshot((prev) =>
        prev ? { ...prev, presentation: { ...prev.presentation, state } } : prev,
      );
      // Al cambiar de pregunta, los resultados anteriores dejan de aplicar.
      setResults((r) => (r?.questionId === state.currentQuestionId ? r : null));
    });
    socket.on("results:update", setResults);
    socket.on("participants:count", setParticipants);
    socket.on("qa:update", setQa);

    socket.connect();
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
    // snapshotKey deriva de code
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, role, adminKey, qc]);

  const getSocket = () => {
    const s = socketRef.current;
    if (!s?.connected) throw new Error("Socket no conectado");
    return s.timeout(ACK_TIMEOUT_MS);
  };

  const answer = useCallback(
    async (questionId: ObjectId, value: AnswerValue) => {
      await getSocket().emitWithAck("audience:answer", {
        participantId: ensureParticipantId(),
        participantName: participantName ?? undefined,
        questionId,
        value,
      });
    },
    [ensureParticipantId, participantName],
  );

  const ask = useCallback(
    async (text: string) => {
      await getSocket().emitWithAck("audience:ask", {
        participantId: ensureParticipantId(),
        participantName: participantName ?? "Anónimo",
        text,
      });
    },
    [ensureParticipantId, participantName],
  );

  const updateState = useCallback(
    (input: UpdateStateInput) =>
      getSocket().emitWithAck("admin:update-state", input),
    [],
  );
  const next = useCallback(() => getSocket().emitWithAck("admin:next"), []);
  const prev = useCallback(() => getSocket().emitWithAck("admin:prev"), []);

  return {
    status,
    error,
    snapshot,
    state: snapshot?.presentation.state,
    results,
    participants,
    qa,
    answer,
    ask,
    updateState,
    next,
    prev,
  };
}
