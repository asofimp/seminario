"use client";

import { motion } from "motion/react";
import type { QuestionResults } from "@/lib/types/api";
import { cn } from "@/lib/utils";

const BAR_COLORS = [
  "from-chart-1 to-chart-1/60",
  "from-chart-2 to-chart-2/60",
  "from-chart-3 to-chart-3/60",
  "from-chart-4 to-chart-4/60",
  "from-chart-5 to-chart-5/60",
];

// Barras horizontales animadas para preguntas de opciones (y promedio / textos).
export function ResultBars({
  results,
  size = "default",
}: {
  results: QuestionResults;
  size?: "default" | "lg";
}) {
  const top = Math.max(0, ...(results.options ?? []).map((o) => o.count));

  return (
    <div className="flex flex-col gap-4">
      {results.options?.map((o, i) => {
        const leader = top > 0 && o.count === top;
        return (
          <div key={o.value} className="flex flex-col gap-1.5">
            <div className={cn("flex items-baseline justify-between gap-3", size === "lg" ? "text-xl" : "text-sm")}>
              <span className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                <span className={cn(leader && "font-semibold")}>{o.label}</span>
              </span>
              <span className="tabular-nums text-muted-foreground">
                {o.count} · <span className="font-semibold text-foreground">{Math.round(o.percentage)}%</span>
              </span>
            </div>
            <div className={cn("overflow-hidden rounded-full bg-muted", size === "lg" ? "h-5" : "h-3")}>
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", BAR_COLORS[i % BAR_COLORS.length])}
                initial={{ width: 0 }}
                animate={{ width: `${o.percentage}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        );
      })}

      {results.average != null && (
        <p className="text-center text-4xl font-semibold tabular-nums">
          {results.average.toFixed(1)}
          <span className="ml-2 text-base font-normal text-muted-foreground">promedio</span>
        </p>
      )}

      {results.latestAnswers && results.latestAnswers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.latestAnswers.map((a, i) => (
            <span key={i} className="rounded-lg border bg-card px-3 py-1.5 text-sm">
              {a}
            </span>
          ))}
        </div>
      )}

      <p className="text-right text-xs text-muted-foreground">
        {results.totalResponses} {results.totalResponses === 1 ? "respuesta" : "respuestas"}
      </p>
    </div>
  );
}
