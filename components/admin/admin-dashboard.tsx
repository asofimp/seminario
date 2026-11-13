"use client";

import {
  ChevronDownIcon,
  ClipboardListIcon,
  KeyRoundIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorPlayIcon,
  QrCodeIcon,
  SmartphoneIcon,
  UserIcon,
  PlayIcon,
  PlusIcon,
  RadioIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { EndPresentationDialog } from "@/components/shared/end-presentation-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreatePresentation, usePresentations } from "@/hooks/api/use-presentations";
import { useSurveys } from "@/hooks/api/use-surveys";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_KEY_HEADER, ApiError, api } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import type { Presentation, Survey } from "@/lib/types/api";
import { completoDeck } from "@/components/screen/decks/completo";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";

const isActive = (p: Presentation) => p.isActive !== false;
// Presentación principal activa (las prácticas no cuentan para el límite).
const isMainActive = (p: Presentation) => isActive(p) && !p.practice;

export function AdminDashboard() {
  const { adminKey, setAdminKey } = useAdminStore();
  if (!adminKey) return <AdminLogin onLogin={setAdminKey} />;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <SignedInAs adminKey={adminKey} />
        <Button variant="ghost" size="sm" onClick={() => setAdminKey(null)}>
          <LogOutIcon /> Cerrar sesión
        </Button>
      </header>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administración</h1>
        <p className="text-muted-foreground">Crea una presentación a partir de una encuesta y contrólala en vivo.</p>
      </div>
      <ActivePresentationBanner />
      <SurveysSection />
      <PresentationsSection />
    </main>
  );
}

