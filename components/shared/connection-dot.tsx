"use client";

import type { ConnectionStatus } from "@/hooks/realtime/use-live-presentation";
import { useQuietStatus } from "@/hooks/realtime/use-quiet-status";
import { cn } from "@/lib/utils";

const LABEL: Record<ConnectionStatus, string> = {
  connecting: "Conectando",
  connected: "En vivo",
  disconnected: "Sin conexión",
};

export function ConnectionDot({ status: raw }: { status: ConnectionStatus }) {
  // Los cortes breves (reconexión automática) no se notan.
  const status = useQuietStatus(raw, 8000);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="relative flex size-2">
        {status === "connected" && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            status === "connected" && "bg-emerald-400",
            status === "connecting" && "bg-amber-400",
            status === "disconnected" && "bg-destructive",
          )}
        />
      </span>
      {LABEL[status]}
    </span>
  );
}
