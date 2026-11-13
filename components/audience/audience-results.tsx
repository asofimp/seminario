"use client";

import { CheckIcon, SparklesIcon, TrophyIcon, UsersIcon } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { getInsights } from "@/components/shared/result-insights";
import type { AnswerValue, QuestionResults } from "@/lib/types/api";
import { cn } from "@/lib/utils";

// Un color por opción (mismos que la pantalla proyectada).
const BAR = [
  "from-chart-1 to-chart-1/50",
  "from-chart-2 to-chart-2/50",
  "from-chart-3 to-chart-3/50",
  "from-chart-4 to-chart-4/50",
  "from-chart-5 to-chart-5/50",
];
const DOT = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const voted = (myVote: AnswerValue | undefined, value: string) =>
  Array.isArray(myVote) ? myVote.includes(value) : myVote === value;

// Resultados en el celular del público.
// - completo: ganador destacado, opciones con "Tu voto" y frases de resumen.
// - live: versión compacta bajo las opciones mientras la votación sigue abierta.
export function AudienceResults({
  results,
  myVote,
  live,
}: {
  results: QuestionResults;
  myVote?: AnswerValue;
  live?: boolean;
}) {
  const { winners, lines, total } = getInsights(results);
  const options = results.options ?? [];
  const winnerValues = new Set(winners.map((w) => w.value));
  const myOptions = options.filter((o) => voted(myVote, o.value));
  const withMajority = myOptions.some((o) => winnerValues.has(o.value));

  return (
    <section className={cn("flex flex-col", live ? "gap-3" : "gap-5")}>
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-medium text-accent">
          {live ? (
            <>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              Resultados en vivo
            </>
          ) : (
            <>
              <SparklesIcon className="size-3.5" /> Resultados
            </>
          )}
        </span>
        {!live && <h1 className="text-2xl leading-snug font-semibold">{results.text}</h1>}
      </div>

      {/* Ganador */}
      {!live && winners.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 16 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-card to-accent/20 p-5 ring-1 ring-primary/40"
        >
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-accent"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.08 }}
            transition={{ delay: 0.3, duration: 1.1, ease: "easeOut" }}
          />
          <p className="flex items-center gap-2 text-sm font-medium text-accent">
            <TrophyIcon className="size-4" /> {winners.length > 1 ? "Empate" : "Más votada"}
          </p>
          <p className="mt-2 text-xl leading-tight font-semibold">{winners.map((w) => w.label).join(" · ")}</p>
          <p className="mt-1 text-6xl leading-none font-black text-gradient tabular-nums">
            <AnimatedNumber value={Math.round(winners[0].percentage)} delay={0.2} />%
          </p>
        </motion.div>
      )}

      {/* Tu voto frente a la mayoría */}
      {!live && myOptions.length > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm",
            withMajority ? "bg-emerald-500/10 text-emerald-300" : "bg-white/[0.05] text-muted-foreground",
          )}
        >
          <CheckIcon className="size-4 shrink-0" />
          {withMajority
            ? "Coincides con la mayoría."
            : `Tu voto: ${myOptions.map((o) => o.label).join(", ")}.`}
        </motion.p>
      )}

      {/* Opciones */}
      <ul className="flex flex-col gap-2.5">
        {options.map((o, i) => {
          const isWinner = winnerValues.has(o.value);
          const mine = voted(myVote, o.value);
          return (
            <motion.li
              key={o.value}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (live ? 0 : 0.35) + i * 0.08 }}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border bg-card/70 backdrop-blur",
                live ? "p-3" : "p-4",
                mine && "border-primary/60 ring-1 ring-primary/40",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold text-background",
                    DOT[i % DOT.length],
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={cn("flex-1 leading-snug", isWinner && !live && "font-semibold")}>{o.label}</span>
                {mine && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                    Tu voto
                  </span>
                )}
                {isWinner && !live && <TrophyIcon className="size-4 shrink-0 text-accent" />}
                <span className="w-12 text-right font-semibold tabular-nums">
                  <AnimatedNumber value={Math.round(o.percentage)} delay={live ? 0 : 0.4 + i * 0.08} duration={0.9} />%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn("h-full rounded-full bg-gradient-to-r", BAR[i % BAR.length])}
                  initial={{ width: 0 }}
                  animate={{ width: `${o.percentage}%` }}
                  transition={{ delay: live ? 0 : 0.4 + i * 0.08, type: "spring", stiffness: 90, damping: 18 }}
                />
              </div>
            </motion.li>
          );
        })}
      </ul>

      {/* Total y resumen */}
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <UsersIcon className="size-4" />
          <span className="font-semibold text-foreground tabular-nums">{total}</span>
          {total === 1 ? "voto" : "votos"}
        </p>
        {!live &&
          lines.slice(1, -1).map((line) => (
            <p key={line} className="flex items-start gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              {line}
            </p>
          ))}
      </div>
    </section>
  );
}
