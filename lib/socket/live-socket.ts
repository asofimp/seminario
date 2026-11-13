import { io, type Socket } from "socket.io-client";
import { WS_URL } from "@/lib/env";
import type {
  AskQuestionInput,
  AudienceQuestion,
  PresentationSnapshot,
  PresentationState,
  QuestionResults,
  SubmitResponseInput,
  UpdateStateInput,
} from "@/lib/types/api";

export type ClientRole = "audience" | "screen" | "admin";

// Eventos que emite el servidor (ver seminario-be/src/realtime/live.gateway.ts).
export interface ServerToClientEvents {
  "presentation:snapshot": (snapshot: PresentationSnapshot) => void;
  "presentation:state": (state: PresentationState) => void;
  "results:update": (results: QuestionResults) => void;
  "participants:count": (count: number) => void;
  "qa:update": (questions: AudienceQuestion[]) => void;
  exception: (err: { status: string; message: unknown }) => void;
}

// Mensajes que acepta el servidor. El último argumento es el ack (respuesta).
export interface ClientToServerEvents {
  "audience:answer": (
    dto: SubmitResponseInput,
    ack: (res: { ok: true }) => void,
  ) => void;
  "audience:ask": (dto: AskQuestionInput, ack: (res: { ok: true }) => void) => void;
  "admin:update-state": (
    dto: UpdateStateInput,
    ack: (state: PresentationState) => void,
  ) => void;
  "admin:next": (ack: (state: PresentationState) => void) => void;
  "admin:prev": (ack: (state: PresentationState) => void) => void;
}

export type LiveSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface LiveSocketOptions {
  code: string;
  role: ClientRole;
  adminKey?: string;
}

export function createLiveSocket({
  code,
  role,
  adminKey,
}: LiveSocketOptions): LiveSocket {
  return io(`${WS_URL}/live`, {
    auth: { code, role, adminKey },
    // WebSocket primero; si la red lo bloquea (proxies, Wi-Fi de campus),
    // cae a long-polling por HTTP en vez de quedarse sin conexión.
    transports: ["websocket", "polling"],
    tryAllTransports: true,
    autoConnect: false,
    // Reintentos rápidos y sin límite (p. ej. Render despertando o redes móviles).
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
    // Render (plan gratuito) puede tardar en despertar: no cortar el intento antes.
    timeout: 30000,
  });
}
