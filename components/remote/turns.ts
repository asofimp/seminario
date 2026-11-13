import type { Deck } from "@/components/screen/decks";

// Reglas de turno del control remoto (solo si el deck define dueños por fase).
// "all" = clave de admin: control completo, sin filtro por fase.
// - Una diapositiva sin fase (ronda de preguntas, cierre) la puede manejar cualquiera.
// - Una diapositiva con fase solo la maneja su dueño.
// - Desde la última diapositiva de su fase, el dueño puede avanzar a la siguiente
//   para entregar el turno a quien sigue.

export type ControlScope = number | "all";

export function canControl(deck: Deck, index: number, myPhase: ControlScope): boolean {
  if (myPhase === "all" || !deck.owners) return true;
  const phase = deck.slides[index]?.phase;
  return phase === undefined || phase === myPhase;
}

export function canGoTo(deck: Deck, from: number, to: number, myPhase: ControlScope): boolean {
  if (to < 0 || to >= deck.slides.length) return false;
  if (!canControl(deck, from, myPhase)) return false;
  return canControl(deck, to, myPhase) || to === from + 1;
}

// Primera y última diapositiva (1-based) de una fase, para mostrársela al dueño.
export function phaseRange(deck: Deck, phase: number): [number, number] | null {
  const idx = deck.slides.flatMap((s, i) => (s.phase === phase ? [i] : []));
  return idx.length ? [idx[0] + 1, idx[idx.length - 1] + 1] : null;
}
