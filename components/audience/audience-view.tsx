"use client";

import {
  CheckIcon,
  HourglassIcon,
  LockIcon,
  MessageCircleQuestionIcon,
  PartyPopperIcon,
  PencilIcon,
  SendIcon,
  UserIcon,
  WifiOffIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ConnectionDot } from "@/components/shared/connection-dot";
import { ResultBars } from "@/components/shared/result-bars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useLivePresentation } from "@/hooks/realtime/use-live-presentation";
import {
  AudienceView as View,
  QuestionType,
  type AnswerValue,
  type AudienceQuestion,
  type Question,
} from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { useParticipantStore } from "@/stores/participant-store";

export function AudienceView({ code }: { code: string }) {
  const live = useLivePresentation(code, "audience");
  // Último voto enviado por pregunta (para marcarlo y permitir cambiarlo).
  const [sent, setSent] = useState<Record<string, AnswerValue>>({});
  const { name, setName } = useParticipantStore();
  const [editingName, setEditingName] = useState(false);

  const header = (
    <header className="flex items-center justify-between gap-3">
      <ConnectionDot status={live.status} />
      {name && !editingName && (
        <button
          onClick={() => setEditingName(true)}
          className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
          aria-label="Cambiar nombre"
        >
          <UserIcon className="size-3.5 shrink-0" />
          <span className="truncate">{name}</span>
          <PencilIcon className="size-3 shrink-0 opacity-60" />
        </button>
      )}
      <Badge variant="outline" className="font-mono">{code}</Badge>
    </header>
  );

  // Antes de participar, el público escribe su nombre.
  if (!name || editingName) {
    return (
      <Shell header={header}>
        <NameForm
          initial={name ?? ""}
          onSave={(n) => {
            setName(n);
            setEditingName(false);
          }}
        />
      </Shell>
    );
  }

  if (!live.snapshot || !live.state) {
    return (
      <Shell header={header}>
        {live.error ? (
          <StateMessage
            icon={<WifiOffIcon />}
            title="No pudimos conectarte"
            text={live.error}
            action={<Button variant="outline" nativeButton={false} render={<Link href="/" />}>Volver al inicio</Button>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4" />
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        )}
      </Shell>
    );
  }

  const { state } = live;
  const questions = live.snapshot.survey.questions;
  const index = questions.findIndex((q) => q._id === state.currentQuestionId);
  const question = index >= 0 ? questions[index] : undefined;

  const submit = async (q: Question, value: AnswerValue) => {
    await live.answer(q._id, value);
    setSent((s) => ({ ...s, [q._id]: value }));
  };

  let body: ReactNode;
  let key: string;
  if (state.audienceView === View.QA) {
    key = "qa";
    body = <QaForm questions={live.qa} onAsk={live.ask} />;
  } else if (state.audienceView === View.CLOSED) {
    key = "closed";
    body = (
      <StateMessage
        icon={<PartyPopperIcon />}
        title="¡Gracias por participar!"
        text="La presentación terminó. Puedes cerrar esta página."
      />
    );
  } else if (state.audienceView === View.RESULTS && live.results) {
    key = `results-${live.results.questionId}`;
    body = (
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="mb-1">Resultados</Badge>
          <CardTitle className="text-xl leading-snug">{live.results.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultBars results={live.results} />
        </CardContent>
      </Card>
    );
  } else if (state.audienceView === View.QUESTION && question) {
    key = `q-${question._id}`;
    body = (
      <QuestionForm
        question={question}
        position={`Pregunta ${index + 1} de ${questions.length}`}
        open={state.acceptingResponses}
        sent={sent[question._id]}
        onSubmit={(v) => submit(question, v)}
      />
    );
  } else {
    key = "waiting";
    body = (
      <StateMessage
        icon={<HourglassIcon className="animate-pulse" />}
        title="Ya estás dentro"
        text="Mira la pantalla principal. Cuando haya una votación aparecerá aquí sola."
      />
    );
  }

  return (
    <Shell header={header}>
      <p className="text-sm text-muted-foreground">{live.snapshot.presentation.title}</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}

function Shell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-5">
      {header}
      {children}
    </main>
  );
}

function StateMessage({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-primary ring-1 ring-primary/30 [&_svg]:size-8">
        {icon}
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-xs text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}

function QuestionForm({
  question,
  position,
  open,
  sent,
  onSubmit,
}: {
  question: Question;
  position: string;
  open: boolean;
  sent: AnswerValue | undefined;
  onSubmit: (v: AnswerValue) => Promise<void>;
}) {
  const [multi, setMulti] = useState<string[]>(Array.isArray(sent) ? sent : []);
  const [text, setText] = useState(typeof sent === "string" ? sent : "");
  const [busy, setBusy] = useState(false);
  // Efecto "focus cards": la opción enfocada (hover, o la elegida si no hay
  // hover) queda nítida y el resto se desenfoca.
  const [hovered, setHovered] = useState<number | null>(null);
  const selectedIndex =
    question.type === QuestionType.SINGLE ? question.options.findIndex((o) => o.value === sent) : -1;
  const focused = hovered ?? (selectedIndex >= 0 ? selectedIndex : null);

  const send = async (v: AnswerValue) => {
    setBusy(true);
    try {
      await onSubmit(v);
      toast.success(sent === undefined ? "Voto enviado" : "Voto actualizado");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const disabled = !open || busy;

  let input: ReactNode;
  switch (question.type) {
    case QuestionType.SINGLE:
      input = question.options.map((o, i) => (
        <OptionButton
          key={o.value}
          index={i}
          focused={focused}
          setHovered={setHovered}
          letter={String.fromCharCode(65 + i)}
          label={o.label}
          selected={sent === o.value}
          disabled={disabled}
          onClick={() => send(o.value)}
        />
      ));
      break;
    case QuestionType.MULTIPLE:
      input = (
        <>
          {question.options.map((o, i) => {
            const on = multi.includes(o.value);
            return (
              <OptionButton
                key={o.value}
                index={i}
                focused={hovered}
                setHovered={setHovered}
                letter={String.fromCharCode(65 + i)}
                label={o.label}
                selected={on}
                disabled={disabled}
                onClick={() => setMulti((m) => (on ? m.filter((x) => x !== o.value) : [...m, o.value]))}
              />
            );
          })}
          <Button size="lg" className="h-12 text-base" disabled={disabled || multi.length === 0} onClick={() => send(multi)}>
            <SendIcon /> Enviar
          </Button>
        </>
      );
      break;
    case QuestionType.SCALE: {
      const min = question.min ?? 1;
      const max = question.max ?? 5;
      input = (
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
            <button
              key={n}
              disabled={disabled}
              onClick={() => send(n)}
              className={cn(
                "aspect-square rounded-xl border bg-card text-xl font-semibold transition hover:border-primary/60 disabled:opacity-50",
                sent === n && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      );
      break;
    }
    case QuestionType.TEXT:
      input = (
        <>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} rows={4} placeholder="Escribe tu respuesta…" />
          <Button size="lg" className="h-12 text-base" disabled={disabled || !text.trim()} onClick={() => send(text.trim())}>
            <SendIcon /> Enviar
          </Button>
        </>
      );
      break;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wider text-accent uppercase">{position}</span>
        <h1 className="text-2xl leading-snug font-semibold">{question.text}</h1>
        {question.type === QuestionType.MULTIPLE && (
          <p className="text-sm text-muted-foreground">Puedes elegir varias opciones.</p>
        )}
      </div>
      <div className="flex flex-col gap-3">{input}</div>
      <AnimatePresence>
        {!open ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-muted-foreground">
            <LockIcon className="size-4" /> La votación está cerrada.
          </motion.p>
        ) : sent !== undefined ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckIcon className="size-4" /> Voto registrado. Puedes cambiarlo mientras siga abierta.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function OptionButton({
  index,
  focused,
  setHovered,
  letter,
  label,
  selected,
  disabled,
  onClick,
}: {
  index: number;
  focused: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  letter: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card/80 p-4 text-left text-base backdrop-blur transition-all duration-300 ease-out",
        focused !== null && focused !== index && "blur-sm scale-[0.98]",
        "hover:border-primary/60 hover:bg-card disabled:pointer-events-none disabled:opacity-50",
        selected && "border-primary bg-primary/15 ring-2 ring-primary/40",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-mono font-semibold transition",
          selected && "bg-primary text-primary-foreground",
        )}
      >
        {selected ? <CheckIcon className="size-5" /> : letter}
      </span>
      <span className="flex-1">{label}</span>
      <span
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/10 transition-opacity duration-300",
          focused === index ? "opacity-100" : "opacity-0",
        )}
      />
    </motion.button>
  );
}

function NameForm({ initial, onSave }: { initial: string; onSave: (name: string) => void }) {
  const [value, setValue] = useState(initial);
  const trimmed = value.trim();
  return (
    <form
      className="flex flex-1 flex-col justify-center gap-4 py-10"
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed) onSave(trimmed);
      }}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-primary ring-1 ring-primary/30">
        <UserIcon className="size-7" />
      </div>
      <h1 className="text-2xl font-semibold">¿Cómo te llamas?</h1>
      <p className="text-muted-foreground">Tu nombre aparecerá junto a las preguntas que hagas.</p>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tu nombre"
        maxLength={60}
        autoFocus
        autoComplete="given-name"
        className="h-12 text-lg"
      />
      <Button type="submit" size="lg" className="h-12 text-base" disabled={!trimmed}>
        Continuar
      </Button>
    </form>
  );
}

