"use client";

import { TrophyIcon, UsersIcon } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SparklesCore } from "@/components/ui/sparkles";
import { getInsights } from "@/components/shared/result-insights";
import type { QuestionResults } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Kicker, SlideFrame } from "./slide-kit";

const BAR_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

// Revelado animado al cerrar una votación: ganador, barras y frases resumen.
// Secuencia: encabezado → ganador (0.4 s) → barras (0.9 s) → frases (1.8 s+).
export function ResultsReveal({ results, kicker }: { results: QuestionResults; kicker: string }) {
  const { winners, lines, total } = getInsights(results);
  const options = results.options ?? [];
  const winnerValues = new Set(winners.map((w) => w.value));
  const tie = winners.length > 1;

  return (
    <SlideFrame className="gap-[3vh]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-[1vh]">
        <Kicker>{`${kicker} · Resultados`}</Kicker>
        <h1 className="max-w-[40ch] text-[clamp(1.4rem,2.6vw,2.8rem)] leading-tight font-semibold text-muted-foreground">
          {results.text}
        </h1>
      </motion.div>

      <div className="grid gap-[3vw] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Ganador */}
        <div className="flex flex-col gap-[2.5vh]">
          {winners.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 160, damping: 14 }}
              className="relative"
            >
              {/* Destellos detrás del ganador */}
              <SparklesCore
                id="winner-sparkles"
                background="transparent"
                minSize={0.6}
                maxSize={1.6}
                particleDensity={90}
                particleColor="#67e8f9"
                speed={2}
                className="pointer-events-none absolute -inset-[15%] z-0"
              />
              <BackgroundGradient containerClassName="relative z-10 rounded-3xl p-[3px]" className="relative overflow-hidden rounded-[22px] bg-neutral-950/90 p-[2.2vw]">
              {/* Pulso de luz al aparecer */}
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-3xl ring-4 ring-accent"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 1.15 }}
                transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
              />
              <p className="flex items-center gap-2 text-[clamp(0.9rem,1.3vw,1.4rem)] font-semibold tracking-[0.15em] text-accent uppercase">
                <TrophyIcon className="size-[1.2em]" /> {tie ? "Empate" : "Más votada"}
              </p>
              <p className="mt-[1vh] text-[clamp(1.6rem,3vw,3.4rem)] leading-tight font-bold">
                {winners.map((w) => w.label).join(" · ")}
              </p>
              <p className="mt-[1vh] text-[clamp(3.5rem,8vw,9rem)] leading-none font-black text-gradient tabular-nums">
                <AnimatedNumber value={Math.round(winners[0].percentage)} delay={0.5} />%
              </p>
              </BackgroundGradient>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border p-[2vw] text-[clamp(1.4rem,2.4vw,2.6rem)] text-muted-foreground"
            >
              Sin votos
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3 text-[clamp(1.1rem,1.8vw,2rem)]"
          >
            <UsersIcon className="size-[1.2em] text-muted-foreground" />
            <span className="font-bold tabular-nums">
              <AnimatedNumber value={total} delay={0.8} />
            </span>
            <span className="text-muted-foreground">{total === 1 ? "voto" : "votos"}</span>
          </motion.p>
        </div>

        {/* Barras */}
        <div className="flex flex-col justify-center gap-[2vh]">
          {options.map((o, i) => {
            const isWinner = winnerValues.has(o.value);
            return (
              <motion.div
                key={o.value}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: isWinner || winners.length === 0 ? 1 : 0.7, x: 0 }}
                transition={{ delay: 0.9 + i * 0.12 }}
                className="flex flex-col gap-[0.6vh]"
              >
                <div className="flex items-baseline justify-between gap-4 text-[clamp(1rem,1.7vw,1.9rem)]">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                    <span className={cn(isWinner && "font-semibold")}>{o.label}</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    <AnimatedNumber value={Math.round(o.percentage)} delay={1 + i * 0.12} />%
                  </span>
                </div>
                <div className="h-[clamp(0.9rem,1.6vh,1.5rem)] overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn("h-full rounded-full", BAR_COLORS[i % BAR_COLORS.length], isWinner && "shadow-[0_0_20px] shadow-current")}
                    initial={{ width: 0 }}
                    animate={{ width: `${o.percentage}%` }}
                    transition={{ delay: 1 + i * 0.12, type: "spring", stiffness: 80, damping: 18 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Frases resumen para comentar */}
      <ul className="flex flex-col gap-[1vh]">
        {lines.map((line, i) => (
          <motion.li
            key={line}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 + i * 0.35 }}
            className="flex items-start gap-3 text-[clamp(1rem,1.6vw,1.8rem)]"
          >
            <span className="mt-[0.45em] size-[0.5em] shrink-0 rounded-full bg-accent" />
            {line}
          </motion.li>
        ))}
      </ul>
    </SlideFrame>
  );
}
