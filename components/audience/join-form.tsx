"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { ArrowRightIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ApiError } from "@/lib/api/client";
import { presentationsApi } from "@/lib/api/endpoints";

const CODE_LENGTH = 6;

// Pantalla inicial: valida el código contra el backend (que exista y siga activa).
export function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async (c: string) => {
    setChecking(true);
    setError(null);
    try {
      const { presentation } = await presentationsApi.snapshot(c);
      if (presentation.isActive === false) {
        setError("Esa presentación ya terminó.");
        return;
      }
      router.push(`/p/${encodeURIComponent(presentation.code)}`);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 404
          ? "No existe una presentación con ese código."
          : (e as Error).message,
      );
    } finally {
      setChecking(false);
    }
  };

  const complete = code.length === CODE_LENGTH;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <h1 className="max-w-lg text-4xl font-bold tracking-tight sm:text-5xl">
          Agentes de IA y <span className="text-gradient">ciberseguridad</span>
        </h1>
        <p className="max-w-md text-muted-foreground">
          Vota desde tu celular y mira los resultados en vivo.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <Card className="backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Unirse a la presentación</CardTitle>
            <CardDescription>Escribe el código que aparece en pantalla</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col items-center gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (complete) void join(code);
              }}
            >
              <InputOTP
                maxLength={CODE_LENGTH}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                value={code}
                onChange={(v) => {
                  setCode(v.toUpperCase());
                  setError(null);
                }}
                onComplete={(v: string) => void join(v.toUpperCase())}
                autoFocus
                inputMode="text"
              >
                <InputOTPGroup>
                  {Array.from({ length: CODE_LENGTH }, (_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="size-12 font-mono text-xl uppercase sm:size-13"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={!complete || checking}>
                {checking ? <Loader2Icon className="animate-spin" /> : null}
                {checking ? "Verificando…" : "Entrar"}
                {!checking && <ArrowRightIcon data-icon="inline-end" />}
              </Button>

              {error && (
                <Alert variant="destructive" className="w-full">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-3.5" />
          Tu voto es anónimo
        </p>
      </motion.div>
    </main>
  );
}