// Ronda de preguntas: el participante puede enviar varias preguntas de texto.
function QaForm({
  questions,
  onAsk,
}: {
  questions: AudienceQuestion[];
  onAsk: (text: string) => Promise<void>;
}) {
  const participantId = useParticipantStore((s) => s.participantId);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const mine = questions.filter((q) => q.participantId === participantId).reverse();
  const trimmed = text.trim();

  const send = async () => {
    if (!trimmed) return;
    setBusy(true);
    try {
      await onAsk(trimmed);
      setText("");
      toast.success("Pregunta enviada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wider text-accent">Ronda de preguntas</span>
        <h1 className="text-2xl leading-snug font-semibold">¿Qué quieres profundizar?</h1>
        <p className="text-sm text-muted-foreground">Pregunta sobre cualquier parte de la presentación. Puedes enviar varias.</p>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={300}
        placeholder="Escribe tu pregunta…"
        disabled={busy}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">{text.length}/300</span>
        <Button size="lg" className="h-12 flex-1 text-base" disabled={busy || !trimmed} onClick={send}>
          <SendIcon /> Enviar pregunta
        </Button>
      </div>

      {mine.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircleQuestionIcon className="size-4" /> Tus preguntas ({mine.length})
          </p>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {mine.map((q) => (
                <motion.li
                  key={q._id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-xl border bg-card/80 p-3 text-sm"
                >
                  <span className="flex-1">{q.text}</span>
                  {q.answered && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-400">
                      <CheckIcon className="size-3.5" /> Respondida
                    </span>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </section>
  );
}
