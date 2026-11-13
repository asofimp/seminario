import { AudienceView, ScreenView, type UpdateStateInput } from "@/lib/types/api";

// Transiciones de una votación, iguales en el control remoto y en el panel /admin.
// Cuando quien presenta muestra resultados, los celulares también los ven.

// Cierra la votación y revela resultados en la pantalla y en los celulares.
export const closeAndReveal = (): UpdateStateInput => ({
  acceptingResponses: false,
  showResultsToAudience: true,
  audienceView: AudienceView.RESULTS,
});

// Reabre la votación: los celulares vuelven a la pregunta.
export const reopenVote = (): UpdateStateInput => ({
  acceptingResponses: true,
  showResultsToAudience: false,
  audienceView: AudienceView.QUESTION,
  screenView: ScreenView.QUESTION,
});

// Gráfica en vivo con la votación abierta: la pantalla muestra las barras y
// los celulares las ven debajo de las opciones (pueden seguir votando).
export const liveChart = (on: boolean): UpdateStateInput => ({
  screenView: on ? ScreenView.RESULTS : ScreenView.QUESTION,
  showResultsToAudience: on,
});
