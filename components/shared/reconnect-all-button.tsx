"use client";

import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Rehace la conexión de todos los celulares y pantallas sin recargar la página
// ni mover la presentación (para cuando alguien se quedó "pegado").
export function ReconnectAllButton({
  onReconnect,
  className,
  compact,
}: {
  onReconnect: () => Promise<unknown>;
  className?: string;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      title="Reconectar a todos (sin recargar ni mover la presentación)"
      onClick={() => {
        setBusy(true);
        onReconnect()
          .then(() => toast.success("Reconectando a todos los dispositivos"))
          .catch((e: Error) => toast.error(e.message))
          .finally(() => setTimeout(() => setBusy(false), 1500));
      }}
      className={cn(
        "flex touch-manipulation items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground active:scale-95 disabled:opacity-50",
        className,
      )}
    >
      <RefreshCwIcon className={cn("size-3.5", busy && "animate-spin")} />
      {!compact && "Reconectar a todos"}
    </button>
  );
}
