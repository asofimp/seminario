"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useLivePresentation } from "@/hooks/realtime/use-live-presentation";
import { presentationsApi } from "@/lib/api/endpoints";
import { JOIN_HOST } from "@/lib/env";
import { useAdminStore } from "@/stores/admin-store";
import { getDeck, slideState } from "./decks";
import { SlideStage } from "./slide-stage";

export function ScreenView({ code }: { code: string }) {
  const live = useLivePresentation(code, "screen");
  const adminKey = useAdminStore((s) => s.adminKey);
  const survey = live.snapshot?.survey;
  const deck = useMemo(() => (survey ? getDeck(survey) : null), [survey]);
  const slideIndex = Math.min(live.state?.slideIndex ?? 0, (deck?.slides.length ?? 1) - 1);

  // Atajos: F = pantalla completa; con sesión de admin en este navegador,
  // ←/→ (o espacio / PageUp/PageDown de un presentador) cambian la diapositiva.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen();
        return;
      }
      if (!adminKey || !deck || !survey) return;
      const delta = ["ArrowRight", "PageDown", " "].includes(e.key)
        ? 1
        : ["ArrowLeft", "PageUp"].includes(e.key)
          ? -1
          : 0;
      if (!delta) return;
      e.preventDefault();
      const next = slideIndex + delta;
      if (next < 0 || next >= deck.slides.length) return;
      presentationsApi
        .updateState(code, slideState(deck, survey, next))
        .catch((err: Error) => toast.error(err.message));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adminKey, code, deck, slideIndex, survey]);

  if (!live.snapshot || !live.state || !deck) {
    return (
      <main className="flex flex-1 items-center justify-center gap-3 text-xl text-muted-foreground">
        {live.error ?? (
          <>
            <Loader2Icon className="animate-spin" /> Conectando…
          </>
        )}
      </main>
    );
  }

  return (
    <SlideStage
      deck={deck}
      slideIndex={slideIndex}
      ctx={{
        code,
        joinHost: JOIN_HOST ?? window.location.host,
        questions: live.snapshot.survey.questions,
        state: live.state,
        results: live.results,
      }}
      showFullscreenHint={!adminKey}
    />
  );
}
