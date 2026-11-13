"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_KEY_HEADER, api } from "@/lib/api/client";
import { analyticsApi, presentationsApi, qaApi, responsesApi } from "@/lib/api/endpoints";
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
  // Rehace la conexión de todos los clientes (celulares y pantallas).
  reconnectAll: () => Promise<PresentationState>;
  next: () => Promise<PresentationState>;
  prev: () => Promise<PresentationState>;
}

// Logs de diagnóstico de la conexión en la consola del navegador ("[ws] …").
// Se desactivan con localStorage.setItem("seminario-debug-ws", "0").
const wsDebug = () => {
  try {
    return localStorage.getItem("seminario-debug-ws") !== "0";
  } catch {
    return true;
  }
};
const wsLog = (tag: string, ...args: unknown[]) => {
  if (!wsDebug()) return;
  const t = new Date().toLocaleTimeString("es", { hour12: false });
  console.info(`[ws ${t}] ${tag}`, ...args);
};

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
  // Cambiar este número rehace el socket (la pantalla conserva lo que muestra).
  const [connKey, setConnKey] = useState(0);
  // Último reconnectNonce visto (null = aún no se ha visto ninguno).
  const nonceRef = useRef<number | null>(null);
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
    // Si ya cargó la presentación una vez, un rechazo posterior es temporal
    // (reinicio del servidor, base de datos despertando): nunca se rinde.
    let loadedOnce = !!qc.getQueryData(snapshotKey);
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

    const tag = `${role}:${code}#${connKey}`;
    wsLog(tag, "creando conexión");
    socket.io.on("reconnect_attempt", (n) => wsLog(tag, `reintento ${n}`));
    socket.io.on("reconnect", (n) => wsLog(tag, `reconectado tras ${n} intento(s)`));
    socket.io.on("error", (err) => wsLog(tag, "error del manager:", err.message));

    socket.on("connect", () => {
      const transport = socket.io.engine?.transport.name;
      wsLog(tag, `conectado id=${socket.id} transporte=${transport}`);
      socket.io.engine?.once("upgrade", (t) => wsLog(tag, `transporte mejorado a ${t.name}`));
      setStatus("connected");
      setError(null);
      retryDelay = 1000;
    });
    socket.on("disconnect", (reason, details) => {
      wsLog(tag, `desconectado motivo=${reason}`, details ?? "");
      setStatus("disconnected");
      if (reason === "io server disconnect") {
        reconnect(retryDelay);
        retryDelay = Math.min(retryDelay * 2, 8000);
      }
    });
    socket.on("connect_error", (err) => {
      const e = err as Error & { description?: unknown; context?: unknown; type?: string };
      wsLog(tag, `error al conectar: ${e.message}`, { type: e.type, description: e.description, context: e.context, active: socket.active });
      setStatus("disconnected");
      if (!socket.active) reconnect(retryDelay);
    });
    socket.on("exception", (err) => {
      const message = typeof err.message === "string" ? err.message : JSON.stringify(err.message);
      wsLog(tag, `excepción del servidor: ${message}`);
      // Rechazos de conexión que no se arreglan reintentando.
      if (/invalid key|missing or invalid|not found/i.test(message) && !loadedOnce) {
        permanent = true;
        setError(message);
      } else if (!/reintentando/i.test(message)) {
        setError(message);
      }
    });

    // Al volver a la app, recuperar la red o volver de otra pestaña: reconectar ya.
    const wake = (e: Event) => {
      if (document.visibilityState === "visible" && !socket.connected) wsLog(tag, `despertar (${e.type}): reconectando`);
      if (document.visibilityState === "visible") reconnect();
    };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    window.addEventListener("pageshow", wake);

    socket.on("presentation:snapshot", (s) => {
      checkNonce(s.presentation.state.reconnectNonce);
      loadedOnce = true;
      writeSnapshot(() => s);
    });

    // Respaldo cada 5 s mientras no hay socket:
    // 1) si el cliente quedó inactivo sin reintento pendiente, lo despierta;
    // 2) sigue la presentación por REST (diapositiva, resultados, preguntas),
    //    así la pantalla nunca se queda congelada aunque el socket tarde.
    // Revisión de salud cada 15 s con el socket "conectado": si el estado del
    // servidor no coincide con lo que mostramos, la conexión quedó colgada
    // (zombi): nos ponemos al día y la rehacemos, sin recargar la página.
    // (Cada 30 s + desfase al azar para no llegar todos juntos al servidor.)
    const applyState = (state: PresentationState) =>
      writeSnapshot((prev) =>
        prev ? { ...prev, presentation: { ...prev.presentation, state } } : prev,
      );
    const healthCheck = () => {
      if (!socket.connected || document.visibilityState !== "visible") return;
      const local = qc.getQueryData<PresentationSnapshot>(snapshotKey)?.presentation.state;
      presentationsApi
        .state(code)
        .then(({ state: remote }) => {
          if (local && JSON.stringify(remote) !== JSON.stringify(local)) {
            wsLog(tag, "revisión de salud: el estado no coincide (conexión zombi), rehaciendo la conexión");
            applyState(remote);
            nonceRef.current = remote.reconnectNonce ?? 0;
            setConnKey((k) => k + 1);
          }
        })
        .catch(() => {});
    };
    let health: ReturnType<typeof setInterval> | undefined;
    const healthStart = setTimeout(() => {
      health = setInterval(healthCheck, 30000);
    }, Math.random() * 30000);

    // (Cada 8 s; pide solo lo necesario: estado ligero, y resultados o
    // preguntas solo cuando la diapositiva los usa.)
    const watchdog = setInterval(() => {
      if (socket.connected) return;
      wsLog(tag, `sin socket: respaldo por REST (activo=${socket.active}, definitivo=${permanent})`);
      if (!permanent && !socket.active) socket.connect();
      if (!loadedOnce && permanent) return;
      const current = qc.getQueryData<PresentationSnapshot>(snapshotKey);
      const load = current
        ? presentationsApi.state(code).then(({ state }) => {
            const changed = JSON.stringify(state) !== JSON.stringify(current.presentation.state);
            if (changed) applyState(state);
            return { state, changed };
          })
        : presentationsApi.snapshot(code).then((s) => {
            writeSnapshot(() => s);
            return { state: s.presentation.state, changed: true };
          });
      load
        .then(({ state, changed }) => {
          loadedOnce = true;
          checkNonce(state.reconnectNonce);
          const qid = state.currentQuestionId;
          if (qid && state.acceptingResponses !== undefined && (role !== "audience" || state.showResultsToAudience)) {
            void analyticsApi.question(code, qid).then(setResults).catch(() => {});
          }
          if (changed || state.audienceView === "qa") {
            void qaApi.list(code).then(setQa).catch(() => {});
          }
        })
        .catch(() => {});
    }, 8000);
    // Si quien presenta pide "reconectar a todos", rehacemos la conexión.
    const checkNonce = (nonce: number | undefined) => {
      const n = nonce ?? 0;
      if (nonceRef.current === null) nonceRef.current = n;
      else if (n !== nonceRef.current) {
        wsLog(tag, "“reconectar a todos” recibido: rehaciendo la conexión");
        nonceRef.current = n;
        retryTimer = setTimeout(() => setConnKey((k) => k + 1), Math.random() * 4000);
      }
    };

    socket.on("presentation:state", (state) => {
      checkNonce(state.reconnectNonce);
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
      clearInterval(watchdog);
      clearTimeout(healthStart);
      clearInterval(health);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      window.removeEventListener("pageshow", wake);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
    // snapshotKey deriva de code
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, role, adminKey, qc, connKey]);

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
  const reconnectAll = useCallback(
    () => updateState({ reconnectNonce: Math.floor(Date.now() / 1000) }),
    [updateState],
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
    reconnectAll,
    next,
    prev,
  };
}
