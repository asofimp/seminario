"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const slideIndex = Math.min(
    live.state?.slideIndex ?? 0,
    (deck?.slides.length ?? 1) - 1,
  );

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
    return <ScreenLoading error={live.error} problem={live.lastProblem} status={live.status} />;
  }


  return (
    <>
      <SlideStage
        deck={deck}
        slideIndex={slideIndex}
        ctx={{
          code,
          joinHost: JOIN_HOST ?? window.location.host,
          questions: live.snapshot.survey.questions,
          state: live.state,
          results: live.results,
          qa: live.qa,
        }}
        showFullscreenHint={!adminKey}
      />
    </>
  );
}

// Mientras carga: tras 10 s muestra qué está pasando (sigue reintentando sola).
function ScreenLoading({
  error,
  problem,
  status,
}: {
  error: string | null;
  problem: string | null;
  status: string;
}) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(t);
  }, []);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-xl text-muted-foreground">
      {error ?? (
        <span className="flex items-center gap-3">
          <Loader2Icon className="animate-spin" /> {slow ? "Esperando al servidor…" : "Conectando…"}
        </span>
      )}
      {slow && !error && (
        <p className="max-w-lg text-sm text-neutral-500">
          Reintentando sola, no hace falta recargar. Estado: {status}
          {problem ? ` · ${problem}` : ""}. Más detalle en la consola (F12, líneas “[ws]”).
        </p>
      )}
    </main>
  );
}
