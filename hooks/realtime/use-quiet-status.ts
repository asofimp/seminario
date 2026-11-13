"use client";

import { useEffect, useState } from "react";
import type { ConnectionStatus } from "./use-live-presentation";

// Estado de conexión "silencioso": los cortes cortos no se muestran.
// Devuelve "connected" hasta que la desconexión dura más de `delayMs`.
export function useQuietStatus(status: ConnectionStatus, delayMs: number): ConnectionStatus {
  const [shown, setShown] = useState<ConnectionStatus>("connected");
  useEffect(() => {
    if (status === "connected") {
      const t = setTimeout(() => setShown("connected"), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown(status), delayMs);
    return () => clearTimeout(t);
  }, [status, delayMs]);
  return shown;
}
