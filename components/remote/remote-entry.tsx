"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { presentationsApi } from "@/lib/api/endpoints";
import { useRemoteStore } from "@/stores/remote-store";
import { RemoteLogin } from "./remote-login";

// /remote: pide la clave (si falta) y lleva al control de la presentación activa.
export function RemoteEntry() {
  const key = useRemoteStore((s) => s.key);
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    presentationsApi
      .active()
      .then(({ presentation }) => {
        if (cancelled) return;
        if (presentation) router.replace(`/remote/${presentation.code}`);
        else setMessage("No hay ninguna presentación activa. Créala desde /admin.");
      })
      .catch((e: Error) => !cancelled && setMessage(e.message));
    return () => {
      cancelled = true;
    };
  }, [key, router]);

  if (!key) return <RemoteLogin />;

  return (
    <main className="flex flex-1 items-center justify-center gap-3 p-6 text-center text-lg text-muted-foreground">
      {message ?? (
        <>
          <Loader2Icon className="animate-spin" /> Buscando la presentación activa…
        </>
      )}
    </main>
  );
}
