"use client";

import { motion } from "motion/react";
import { ResultBars } from "@/components/shared/result-bars";
import { ScreenView } from "@/lib/types/api";
import type { SlideContext } from "./decks/types";
import { ResultsReveal } from "./results-reveal";
import { Kicker, SlideFrame, Title } from "./slide-kit";

// Caja grande con la dirección y el código para unirse.
export function JoinBox({ code, joinHost, compact }: { code: string; joinHost: string; compact?: boolean }) {
  return (
    <div className="flex items-center rounded-2xl border border-white/15 bg-neutral-950/80 px-[2vw] py-[1.6vh] backdrop-blur">
      <div className="flex flex-col">
        <span className="text-[clamp(0.9rem,1.3vw,1.4rem)] text-muted-foreground">
          Entra a <span className="font-semibold text-foreground">{joinHost}</span> con el código
        </span>
        <span
          className={
            compact
              ? "font-mono text-[clamp(1.3rem,2.2vw,2.4rem)] font-bold tracking-[0.25em]"
              : "font-mono text-[clamp(1.6rem,3vw,3.2rem)] leading-none font-bold tracking-[0.25em]"
          }
        >
          {code}
        </span>
      </div>
    </div>
  );
}

// Diapositiva de votación: muestra la pregunta y, cuando el admin lo pide,
// la gráfica con los resultados en vivo.
export function VoteSlide({ ctx, questionIndex, kicker }: { ctx: SlideContext; questionIndex: number; kicker: string }) {
  const question = ctx.questions[questionIndex];
  if (!question) return <SlideFrame><Title>Pregunta no encontrada</Title></SlideFrame>;

  const results = ctx.results?.questionId === question._id ? ctx.results : null;

  // Al cerrar la votación de esta pregunta: revelado animado de resultados.
  const closed = ctx.state.currentQuestionId === question._id && !ctx.state.acceptingResponses;
  if (closed && results) return <ResultsReveal results={results} kicker={kicker} />;
  const showChart = ctx.state.screenView === ScreenView.RESULTS && results;

  return (
    <SlideFrame className="gap-[4vh]">
      <div className="flex flex-col gap-[1.5vh]">
        <Kicker>{kicker}</Kicker>
        <Title className="max-w-[75%]">{question.text}</Title>
      </div>

      <div className="flex flex-col gap-[2.5vh]">
        {showChart ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ResultBars results={results} size="lg" />
          </motion.div>
        ) : (
          <div className="grid gap-[1.6vh] sm:grid-cols-2">
            {question.options.map((o, i) => (
              <motion.div
                key={o.value}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                className="flex items-center gap-[1vw] rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-[1.4vw] py-[1.8vh] text-[clamp(1.1rem,1.9vw,2rem)] backdrop-blur"
              >
                <span className="flex size-[clamp(2rem,3vw,3.4rem)] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono font-bold text-cyan-300">
                  {String.fromCharCode(65 + i)}
                </span>
                {o.label}
              </motion.div>
            ))}
          </div>
        )}

        {!ctx.state.acceptingResponses && (
          <p className="text-[clamp(1rem,1.5vw,1.6rem)] text-neutral-400">Votación cerrada</p>
        )}
      </div>
    </SlideFrame>
  );
}
