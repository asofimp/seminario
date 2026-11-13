"use client";

import { useSyncExternalStore } from "react";
import {
  AudienceView,
  type AudienceQuestion,
  QuestionType,
  ScreenView,
  type PresentationState,
  type Question,
  type QuestionResults,
} from "@/lib/types/api";
import { DECKS } from "./decks";
import { SlideStage } from "./slide-stage";

// Preguntas del público de ejemplo para la ronda de preguntas.
const SAMPLE_QA: AudienceQuestion[] = [
  ["Ana", "¿Cómo se prueba que un botón de apagado funciona de verdad?", false],
  ["Luis", "¿Qué pasa si el agente ignora una orden explícita del usuario?", false],
  ["María", "¿La ley de Guatemala va a cubrir a los agentes de IA?", true],
  ["Carlos", "¿Qué herramientas recomiendan para monitorear a un agente?", false],
  ["Sofía", "¿Quién responde legalmente si un agente borra datos de un cliente?", false],
].map(([name, text, answered], i) => ({
  _id: `preview-qa${i}`,
  presentation: "preview",
  participantId: `p${i}`,
  participantName: name as string,
  text: text as string,
  answered: answered as boolean,
  createdAt: new Date(2026, 10, 12, 10, i).toISOString(),
  updatedAt: new Date(2026, 10, 12, 10, i).toISOString(),
}));

// Vista previa de un deck con las preguntas y votos de ejemplo que trae cada fase.
export function SlidePreview({
  phase,
  slideIndex,
  voteState,
  panel,
  highlight,
}: {
  highlight?: boolean;
  phase: number;
  slideIndex: number;
  voteState: "open" | "chart" | "closed";
  panel: boolean;
}) {
  // window solo existe en el cliente: en el servidor el host queda vacío.
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "",
  );
  // Solo en el cliente: los efectos usan valores aleatorios que no coinciden
  // entre servidor y navegador (igual que la pantalla en vivo, que espera al socket).
  if (!host) return null;

  // fase=0 (o sin fase): presentación completa; fase=1..4: esa fase sola.
  const deck = DECKS[Math.min(Math.max(phase, 0), DECKS.length - 1)];
  const sample = deck.preview ?? [];
  const questions: Question[] = sample.map((q, i) => ({
    _id: `preview-q${i}`,
    text: q.text,
    type: QuestionType.SINGLE,
    options: q.options.map((label, j) => ({ value: String.fromCharCode(97 + j), label })),
  }));
  const resultsFor = (qi: number): QuestionResults => {
    const counts = sample[qi].counts;
    const total = counts.reduce((a, b) => a + b, 0);
    return {
      questionId: questions[qi]._id,
      text: questions[qi].text,
      type: QuestionType.SINGLE,
      totalResponses: total,
      options: questions[qi].options.map((o, j) => ({
        ...o,
        count: counts[j],
        percentage: total ? (counts[j] / total) * 100 : 0,
      })),
    };
  };

  const index = Math.min(Math.max(slideIndex, 0), deck.slides.length - 1);
  const qi = deck.slides[index].questionIndex;
  const hasQuestion = qi !== undefined && qi < questions.length;

  const state: PresentationState = {
    audienceView: AudienceView.QUESTION,
    screenView: voteState === "chart" ? ScreenView.RESULTS : ScreenView.QUESTION,
    currentQuestionId: hasQuestion ? questions[qi]._id : null,
    acceptingResponses: voteState !== "closed",
    showResultsToAudience: false,
    slideIndex: index,
    showSidePanel: panel,
    highlightedQuestionId: highlight ? SAMPLE_QA[1]._id : null,
  };

  return (
    <SlideStage
      deck={deck}
      slideIndex={index}
      ctx={{
        code: "DEMO42",
        joinHost: host,
        questions,
        state,
        results: hasQuestion ? resultsFor(qi) : null,
        qa: SAMPLE_QA,
      }}
    />
  );
}
