"use client";

import { CheckIcon, MonitorIcon, MonitorOffIcon, UndoIcon } from "lucide-react";
import { toast } from "sonner";
import { qaApi } from "@/lib/api/endpoints";
import type { AudienceQuestion, ObjectId } from "@/lib/types/api";
import { cn } from "@/lib/utils";

// Lista de preguntas del público para quien presenta: ponerlas en pantalla
// (grande) y marcarlas como respondidas. Pendientes primero, en orden de llegada.
export function QaModerator({
  code,
  questions,
  highlightedId,
  onHighlight,
  large,
}: {
  code: string;
  questions: AudienceQuestion[];
  highlightedId: ObjectId | null;
  onHighlight: (id: ObjectId | null) => void;
  large?: boolean;
}) {
  const sorted = [...questions].sort(
    (a, b) => Number(a.answered) - Number(b.answered) || a.createdAt.localeCompare(b.createdAt),
  );

  const toggleAnswered = (q: AudienceQuestion) => {
    qaApi.setAnswered(code, q._id, !q.answered).catch((e: Error) => toast.error(e.message));
    // Al marcarla como respondida, deja de estar en pantalla.
    if (!q.answered && highlightedId === q._id) onHighlight(null);
  };

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay preguntas del público.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((q) => {
        const onScreen = highlightedId === q._id;
        return (
          <li
            key={q._id}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-3",
              onScreen ? "border-cyan-400/50 bg-cyan-400/10" : "bg-card/60",
              q.answered && "opacity-55",
            )}
          >
            <p className={cn("leading-snug", large ? "text-base" : "text-sm")}>{q.text}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs text-muted-foreground">{q.participantName}</span>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => onHighlight(onScreen ? null : q._id)}
                  className={cn(
                    "flex touch-manipulation items-center gap-1.5 rounded-lg border px-3 font-medium transition active:scale-95",
                    large ? "h-11 text-sm" : "h-8 text-xs",
                    onScreen ? "border-cyan-400/50 text-cyan-200" : "border-white/10",
                  )}
                >
                  {onScreen ? <MonitorOffIcon className="size-4" /> : <MonitorIcon className="size-4" />}
                  {onScreen ? "Quitar" : "En pantalla"}
                </button>
                <button
                  onClick={() => toggleAnswered(q)}
                  className={cn(
                    "flex touch-manipulation items-center gap-1.5 rounded-lg border border-white/10 px-3 font-medium transition active:scale-95",
                    large ? "h-11 text-sm" : "h-8 text-xs",
                    q.answered && "text-emerald-300",
                  )}
                >
                  {q.answered ? <UndoIcon className="size-4" /> : <CheckIcon className="size-4" />}
                  {q.answered ? "Pendiente" : "Respondida"}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