export function AdminLogin({ onLogin }: { onLogin: (key: string) => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Valida la clave contra una ruta protegida antes de guardarla.
  const login = async (key: string) => {
    setChecking(true);
    setError(null);
    try {
      await api.get("/presentations", { headers: { [ADMIN_KEY_HEADER]: key } });
      onLogin(key);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 401
          ? "Clave incorrecta"
          : `No se pudo verificar la clave: ${(e as Error).message}`,
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-sm backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">Panel de administración</CardTitle>
          <CardDescription>Ingresa tu clave de presentador (o la de admin) para crear y controlar las presentaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const key = keyInput.trim();
              if (key) void login(key);
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-key">Clave</Label>
              <Input
                id="admin-key"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                autoFocus
                className="h-10"
              />
            </div>
            <Button type="submit" size="lg" className="h-10" disabled={checking || !keyInput.trim()}>
              {checking ? <Loader2Icon className="animate-spin" /> : <KeyRoundIcon />}
              {checking ? "Verificando…" : "Entrar"}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

// Arriba: la presentación principal en curso y todas las prácticas activas.
function ActivePresentationBanner() {
  const { data } = usePresentations();
  const main = data?.find(isMainActive);
  const practices = data?.filter((p) => isActive(p) && p.practice) ?? [];
  if (!main && practices.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {main && <ActiveCard presentation={main} />}
      {practices.map((p) => (
        <ActiveCard key={p._id} presentation={p} practice />
      ))}
    </section>
  );
}

function ActiveCard({ presentation: p, practice }: { presentation: Presentation; practice?: boolean }) {
  return (
    <Card
      className={cn(
        practice ? "border-white/10 bg-card/60" : "border-primary/40 bg-gradient-to-r from-primary/15 to-accent/10",
      )}
    >
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              practice ? "bg-white/5 text-muted-foreground" : "bg-primary/20 text-primary",
            )}
          >
            <RadioIcon className="animate-pulse" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-accent">{practice ? "Práctica en curso" : "En curso"}</p>
            <p className="truncate font-semibold">{p.title}</p>
            <p className={cn("font-mono tracking-widest", practice ? "text-lg" : "text-2xl")}>{p.code}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href={`/admin/presentations/${p.code}`} />}>
            <PlayIcon /> Controlar
          </Button>
          <Button variant="outline" nativeButton={false} render={<a href={`/screen/${p.code}`} target="_blank" />}>
            <MonitorPlayIcon /> Pantalla
          </Button>
          <Button variant="outline" nativeButton={false} render={<a href={`/remote/${p.code}`} target="_blank" />}>
            <SmartphoneIcon /> Control remoto
          </Button>
          <Button variant="outline" nativeButton={false} render={<a href={`/qr/${p.code}`} target="_blank" />}>
            <QrCodeIcon /> QR
          </Button>
          <EndPresentationDialog code={p.code} size="default" />
        </div>
      </CardContent>
    </Card>
  );
}

function SurveysSection() {
  const { data, isLoading, error } = useSurveys();
  const presentations = usePresentations();
  // Solo una presentación activa a la vez (el backend también lo valida).
  const active = presentations.data?.find(isMainActive);
  const [showPractice, setShowPractice] = useState(false);

  // La presentación completa va visible; las fases sueltas, solo para practicar.
  const main = data?.filter((s) => s.title === completoDeck.surveyTitle) ?? [];
  const practice = (data?.filter((s) => s.title !== completoDeck.surveyTitle) ?? []).sort((a, b) =>
    a.title.localeCompare(b.title, "es", { numeric: true }),
  );

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ClipboardListIcon className="size-5 text-muted-foreground" /> Presentación
      </h2>
      {error && <ErrorAlert message={error.message} />}
      {isLoading && <Skeleton className="h-40 rounded-xl" />}
      {main.map((s) => (
        <SurveyCard key={s._id} survey={s} active={active} />
      ))}
      {data && main.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No está la encuesta “{completoDeck.surveyTitle}”. Cárgala con{" "}
          <code className="font-mono">node scripts/seed-surveys.mjs seed/seminario-completo.json</code> en el backend.
        </p>
      )}

      {practice.length > 0 && (
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            className="w-fit text-muted-foreground"
            onClick={() => setShowPractice((v) => !v)}
            aria-expanded={showPractice}
          >
            <ChevronDownIcon className={cn("transition-transform", showPractice && "rotate-180")} />
            Practicar por fase ({practice.length})
          </Button>
          {showPractice && (
            <>
              <p className="text-sm text-muted-foreground">
                Para ensayar una fase sola. Puedes tener varias prácticas abiertas a la vez y no bloquean la presentación completa.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {practice.map((s) => (
                  <SurveyCard key={s._id} survey={s} active={undefined} compact />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function SurveyCard({
  survey: s,
  active,
  compact,
}: {
  survey: Survey;
  active: Presentation | undefined;
  compact?: boolean;
}) {
  const createPresentation = useCreatePresentation();
  return (
    <Card className={cn(compact && "bg-card/50")}>
      <CardHeader>
        <CardTitle>{s.title}</CardTitle>
        {s.description && !compact && <CardDescription>{s.description}</CardDescription>}
        <CardAction>
          <Badge variant="secondary">
            {s.questions.length} {s.questions.length === 1 ? "pregunta" : "preguntas"}
          </Badge>
        </CardAction>
      </CardHeader>
      {!compact && (
        <CardContent>
          <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
            {s.questions.map((q, i) => (
              <li key={q._id} className="line-clamp-1">
                <span className="mr-2 font-mono text-xs">{i + 1}.</span>
                {q.text}
              </li>
            ))}
          </ol>
        </CardContent>
      )}
      <CardFooter>
        <Tooltip>
          <TooltipTrigger render={<span className="w-full" />}>
            <Button
              className="w-full"
              variant={compact ? "secondary" : "default"}
              disabled={createPresentation.isPending || !!active}
              onClick={() =>
                createPresentation.mutate(
                  { title: compact ? `Práctica · ${s.title}` : s.title, surveyId: s._id, practice: compact },
                  {
                    onSuccess: (p) => toast.success(`${compact ? "Práctica creada" : "Presentación creada"}: ${p.code}`),
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              <PlusIcon /> {compact ? "Practicar" : "Crear presentación"}
            </Button>
          </TooltipTrigger>
          {active && <TooltipContent>Termina {active.code} para crear otra</TooltipContent>}
        </Tooltip>
      </CardFooter>
    </Card>
  );
}

function PresentationsSection() {
  const { data, isLoading, error } = usePresentations();

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <RadioIcon className="size-5 text-muted-foreground" /> Presentaciones
      </h2>
      {error && <ErrorAlert message={error.message} />}
      <Card className="py-0">
        <ul className="divide-y">
          {isLoading && (
            <li className="p-4">
              <Skeleton className="h-6 w-1/2" />
            </li>
          )}
          {data?.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">Aún no hay presentaciones.</li>
          )}
          {data?.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="font-mono text-base tracking-wider">{p.code}</span>
              <Link href={`/admin/presentations/${p.code}`} className="flex-1 truncate hover:underline">
                {p.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                {new Date(p.createdAt).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })}
              </span>
              {p.practice && <Badge variant="secondary">Práctica</Badge>}
              {isActive(p) ? (
                <>
                  <Badge className="bg-emerald-500/15 text-emerald-400">Activa</Badge>
                  <EndPresentationDialog code={p.code} />
                </>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">Terminada</Badge>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// Quién entró al panel: admin o el presentador dueño de la clave.
function SignedInAs({ adminKey }: { adminKey: string }) {
  const { data } = useQuery({
    queryKey: ["auth", "panel", adminKey],
    queryFn: () => authApi.remote(adminKey),
    staleTime: Infinity,
  });
  if (!data) return <span />;
  const label =
    data.role === "admin"
      ? "Admin"
      : `${completoDeck.owners?.[data.phase]?.name ?? "Presentador"} · Fase ${data.phase}`;
  return (
    <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-muted-foreground">
      <UserIcon className="size-3.5" /> {label}
    </span>
  );
}
