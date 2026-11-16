"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useLivePresentation,
  type ConnectionStatus,
} from "@/hooks/realtime/use-live-presentation";
import { useQuietStatus } from "@/hooks/realtime/use-quiet-status";
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
    // Aún sin presentación: pantalla oscura y el aviso pequeño en una esquina.
    return (
      <main className="fixed inset-0 bg-neutral-950">
        <CornerStatus
          loading
          error={live.error}
          problem={live.lastProblem}
          status={live.status}
        />
      </main>
    );
  }

  return (
    <>
      <CornerStatus
        error={live.error}
        problem={live.lastProblem}
        status={live.status}
      />
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

// Aviso pequeño en la esquina inferior derecha (no tapa la presentación).
// - loading: aún no hay presentación ("Conectando…", y tras 10 s "Esperando al servidor…").
// - con presentación: solo aparece si la conexión lleva caída más de 8 s.
// Pasa el mouse por encima para ver el detalle (estado y último problema).
function CornerStatus({
  loading,
  error,
  problem,
  status,
}: {
  loading?: boolean;
  error: string | null;
  problem: string | null;
  status: ConnectionStatus;
}) {
  const quiet = useQuietStatus(status, 8000);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(t);
  }, []);
  if (!loading && quiet === "connected") return null;
  const text = loading
    ? slow
      ? "Esperando al servidor…"
      : "Conectando…"
    : "Reconectando…";
  return (
    <div
      role="status"
      title={[error, problem, `estado: ${status}`].filter(Boolean).join(" · ")}
      className="fixed right-4 bottom-4 z-50 flex max-w-xs items-center gap-2 rounded-full border border-white/10 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-400 backdrop-blur"
    >
      <Loader2Icon className="size-3.5 shrink-0 animate-spin" />
      <span className="truncate">{text}</span>
    </div>
  );
}
