"use client";

import { KeyRoundIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import { useRemoteStore } from "@/stores/remote-store";

// Entrada del control remoto: la clave decide el permiso.
// Clave de presentador -> solo su fase. Clave de admin -> control completo.
export function RemoteLogin() {
  const login = useRemoteStore((s) => s.login);
  const [key, setKey] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const k = key.trim();
    if (!k) return;
    setChecking(true);
    setError(null);
    try {
      login(k, await authApi.remote(k));
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? "Clave incorrecta" : (e as Error).message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="flex h-dvh flex-col justify-center gap-5 p-6">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-primary ring-1 ring-primary/30">
        <KeyRoundIcon className="size-7" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">Control remoto</h1>
        <p className="mt-1 text-muted-foreground">Escribe tu clave de presentador para manejar tu fase.</p>
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError(null);
          }}
          placeholder="Clave"
          autoFocus
          autoComplete="current-password"
          className="h-14 text-lg"
        />
        <Button type="submit" size="lg" className="h-14 text-lg" disabled={checking || !key.trim()}>
          {checking ? <Loader2Icon className="animate-spin" /> : null}
          {checking ? "Verificando…" : "Entrar"}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </main>
  );
}
