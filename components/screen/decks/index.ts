import {
  AudienceView,
  ScreenView,
  type Survey,
  type UpdateStateInput,
} from "@/lib/types/api";
import { completoDeck } from "./completo";
import { fase1Deck } from "./fase-1";
import { fase2Deck } from "./fase-2";
import { fase3Deck } from "./fase-3";
import { fase4Deck } from "./fase-4";
import { genericDeck } from "./generic";
import type { Deck } from "./types";

export type { Deck, Slide, SlideContext } from "./types";

// DECKS[0] es la presentación completa; las fases sueltas siguen disponibles.
export const DECKS: Deck[] = [completoDeck, fase1Deck, fase2Deck, fase3Deck, fase4Deck];

// Deck de la encuesta; si no hay uno escrito a mano, se arma uno automático
// con una diapositiva por pregunta.
export function getDeck(survey: Survey): Deck {
  return DECKS.find((d) => d.surveyTitle === survey.title) ?? genericDeck(survey);
}

// Estado a enviar al backend al mover la pantalla a la diapositiva `index`:
// las de votación abren su pregunta; el resto deja al público en espera.
export function slideState(deck: Deck, survey: Survey, index: number): UpdateStateInput {
  const slideIndex = Math.min(Math.max(index, 0), deck.slides.length - 1);
  const qi = deck.slides[slideIndex].questionIndex;
  const question = qi !== undefined ? survey.questions[qi] : undefined;

  if (question) {
    return {
      slideIndex,
      currentQuestionId: question._id,
      audienceView: AudienceView.QUESTION,
      screenView: ScreenView.QUESTION,
      acceptingResponses: true,
      showResultsToAudience: false,
      showSidePanel: false,
    };
  }
  return {
    slideIndex,
    audienceView: AudienceView.WAITING,
    acceptingResponses: false,
    showResultsToAudience: false,
    showSidePanel: false,
  };
}
