import type { ReactNode } from "react";
import type { PresentationState, Question, QuestionResults } from "@/lib/types/api";

// Datos en vivo que recibe cada diapositiva al renderizarse.
export interface SlideContext {
  code: string;
  joinHost: string;
  questions: Question[];
  state: PresentationState;
  results: QuestionResults | null;
}

export interface Slide {
  // Título corto para la lista del panel de control.
  title: string;
  // Duración sugerida, ej. "~1:15".
  duration?: string;
  // Notas del presentador (solo se ven en el panel de control).
  notes?: string;
  // Si la diapositiva es una votación: índice de la pregunta en la encuesta.
  questionIndex?: number;
  // Ocupa toda la pantalla, sin el margen de las demás diapositivas (ej. portada).
  fullBleed?: boolean;
  render: (ctx: SlideContext) => ReactNode;
}

export interface Deck {
  id: string;
  // Se elige el deck cuya encuesta tenga este título.
  surveyTitle: string;
  slides: Slide[];
}
