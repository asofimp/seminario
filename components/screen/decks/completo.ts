// Presentación completa: las cuatro fases en una sola sesión.
// Encuesta: seminario-be/seed/seminario-completo.json, con las preguntas de cada fase en orden
// (fase 1 → 0–2, fase 2 → 3, fase 3 → 4, fase 4 → 5–8).
//
// Cada fase sigue escrita en su propio archivo con índices de pregunta locales (0, 1, …);
// aquí se desplazan para que apunten a su lugar en la encuesta combinada.

import { fase1Deck } from "./fase-1";
import { fase2Deck } from "./fase-2";
import { fase3Deck } from "./fase-3";
import { fase4Deck } from "./fase-4";
import type { Deck, Slide, SlideContext } from "./types";

const PHASES = [fase1Deck, fase2Deck, fase3Deck, fase4Deck];

function withOffset(slide: Slide, offset: number, phase: number): Slide {
  // La diapositiva ve solo las preguntas de su fase, empezando en su índice local 0.
  const local = (ctx: SlideContext): SlideContext => ({ ...ctx, questions: ctx.questions.slice(offset) });
  return {
    ...slide,
    title: `F${phase} · ${slide.title}`,
    questionIndex: slide.questionIndex !== undefined ? slide.questionIndex + offset : undefined,
    render: (ctx) => slide.render(local(ctx)),
    sidePanel: slide.sidePanel && {
      ...slide.sidePanel,
      render: (ctx) => slide.sidePanel!.render(local(ctx)),
    },
  };
}

let offset = 0;
const slides: Slide[] = [];
const preview: NonNullable<Deck["preview"]> = [];
PHASES.forEach((deck, i) => {
  slides.push(...deck.slides.map((s) => withOffset(s, offset, i + 1)));
  preview.push(...(deck.preview ?? []));
  // Preguntas que usa la fase = mayor índice de votación + 1.
  offset += Math.max(-1, ...deck.slides.map((sl) => sl.questionIndex ?? -1)) + 1;
});

export const completoDeck: Deck = {
  id: "completo",
  surveyTitle: "Ciberseguridad con Inteligencia Artificial",
  slides,
  preview,
};
