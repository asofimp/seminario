"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_KEY_HEADER, api } from "@/lib/api/client";
import { qaApi, responsesApi } from "@/lib/api/endpoints";
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
  Presentation,
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
  // Clave para el rol de control (por defecto, la del panel /admin).
  controlKey?: string | null,
): UseLivePresentationResult {
  const qc = useQueryClient();
  const storedAdminKey = useAdminStore((s) => s.adminKey);
  const adminKey = controlKey ?? storedAdminKey;
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

    // ---- Reconexión automática ----
    // Socket.IO reintenta solo los cortes de red, pero NO cuando el servidor
    // cierra la conexión (reinicio, Render despertando, error temporal). En ese
    // caso reintentamos nosotros, salvo errores definitivos (clave o código).
    let permanent = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 1000;
    // Nunca corta un intento en curso (eso provoca "WebSocket is closed before
    // the connection is established"): solo conecta si no hay ninguno activo.
    const reconnect = (delay = 0) => {
      if (permanent || socket.connected || socket.active) return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => {
        if (permanent || socket.connected || socket.active) return;
        socket.connect();
      }, delay);
    };

    socket.on("connect", () => {
      setStatus("connected");
      setError(null);
      retryDelay = 1000;
    });
    socket.on("disconnect", (reason) => {
      setStatus("disconnected");
      if (reason === "io server disconnect") {
        reconnect(retryDelay);
        retryDelay = Math.min(retryDelay * 2, 8000);
      }
    });
    socket.on("connect_error", () => {
      setStatus("disconnected");
      if (!socket.active) reconnect(retryDelay);
    });
    socket.on("exception", (err) => {
      const message = typeof err.message === "string" ? err.message : JSON.stringify(err.message);
      // Rechazos de conexión que no se arreglan reintentando.
      if (/invalid key|missing or invalid|not found/i.test(message)) {
        permanent = true;
        setError(message);
      } else if (!/reintentando/i.test(message)) {
        setError(message);
      }
    });

    // Al volver a la app, recuperar la red o volver de otra pestaña: reconectar ya.
    const wake = () => {
      if (document.visibilityState === "visible") reconnect();
    };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    window.addEventListener("pageshow", wake);

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
      clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      window.removeEventListener("pageshow", wake);
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
  // Si el socket se está reconectando, las acciones usan la API REST para no perderse.
  const connected = () => !!socketRef.current?.connected;
  const controlHeaders = adminKey ? { [ADMIN_KEY_HEADER]: adminKey } : undefined;
  // Sin socket no llegan los eventos: aplicamos aquí el estado que devuelve la API.
  const applyState = (state: PresentationState) => {
    const next = qc.setQueryData<PresentationSnapshot>(snapshotKey, (prev) =>
      prev ? { ...prev, presentation: { ...prev.presentation, state } } : prev,
    );
    setSnapshot(next);
    return state;
  };

  const answer = useCallback(
    async (questionId: ObjectId, value: AnswerValue) => {
      const dto = {
        participantId: ensureParticipantId(),
        participantName: participantName ?? undefined,
        questionId,
        value,
      };
      if (connected()) await getSocket().emitWithAck("audience:answer", dto);
      else await responsesApi.submit(code, dto);
    },
     
    [code, ensureParticipantId, participantName],
  );

  const ask = useCallback(
    async (text: string) => {
      const dto = {
        participantId: ensureParticipantId(),
        participantName: participantName ?? "Anónimo",
        text,
      };
      if (connected()) await getSocket().emitWithAck("audience:ask", dto);
      else await qaApi.ask(code, dto);
    },
     
    [code, ensureParticipantId, participantName],
  );

  const updateState = useCallback(
    async (input: UpdateStateInput) => {
      if (connected()) return getSocket().emitWithAck("admin:update-state", input);
      const { data } = await api.patch<Presentation>(
        `/presentations/${encodeURIComponent(code)}/state`,
        input,
        { headers: controlHeaders },
      );
      return applyState(data.state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, adminKey],
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
