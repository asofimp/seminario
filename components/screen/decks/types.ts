import type { ReactNode } from "react";
import type { AudienceQuestion, PresentationState, Question, QuestionResults } from "@/lib/types/api";

// Datos en vivo que recibe cada diapositiva al renderizarse.
export interface SlideContext {
  code: string;
  joinHost: string;
  questions: Question[];
  state: PresentationState;
  results: QuestionResults | null;
  // Preguntas del público (ronda de preguntas).
  qa: AudienceQuestion[];
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
  // Panel lateral opcional (ej. definición y analogía). Solo se ve cuando el
  // admin lo habilita desde el panel de control.
  sidePanel?: {
    label: string;
    render: (ctx: SlideContext) => ReactNode;
  };
  // Ocupa toda la pantalla, sin el margen de las demás diapositivas (ej. portada).
  fullBleed?: boolean;
  // Papel especial en la presentación completa: "agenda" se reemplaza por la
  // agenda de todas las fases y "closing" (cierre de una fase) se omite.
  role?: "agenda" | "closing";
  // Ronda de preguntas: los celulares muestran el formulario para preguntar.
  qa?: boolean;
  // Última diapositiva: los celulares muestran "¡Gracias por participar!".
  endsPresentation?: boolean;
  render: (ctx: SlideContext) => ReactNode;
}

export interface Deck {
  id: string;
  // Se elige el deck cuya encuesta tenga este título.
  surveyTitle: string;
  slides: Slide[];
  // Tema de la fase y sus secciones, para la agenda de la presentación completa.
  agenda?: { title: string; items: string[] };
  // Preguntas y votos de ejemplo para /screen/preview (mismas que el seed).
  preview?: { text: string; options: string[]; counts: number[] }[];
}
