"use client";

import {
  ClipboardListIcon,
  KeyRoundIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorPlayIcon,
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
import { ADMIN_KEY_HEADER, ApiError, api } from "@/lib/api/client";
import type { Presentation } from "@/lib/types/api";
import { useAdminStore } from "@/stores/admin-store";

const isActive = (p: Presentation) => p.isActive !== false;

export function AdminDashboard() {
  const { adminKey, setAdminKey } = useAdminStore();
  if (!adminKey) return <AdminLogin onLogin={setAdminKey} />;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <span />
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

function AdminLogin({ onLogin }: { onLogin: (key: string) => void }) {
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
          <CardDescription>Ingresa la clave para controlar las presentaciones.</CardDescription>
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

function ActivePresentationBanner() {
  const { data } = usePresentations();
  const active = data?.find(isActive);
  if (!active) return null;

  return (
    <Card className="border-primary/40 bg-gradient-to-r from-primary/15 to-accent/10">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <RadioIcon className="animate-pulse" />
          </span>
          <div>
            <p className="text-xs font-medium tracking-wider text-accent uppercase">En curso</p>
            <p className="font-semibold">{active.title}</p>
            <p className="font-mono text-2xl tracking-widest">{active.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button nativeButton={false} render={<Link href={`/admin/presentations/${active.code}`} />}>
            <PlayIcon /> Controlar
          </Button>
          <Button variant="outline" nativeButton={false} render={<a href={`/screen/${active.code}`} target="_blank" />}>
            <MonitorPlayIcon /> Pantalla
          </Button>
          <EndPresentationDialog code={active.code} size="default" />
        </div>
      </CardContent>
    </Card>
  );
}

function SurveysSection() {
  const { data, isLoading, error } = useSurveys();
  const presentations = usePresentations();
  const createPresentation = useCreatePresentation();
  // Solo una presentación activa a la vez (el backend también lo valida).
  const active = presentations.data?.find(isActive);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ClipboardListIcon className="size-5 text-muted-foreground" /> Encuestas
      </h2>
      {error && <ErrorAlert message={error.message} />}
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading &&
          [0, 1].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        {data?.map((s) => (
          <Card key={s._id}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              {s.description && <CardDescription>{s.description}</CardDescription>}
              <CardAction>
                <Badge variant="secondary">{s.questions.length} preguntas</Badge>
              </CardAction>
            </CardHeader>
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
            <CardFooter>
              <Tooltip>
                <TooltipTrigger render={<span className="w-full" />}>
                  <Button
                    className="w-full"
                    disabled={createPresentation.isPending || !!active}
                    onClick={() =>
                      createPresentation.mutate(
                        { title: s.title, surveyId: s._id },
                        {
                          onSuccess: (p) => toast.success(`Presentación creada: ${p.code}`),
                          onError: (e) => toast.error(e.message),
                        },
                      )
                    }
                  >
                    <PlusIcon /> Crear presentación
                  </Button>
                </TooltipTrigger>
                {active && (
                  <TooltipContent>Termina {active.code} para crear otra</TooltipContent>
                )}
              </Tooltip>
            </CardFooter>
          </Card>
        ))}
      </div>
      {data?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay encuestas. Cárgalas con <code className="font-mono">npm run seed</code> en el backend.
        </p>
      )}
    </section>
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
