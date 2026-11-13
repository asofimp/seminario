// Presentación completa: las cuatro fases en una sola sesión.
// Encuesta: seminario-be/seed/seminario-completo.json, con las preguntas de cada fase en orden
// (fase 1 → 0–2, fase 2 → 3, fase 3 → 4, fase 4 → 5–8).
//
// Cada fase sigue escrita en su propio archivo con índices de pregunta locales (0, 1, …);
// aquí se desplazan para que apunten a su lugar en la encuesta combinada.

import { createElement } from "react";
import { QaSlide } from "../qa-slide";
import { JoinSlide } from "../join-slide";
import { AgendaSlide, ClosingSlide, CoverSlide } from "../slide-blocks";
import { fase1Deck } from "./fase-1";
import { fase2Deck } from "./fase-2";
import { fase3Deck } from "./fase-3";
import { fase4Deck } from "./fase-4";
import type { Deck, Slide, SlideContext } from "./types";

const PHASES = [fase1Deck, fase2Deck, fase3Deck, fase4Deck];

// Quién presenta cada fase (filtro del control remoto).
const OWNERS: Record<number, string> = { 1: "Keyla", 2: "Fredy", 3: "Jhoan", 4: "Cesar" };

function withOffset(slide: Slide, offset: number, phase: number): Slide {
  // La diapositiva ve solo las preguntas de su fase, empezando en su índice local 0.
  const local = (ctx: SlideContext): SlideContext => ({ ...ctx, questions: ctx.questions.slice(offset) });
  return {
    ...slide,
    title: `F${phase} · ${slide.title}`,
    phase,
    questionIndex: slide.questionIndex !== undefined ? slide.questionIndex + offset : undefined,
    render: (ctx) => slide.render(local(ctx)),
    sidePanel: slide.sidePanel && {
      ...slide.sidePanel,
      render: (ctx) => slide.sidePanel!.render(local(ctx)),
    },
  };
}

// ---- Intro de toda la presentación (la abre quien presenta la fase 1) ----

// Portada general.
const coverSlide: Slide = {
  title: "Intro · Portada",
  phase: 1,
  fullBleed: true,
  notes:
    "Bienvenida al seminario. Presentar el tema general —ciberseguridad con inteligencia artificial— y al equipo: Keyla, Fredy, Jhoan y Cesar.",
  render: (ctx) => (
    <CoverSlide ctx={ctx}>
      Ciberseguridad con <br /> Inteligencia Artificial
    </CoverSlide>
  ),
};

// Cómo unirse: QR, dirección y código.
const joinSlide: Slide = {
  title: "Intro · Únete (QR)",
  phase: 1,
  notes:
    "Primera pantalla, mientras llega el público: que escaneen el QR con la cámara del celular o escriban la dirección y el código. Al entrar les pedirá su nombre. Avanzar a la portada cuando la mayoría esté dentro (el número de conectados se ve en el panel).",
  render: (ctx) => <JoinSlide ctx={ctx} />,
};

// Agenda global: los cuatro temas con quién presenta cada uno.
const agendaSlide: Slide = {
  title: "Intro · Agenda",
  phase: 1,
  notes:
    "Recorrer los cuatro temas y quién presenta cada uno: agentes de IA (Keyla), incidentes (Fredy), regulación (Jhoan) y concientización (Cesar). Al final habrá una ronda de preguntas.",
  render: () =>
    createElement(AgendaSlide, {
      phases: PHASES.flatMap((d, i) => (d.agenda ? [{ ...d.agenda, presenter: OWNERS[i + 1] }] : [])),
    }),
};

// Ronda de preguntas sobre toda la presentación (antes del cierre).
const qaSlide: Slide = {
  title: "Ronda de preguntas",
  qa: true,
  notes:
    "El público escribe preguntas desde el celular (puede mandar varias). Destaca una para mostrarla en grande y márcala como respondida al terminar. Respuestas preparadas — ¿No usar agentes? Sí usarlos, pero con poca autonomía y aprobación humana en lo irreversible. · ¿Ley en Guatemala? No hay ley de IA ni de protección de datos. · ¿Se puede evitar la inyección? No por completo; se mitiga. · ¿Quién responde? La organización que despliega el agente.",
  render: (ctx) => createElement(QaSlide, { ctx }),
};

// Único cierre de toda la presentación (los cierres de cada fase se omiten).
const finalSlide: Slide = {
  title: "Cierre · ¡Gracias!",
  fullBleed: true,
  endsPresentation: true,
  notes:
    "Cierre de todo el seminario: los celulares ya muestran “¡Gracias por participar!”. Cuando termines, pulsa “Terminar” en el panel.",
  render: () =>
    createElement(ClosingSlide, {
      title: "¡Gracias!",
      subtitle: "No hace falta una IA malvada: basta un objetivo mal planteado y controles débiles.",
    }),
};

let offset = 0;
const slides: Slide[] = [];
const preview: NonNullable<Deck["preview"]> = [];
slides.push(joinSlide, coverSlide, agendaSlide);
PHASES.forEach((deck, i) => {
  for (const s of deck.slides) {
    // La agenda es global (va en la intro) y cada fase no tiene cierre propio.
    if (s.role === "closing" || s.role === "agenda") continue;
    slides.push(withOffset(s, offset, i + 1));
  }
  preview.push(...(deck.preview ?? []));
  // Preguntas que usa la fase = mayor índice de votación + 1.
  offset += Math.max(-1, ...deck.slides.map((sl) => sl.questionIndex ?? -1)) + 1;
});

slides.push(qaSlide, finalSlide);

export const completoDeck: Deck = {
  id: "completo",
  surveyTitle: "Ciberseguridad con Inteligencia Artificial",
  slides,
  preview,
  owners: Object.fromEntries(
    PHASES.map((d, i) => [i + 1, { name: OWNERS[i + 1], title: d.agenda?.title ?? `Fase ${i + 1}` }]),
  ),
};
