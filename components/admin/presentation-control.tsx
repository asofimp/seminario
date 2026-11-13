"use client";

import {
  ArrowLeftIcon,
  BarChart3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MessageSquareQuoteIcon,
  MonitorIcon,
  MonitorPlayIcon,
  SmartphoneIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  StickyNoteIcon,
  UnlockIcon,
  UsersIcon,
  VoteIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getDeck, slideState } from "@/components/screen/decks";
import { ConnectionDot } from "@/components/shared/connection-dot";
import { ReconnectBanner } from "@/components/shared/reconnect-banner";
import { EndPresentationDialog } from "@/components/shared/end-presentation-dialog";
import { QaModerator } from "@/components/shared/qa-moderator";
import { ResultBars } from "@/components/shared/result-bars";
import { closeAndReveal, liveChart, reopenVote } from "@/components/shared/vote-actions";
import { getInsights } from "@/components/shared/result-insights";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLivePresentation } from "@/hooks/realtime/use-live-presentation";
import { JOIN_HOST } from "@/lib/env";
import { AudienceView, ScreenView, type UpdateStateInput } from "@/lib/types/api";
import { cn } from "@/lib/utils";

// Panel de control en vivo (rol admin por socket): mueve las diapositivas de la
// pantalla proyectada y abre/cierra las votaciones.
export function PresentationControl({ code }: { code: string }) {
  const live = useLivePresentation(code, "admin");
  // El socket solo emite el state; isActive llega en el snapshot inicial o al terminar aquí.
  const [endedHere, setEndedHere] = useState(false);
  const survey = live.snapshot?.survey;
  const deck = useMemo(() => (survey ? getDeck(survey) : null), [survey]);

  const ended = live.snapshot?.presentation.isActive === false || endedHere;
  const slideIndex = Math.min(live.state?.slideIndex ?? 0, (deck?.slides.length ?? 1) - 1);

  const run = (fn: () => Promise<unknown>) =>
    fn().catch((e: Error) => toast.error(e.message));
  const set = (input: UpdateStateInput) => run(() => live.updateState(input));
  const goTo = (i: number) => {
    if (!deck || !survey || ended || i < 0 || i >= deck.slides.length) return;
    void set(slideState(deck, survey, i));
  };

  // ←/→ también funcionan en el panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [role=dialog]")) return;
      if (e.key === "ArrowRight") goTo(slideIndex + 1);
      if (e.key === "ArrowLeft") goTo(slideIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!live.snapshot || !live.state || !deck || !survey) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
        {live.error ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo conectar</AlertTitle>
            <AlertDescription>{live.error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </>
        )}
      </main>
    );
  }

  const { state } = live;
  const slide = deck.slides[slideIndex];
  const question = slide.questionIndex !== undefined ? survey.questions[slide.questionIndex] : undefined;
  const voteActive = !!question && state.currentQuestionId === question._id;
  const results = voteActive && live.results?.questionId === question._id ? live.results : null;
  const chartOnScreen = state.screenView === ScreenView.RESULTS;
  const voteClosed = voteActive && !state.acceptingResponses;
  const insights = voteClosed && results ? getInsights(results) : null;
  const joinHost = JOIN_HOST ?? window.location.host;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <ReconnectBanner status={live.status} />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/admin" />}>
            <ArrowLeftIcon />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionDot status={live.status} />
          <span className="flex items-center gap-1.5 text-sm">
            <UsersIcon className="size-4 text-muted-foreground" />
            <span className="font-semibold tabular-nums">{live.participants}</span>
            <span className="text-muted-foreground">conectados</span>
          </span>
        </div>
      </header>

      {/* Código + accesos a las otras vistas */}
      <Card className="bg-gradient-to-r from-primary/15 to-accent/10">
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{live.snapshot.presentation.title}</p>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-4xl font-bold tracking-[0.3em]">{code}</span>
              <span className="text-sm text-muted-foreground">en {joinHost}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button nativeButton={false} render={<a href={`/screen/${code}`} target="_blank" />}>
              <MonitorPlayIcon /> Abrir pantalla
            </Button>
            <Button variant="outline" nativeButton={false} render={<a href={`/remote/${code}`} target="_blank" />}>
              <SmartphoneIcon /> Control remoto
            </Button>
            <Button variant="outline" nativeButton={false} render={<a href={`/p/${code}`} target="_blank" />}>
              <ExternalLinkIcon /> Vista público
            </Button>
          </div>
        </CardContent>
      </Card>

      {ended && (
        <Alert>
          <LockIcon />
          <AlertTitle>Presentación terminada</AlertTitle>
          <AlertDescription>Ya no se puede votar ni cambiar de diapositiva. Puedes crear otra desde el panel.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Diapositiva actual */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                Diapositiva {slideIndex + 1} de {deck.slides.length}
              </Badge>
              {slide.duration && <Badge variant="outline">{slide.duration}</Badge>}
              {question && (
                <Badge className={cn(voteActive && state.acceptingResponses ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground")}>
                  <VoteIcon /> {voteActive && state.acceptingResponses ? "Votación abierta" : "Votación cerrada"}
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl leading-snug">{question?.text ?? slide.title}</CardTitle>
            <Progress value={((slideIndex + 1) / deck.slides.length) * 100} className="mt-2" />
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {insights && (
              <div className="flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent uppercase">
                  <MessageSquareQuoteIcon className="size-4" /> Puntos para comentar
                </p>
                <ul className="flex flex-col gap-1.5 text-base leading-snug">
                  {insights.lines.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {slide.notes && (
              <div className="flex gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-relaxed">
                <StickyNoteIcon className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-amber-400 uppercase">Notas del presentador</p>
                  {slide.notes}
                </div>
              </div>
            )}

            {question &&
              (results ? (
                <ResultBars results={results} size="lg" />
              ) : (
                <div className="flex flex-col gap-3">
                  {question.options.map((o) => (
                    <Skeleton key={o.value} className="h-9" />
                  ))}
                  <p className="text-sm text-muted-foreground">Esperando votos…</p>
                </div>
              ))}

            {!question && !slide.notes && (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <MonitorIcon className="size-10" />
                Diapositiva de contenido
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="lg" className="h-12 text-base" disabled={ended || slideIndex <= 0} onClick={() => goTo(slideIndex - 1)}>
                <ChevronLeftIcon /> Anterior
              </Button>
              <Button size="lg" className="h-12 text-base" disabled={ended || slideIndex >= deck.slides.length - 1} onClick={() => goTo(slideIndex + 1)}>
                Siguiente <ChevronRightIcon />
              </Button>
            </div>
            <p className="-mt-2 text-center text-xs text-muted-foreground">También con las flechas ← → del teclado</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Ronda de preguntas */}
          {slide.qa && (
            <Card>
              <CardHeader>
                <CardTitle>Preguntas del público ({live.qa.length})</CardTitle>
                <CardDescription>Ponlas en pantalla y márcalas como respondidas.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[480px] overflow-y-auto">
                <QaModerator
                  code={code}
                  questions={live.qa}
                  highlightedId={state.highlightedQuestionId}
                  onHighlight={(id) => set({ highlightedQuestionId: id })}
                />
              </CardContent>
            </Card>
          )}

          {/* Panel lateral de la diapositiva (definición, analogía…) */}
          {slide.sidePanel && (
            <Card>
              <CardHeader>
                <CardTitle>Panel lateral</CardTitle>
                <CardDescription>Se muestra a un costado de la diapositiva en la pantalla proyectada.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="h-10 w-full justify-start"
                  variant={state.showSidePanel ? "default" : "secondary"}
                  disabled={ended}
                  onClick={() => set({ showSidePanel: !state.showSidePanel })}
                >
                  {state.showSidePanel ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
                  {state.showSidePanel ? "Ocultar" : "Mostrar"} {slide.sidePanel.label}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Controles de la votación */}
          <Card>
            <CardHeader>
              <CardTitle>Votación</CardTitle>
              <CardDescription>
                {question ? "Controla la votación de esta diapositiva." : "Esta diapositiva no tiene votación."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                className="h-10 justify-start"
                variant={chartOnScreen ? "default" : "secondary"}
                disabled={ended || !voteActive}
                onClick={() => set(liveChart(!chartOnScreen))}
              >
                <BarChart3Icon />
                {chartOnScreen ? "Ocultar gráfica en vivo" : "Mostrar gráfica en vivo"}
              </Button>
              <Button
                variant="secondary"
                className="h-10 justify-start"
                disabled={ended || !voteActive}
                onClick={() => set(state.acceptingResponses ? closeAndReveal() : reopenVote())}
              >
                {state.acceptingResponses ? <LockIcon /> : <UnlockIcon />}
                {state.acceptingResponses ? "Cerrar votación y revelar resultados" : "Reabrir votación"}
              </Button>
              <Button
                variant="secondary"
                className="h-10 justify-start"
                disabled={ended || !voteActive}
                onClick={() =>
                  set({
                    showResultsToAudience: !state.showResultsToAudience,
                    audienceView: state.showResultsToAudience ? AudienceView.QUESTION : AudienceView.RESULTS,
                  })
                }
              >
                {state.showResultsToAudience ? <EyeOffIcon /> : <EyeIcon />}
                {state.showResultsToAudience ? "Ocultar resultados en celulares" : "Mostrar resultados en celulares"}
              </Button>
              {!ended && (
                <>
                  <Separator className="my-2" />
                  <EndPresentationDialog code={code} size="default" onEnded={() => setEndedHere(true)} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Índice de diapositivas */}
          <Card>
            <CardHeader>
              <CardTitle>Diapositivas</CardTitle>
            </CardHeader>
            <CardContent className="flex max-h-[420px] flex-col gap-1 overflow-y-auto">
              {deck.slides.map((s, i) => (
                <button
                  key={i}
                  disabled={ended}
                  onClick={() => goTo(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted disabled:pointer-events-none disabled:opacity-60",
                    i === slideIndex && "bg-primary/15 text-foreground ring-1 ring-primary/40",
                  )}
                >
                  <span className="w-5 font-mono text-muted-foreground">{i + 1}</span>
                  <span className="line-clamp-1 flex-1">{s.title}</span>
                  {s.sidePanel && <PanelRightOpenIcon className="size-4 text-muted-foreground" />}
                  {s.questionIndex !== undefined && <VoteIcon className="size-4 text-accent" />}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
