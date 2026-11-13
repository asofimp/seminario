"use client";

import { Loader2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ConnectionStatus } from "@/hooks/realtime/use-live-presentation";
import { useQuietStatus } from "@/hooks/realtime/use-quiet-status";
import { cn } from "@/lib/utils";

// Aviso flotante mientras el socket se recupera solo (no hace falta recargar).
export function ReconnectBanner({ status: raw, className }: { status: ConnectionStatus; className?: string }) {
  // Solo aparece si la reconexión tarda (los cortes cortos son invisibles).
  const status = useQuietStatus(raw, 15000);
  return (
    <AnimatePresence>
      {status !== "connected" && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          role="status"
          className={cn(
            "pointer-events-none fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-neutral-950/80 px-3 py-1.5 text-xs text-neutral-400 backdrop-blur",
            className,
          )}
        >
          <Loader2Icon className="size-3.5 animate-spin" />
          Reconectando…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
