"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { JoinPanel } from "@/components/screen/join-slide";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { presentationsApi } from "@/lib/api/endpoints";
import { JOIN_HOST } from "@/lib/env";

const POLL_MS = 10_000;

// Host para unirse (solo existe en el navegador).
function useJoinHost() {
  return useSyncExternalStore(
    () => () => {},
    () => JOIN_HOST ?? window.location.host,
    () => "",
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-neutral-950 px-[6vw] antialiased">
      <div className="pointer-events-none absolute inset-0 isolate z-0">
        <BackgroundBeams />
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </main>
  );
}

function Waiting({ text }: { text: string }) {
  return (
    <p className="flex items-center justify-center gap-3 text-center text-[clamp(1.2rem,2vw,2rem)] text-neutral-400">
      <Loader2Icon className="animate-spin" /> {text}
    </p>
  );
}

// /qr/[code]: QR de una presentación concreta, para una pantalla aparte.
export function QrScreen({ code }: { code: string }) {
  const joinHost = useJoinHost();
  const [ended, setEnded] = useState(false);

  // Si la presentación termina, deja de mostrar el QR.
  useEffect(() => {
    let cancelled = false;
    const check = () =>
      presentationsApi
        .snapshot(code)
        .then(({ presentation }) => !cancelled && setEnded(presentation.isActive === false))
        .catch(() => {});
    void check();
    const t = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [code]);

  if (!joinHost) return <Frame>{null}</Frame>;
  return (
    <Frame>
      {ended ? <Waiting text="La presentación terminó." /> : <JoinPanel code={code} joinHost={joinHost} />}
    </Frame>
  );
}

// /qr: siempre el QR de la presentación activa (cambia sola si se crea otra).
export function ActiveQrScreen() {
  const joinHost = useJoinHost();
  const [code, setCode] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const check = () =>
      presentationsApi
        .active()
        .then(({ presentation }) => !cancelled && setCode(presentation?.code ?? null))
        .catch(() => {});
    void check();
    const t = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!joinHost || code === undefined) return <Frame>{null}</Frame>;
  return (
    <Frame>
      {code ? (
        <JoinPanel code={code} joinHost={joinHost} />
      ) : (
        <Waiting text="Esperando a que empiece la presentación…" />
      )}
    </Frame>
  );
}
