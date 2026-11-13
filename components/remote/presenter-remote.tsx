"use client";

import {
  BarChart3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  TrophyIcon,
  UnlockIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import { getDeck, slideState } from "@/components/screen/decks";
import { ConnectionDot } from "@/components/shared/connection-dot";
import { ReconnectAllButton } from "@/components/shared/reconnect-all-button";
import { ReconnectBanner } from "@/components/shared/reconnect-banner";
import { EndPresentationDialog } from "@/components/shared/end-presentation-dialog";
import { QaModerator } from "@/components/shared/qa-moderator";
import { getInsights } from "@/components/shared/result-insights";
import { closeAndReveal, liveChart, reopenVote } from "@/components/shared/vote-actions";
import { useLivePresentation } from "@/hooks/realtime/use-live-presentation";
import { ScreenView, type UpdateStateInput } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { useRemoteStore, type RemoteAccess } from "@/stores/remote-store";
import { RemoteLogin } from "./remote-login";
import { canControl, canGoTo, phaseRange, type ControlScope } from "./turns";

// Vibración corta al tocar un botón (si el celular lo permite).
const buzz = () => {
  try {
    navigator.vibrate?.(15);
  } catch {
    // sin vibración
  }
};

// Control remoto: la clave decide el permiso (admin = todo; presentador = su fase).
export function PresenterRemote({ code }: { code: string }) {
  const { key, access } = useRemoteStore();
  if (!key || !access) return <RemoteLogin />;
  return <Remote code={code} controlKey={key} access={access} />;
}

function Remote({ code, controlKey, access }: { code: string; controlKey: string; access: RemoteAccess }) {
  const live = useLivePresentation(code, "admin", controlKey);
  const logout = useRemoteStore((s) => s.logout);
  const survey = live.snapshot?.survey;
  const deck = useMemo(() => (survey ? getDeck(survey) : null), [survey]);
  const ended = live.snapshot?.presentation.isActive === false;
  const slideIndex = Math.min(live.state?.slideIndex ?? 0, (deck?.slides.length ?? 1) - 1);
  // Admin: control completo. Presentador: solo su fase.
  const myPhase: ControlScope = access.role === "admin" ? "all" : access.phase;

  const set = (input: UpdateStateInput) => {
    buzz();
    live.updateState(input).catch((e: Error) => toast.error(e.message));
  };
  const goTo = (i: number) => {
    if (!deck || !survey || ended || !canGoTo(deck, slideIndex, i, myPhase)) return;
    set(slideState(deck, survey, i));
  };

  // Mantiene la pantalla del celular encendida mientras se presenta.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = () =>
      navigator.wakeLock
        ?.request("screen")
        .then((l) => (lock = l))
        .catch(() => {});
    void request();
    const onVisible = () => document.visibilityState === "visible" && void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, []);

  // Clickers de presentación / teclado: ←/→, PageUp/PageDown.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [role=dialog]")) return;
      if (["ArrowRight", "PageDown"].includes(e.key)) goTo(slideIndex + 1);
      if (["ArrowLeft", "PageUp"].includes(e.key)) goTo(slideIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!live.snapshot || !live.state || !deck || !survey) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center text-lg text-muted-foreground">
        {live.error ?? "Conectando…"}
        {live.error && (
          <button onClick={logout} className="rounded-xl border border-white/15 px-5 py-3 text-foreground">
            Usar otra clave
          </button>
        )}
      </main>
    );
  }

  const owners = deck.owners;

  const { state } = live;
  const slide = deck.slides[slideIndex];
  const myTurn = canControl(deck, slideIndex, myPhase);
  const owner = slide.phase !== undefined ? owners?.[slide.phase] : undefined;
  const myRange = myPhase !== "all" && owners ? phaseRange(deck, myPhase) : null;
  const who =
    access.role === "admin"
      ? "Admin · control completo"
      : `${owners?.[access.phase]?.name ?? "Presentador"} · F${access.phase}`;
  const nextSlide = deck.slides[slideIndex + 1];
  const isLast = slideIndex === deck.slides.length - 1;
  const question = slide.questionIndex !== undefined ? survey.questions[slide.questionIndex] : undefined;
  const voteActive = !!question && state.currentQuestionId === question._id;
  const results = voteActive && live.results?.questionId === question._id ? live.results : null;
  const insights = voteActive && !state.acceptingResponses && results ? getInsights(results) : null;
  const chartOnScreen = state.screenView === ScreenView.RESULTS;

  return (
    <main className="flex h-dvh flex-col gap-3 p-3 select-none sm:p-5">
      <ReconnectBanner status={live.status} />
      {/* Estado */}
      <header className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <ConnectionDot status={live.status} />
          {!ended && <ReconnectAllButton onReconnect={live.reconnectAll} compact className="px-2" />}
        </span>
        <button
          onClick={() => {
            if (confirm("¿Salir del control remoto? Tendrás que escribir la clave otra vez.")) logout();
          }}
          className={cn(
            "flex min-w-0 items-center gap-1.5 rounded-full border px-3 py-1 text-foreground",
            access.role === "admin" ? "border-cyan-400/40 text-cyan-200" : "border-white/10",
          )}
          aria-label="Salir del control remoto"
        >
          <UserIcon className="size-3.5 shrink-0" />
          <span className="truncate">{who}</span>
        </button>
        <span className="tabular-nums">
          {slideIndex + 1} / {deck.slides.length}
        </span>
      </header>

      <section className="rounded-2xl border bg-card/60 px-4 py-3">
        <p className="text-xl leading-tight font-semibold">{slide.title}</p>
        {nextSlide && <p className="mt-1 truncate text-sm text-muted-foreground">Sigue: {nextSlide.title}</p>}
        {question && (
          <p className="mt-2 text-sm">
            <span className="text-2xl font-bold tabular-nums">{results?.totalResponses ?? 0}</span>{" "}
            <span className="text-muted-foreground">
              votos · {voteActive && state.acceptingResponses ? "votación abierta" : "votación cerrada"}
            </span>
          </p>
        )}
        {insights && insights.winners[0] && (
          <p className="mt-2 flex items-center gap-2 text-sm text-cyan-300">
            <TrophyIcon className="size-4 shrink-0" />
            {insights.lines[0]}
          </p>
        )}
      </section>

      {ended ? (
        <p className="flex flex-1 items-center justify-center text-center text-xl text-muted-foreground">
          La presentación terminó.
        </p>
      ) : !myTurn ? (
        // Fuera de su fase: sin controles, solo a quién le toca y cuándo es su turno.
        <section className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <LockIcon className="size-10 text-muted-foreground" />
          <p className="text-2xl font-semibold">Ahora presenta {owner?.name ?? "otra persona"}</p>
          {owner && slide.phase !== undefined && (
            <p className="text-muted-foreground">
              Fase {slide.phase} · {owner.title}
            </p>
          )}
          {myRange && myPhase !== "all" && (
            <p className="mt-2 text-sm text-cyan-300">
              Tu parte (fase {myPhase}): diapositivas {myRange[0]} a {myRange[1]}.
              {slideIndex + 1 < myRange[0] ? " Los controles se activan cuando llegue tu turno." : ""}
            </p>
          )}
        </section>
      ) : (
        <>
          {/* Ronda de preguntas: lista desplazable con botones grandes */}
          {slide.qa && (
            <section className="flex min-h-0 flex-1 flex-col gap-2">
              <p className="text-sm text-muted-foreground">Preguntas del público ({live.qa.length})</p>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <QaModerator
                  code={code}
                  questions={live.qa}
                  highlightedId={state.highlightedQuestionId}
                  onHighlight={(id) => set({ highlightedQuestionId: id })}
                  large
                />
              </div>
            </section>
          )}

          {/* Acciones de la diapositiva */}
          <div className="grid auto-rows-fr gap-3">
            {question && voteActive && (
              <BigButton
                tone={state.acceptingResponses ? "accent" : "muted"}
                icon={state.acceptingResponses ? <LockIcon /> : <UnlockIcon />}
                onClick={() => set(state.acceptingResponses ? closeAndReveal() : reopenVote())}
              >
                {state.acceptingResponses ? "Cerrar y revelar resultados" : "Reabrir votación"}
              </BigButton>
            )}
            {question && voteActive && state.acceptingResponses && (
              <BigButton
                tone={chartOnScreen ? "accent" : "muted"}
                icon={<BarChart3Icon />}
                onClick={() => set(liveChart(!chartOnScreen))}
              >
                {chartOnScreen ? "Ocultar gráfica" : "Mostrar gráfica en vivo"}
              </BigButton>
            )}
            {slide.sidePanel && (
              <BigButton
                tone={state.showSidePanel ? "accent" : "muted"}
                icon={state.showSidePanel ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
                onClick={() => set({ showSidePanel: !state.showSidePanel })}
              >
                {state.showSidePanel ? "Ocultar" : "Mostrar"} {slide.sidePanel.label}
              </BigButton>
            )}
            {isLast && <EndPresentationDialog code={code} size="lg" />}
          </div>

          {/* Navegación: botones gigantes */}
          <div
            className={cn(
              "grid grid-cols-[1fr_2fr] gap-3",
              slide.qa ? "h-[18dvh] shrink-0" : "min-h-[38dvh] flex-1",
            )}
          >
            <NavButton
              disabled={!canGoTo(deck, slideIndex, slideIndex - 1, myPhase)}
              onClick={() => goTo(slideIndex - 1)}
              label="Anterior"
            >
              <ChevronLeftIcon />
            </NavButton>
            <NavButton
              primary
              disabled={isLast || !canGoTo(deck, slideIndex, slideIndex + 1, myPhase)}
              onClick={() => goTo(slideIndex + 1)}
              label={
                // En su última diapositiva, "Siguiente" entrega el turno a quien sigue.
                !canControl(deck, slideIndex + 1, myPhase) && nextSlide?.phase !== undefined && owners
                  ? `Pasar a ${owners[nextSlide.phase]?.name ?? "siguiente"}`
                  : "Siguiente"
              }
            >
              <ChevronRightIcon />
            </NavButton>
          </div>
        </>
      )}
    </main>
  );
}

function BigButton({
  children,
  icon,
  tone,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  tone: "accent" | "muted";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-h-16 touch-manipulation items-center justify-center gap-3 rounded-2xl border px-4 text-lg font-semibold transition active:scale-[0.98] [&_svg]:size-6",
        tone === "accent"
          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
          : "border-white/10 bg-white/[0.05] text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function NavButton({
  children,
  label,
  primary,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex touch-manipulation flex-col items-center justify-center gap-2 rounded-3xl text-xl font-semibold transition active:scale-[0.97] disabled:opacity-30 [&_svg]:size-16",
        primary
          ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30"
          : "border border-white/10 bg-white/[0.06] text-foreground",
      )}
    >
      {children}
      {label}
    </button>
  );
}

