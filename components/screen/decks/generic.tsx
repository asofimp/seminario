import type { Survey } from "@/lib/types/api";
import { Kicker, SlideFrame, Title } from "../slide-kit";
import { JoinBox, VoteSlide } from "../vote-slide";
import type { Deck } from "./types";

// Deck automático: portada + una votación por pregunta + cierre.
export function genericDeck(survey: Survey): Deck {
  return {
    id: `auto-${survey._id}`,
    surveyTitle: survey.title,
    slides: [
      {
        title: "Portada",
        render: (ctx) => (
          <SlideFrame className="items-center text-center">
            <Kicker>Bienvenidos</Kicker>
            <Title className="text-gradient">{survey.title}</Title>
            <JoinBox code={ctx.code} joinHost={ctx.joinHost} />
          </SlideFrame>
        ),
      },
      ...survey.questions.map((q, i) => ({
        title: `Votación ${i + 1}`,
        questionIndex: i,
        render: (ctx: Parameters<Deck["slides"][number]["render"]>[0]) => (
          <VoteSlide ctx={ctx} questionIndex={i} kicker={`Pregunta ${i + 1}`} />
        ),
      })),
      {
        title: "Gracias",
        render: () => (
          <SlideFrame className="items-center text-center">
            <Title className="text-gradient">¡Gracias!</Title>
          </SlideFrame>
        ),
      },
    ],
  };
}
