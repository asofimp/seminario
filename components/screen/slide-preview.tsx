"use client";

import { useSyncExternalStore } from "react";
import {
  AudienceView,
  QuestionType,
  ScreenView,
  type PresentationState,
  type Question,
  type QuestionResults,
} from "@/lib/types/api";
import { fase1Deck } from "./decks/fase-1";
import { SlideStage } from "./slide-stage";

// Preguntas y votos de ejemplo (mismas preguntas que seed/fase-1-agentes-ia.json).
const QUESTIONS: Question[] = [
  ["¿Has usado alguna herramienta de IA?", ["Sí, a diario", "Sí, de vez en cuando", "Nunca"], [14, 9, 2]],
  ["¿Has usado un agente de IA?", ["Sí", "No", "No estoy seguro"], [6, 8, 11]],
  [
    "Su empresa ya tiene un agente de IA de ciberseguridad. ¿Cuánta autonomía le darían?",
    ["Que solo recomiende y yo apruebo", "Que actúe dentro de límites y yo vigile", "Que decida y ejecute solo", "Ninguna: todavía no confío"],
    [7, 12, 2, 4],
  ],
].map(([text, labels], i) => ({
  _id: `preview-q${i}`,
  text: text as string,
  type: QuestionType.SINGLE,
  options: (labels as string[]).map((label, j) => ({ value: String.fromCharCode(97 + j), label })),
}));
const COUNTS = [[14, 9, 2], [6, 8, 11], [7, 12, 2, 4]];

function sampleResults(qi: number): QuestionResults {
  const q = QUESTIONS[qi];
  const total = COUNTS[qi].reduce((a, b) => a + b, 0);
  return {
    questionId: q._id,
    text: q.text,
    type: q.type,
    totalResponses: total,
    options: q.options.map((o, j) => ({
      ...o,
      count: COUNTS[qi][j],
      percentage: (COUNTS[qi][j] / total) * 100,
    })),
  };
}

export function SlidePreview({ slideIndex, voteState }: { slideIndex: number; voteState: "open" | "chart" | "closed" }) {
  const deck = fase1Deck;
  const index = Math.min(Math.max(slideIndex, 0), deck.slides.length - 1);
  const qi = deck.slides[index].questionIndex;
  // window solo existe en el cliente: en el servidor el host queda vacío.
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "",
  );
  // Solo en el cliente: los efectos usan valores aleatorios que no coinciden
  // entre servidor y navegador (igual que la pantalla en vivo, que espera al socket).
  if (!host) return null;

  const state: PresentationState = {
    audienceView: AudienceView.QUESTION,
    screenView: voteState === "chart" ? ScreenView.RESULTS : ScreenView.QUESTION,
    currentQuestionId: qi !== undefined ? QUESTIONS[qi]._id : null,
    acceptingResponses: voteState !== "closed",
    showResultsToAudience: false,
    slideIndex: index,
  };

  return (
    <SlideStage
      deck={deck}
      slideIndex={index}
      ctx={{
        code: "DEMO42",
        joinHost: host,
        questions: QUESTIONS,
        state,
        results: qi !== undefined ? sampleResults(qi) : null,
      }}
    />
  );
}
