"use client";

import { CheckIcon, MessageCircleQuestionIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { SlideContext } from "./decks/types";
import { Kicker, SlideFrame, Title } from "./slide-kit";

const MAX_VISIBLE = 9;

// Ronda de preguntas en la pantalla proyectada: muro con las preguntas que
// llegan en vivo o, si el presentador destaca una, esa pregunta en grande.
export function QaSlide({ ctx }: { ctx: SlideContext }) {
  const highlighted = ctx.qa.find((q) => q._id === ctx.state.highlightedQuestionId);
  // Primero las pendientes (más nuevas arriba), luego las respondidas.
  const visible = [...ctx.qa]
    .sort((a, b) => Number(a.answered) - Number(b.answered) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_VISIBLE);

  if (highlighted) {
    return (
      <SlideFrame className="items-center text-center">
        <Kicker>Ronda de preguntas</Kicker>
        <motion.blockquote
          key={highlighted._id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="max-w-[28ch] text-[clamp(2rem,4.4vw,4.8rem)] leading-[1.12] font-bold tracking-tight"
        >
          “{highlighted.text}”
        </motion.blockquote>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[clamp(1.1rem,1.9vw,2rem)] text-cyan-300"
        >
          — {highlighted.participantName}
        </motion.p>
      </SlideFrame>
    );
  }

  return (
    <SlideFrame className="gap-[2.5vh]">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-[1vh]">
          <Kicker>Ronda de preguntas</Kicker>
          <Title>¿Qué quieres profundizar?</Title>
          <p className="text-[clamp(1rem,1.6vw,1.7rem)] text-neutral-400">
            Escribe tu pregunta desde el celular. Puedes enviar varias.
          </p>
        </div>
        <p className="shrink-0 text-right text-[clamp(1rem,1.5vw,1.6rem)] text-neutral-400 tabular-nums">
          <span className="text-[1.8em] font-bold text-neutral-100">{ctx.qa.length}</span>{" "}
          {ctx.qa.length === 1 ? "pregunta" : "preguntas"}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-[8vh] text-neutral-500">
          <MessageCircleQuestionIcon className="size-[clamp(2.5rem,4vw,4.5rem)] animate-pulse" />
          <p className="text-[clamp(1rem,1.5vw,1.6rem)]">Esperando la primera pregunta…</p>
        </div>
      ) : (
        <motion.ul layout className="grid gap-[1.2vw] sm:grid-cols-3">
          <AnimatePresence initial={false}>
            {visible.map((q) => (
              <motion.li
                key={q._id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: q.answered ? 0.45 : 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
                className="flex flex-col justify-between gap-[1.2vh] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-[1.4vw]"
              >
                <p className="line-clamp-4 text-[clamp(1rem,1.5vw,1.65rem)] leading-snug">{q.text}</p>
                <p className="flex items-center gap-2 text-[clamp(0.85rem,1.15vw,1.25rem)] text-neutral-400">
                  {q.answered && <CheckIcon className="size-[1.1em] text-emerald-400" />}
                  {q.participantName}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </SlideFrame>
  );
}
