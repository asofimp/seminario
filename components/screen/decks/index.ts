import {
  AudienceView,
  ScreenView,
  type Survey,
  type UpdateStateInput,
} from "@/lib/types/api";
import { fase1Deck } from "./fase-1";
import { genericDeck } from "./generic";
import type { Deck } from "./types";

export type { Deck, Slide, SlideContext } from "./types";

const DECKS: Deck[] = [fase1Deck];

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
    };
  }
  return {
    slideIndex,
    audienceView: AudienceView.WAITING,
    acceptingResponses: false,
    showResultsToAudience: false,
  };
}
