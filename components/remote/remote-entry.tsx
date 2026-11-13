"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/admin-dashboard";
import { presentationsApi } from "@/lib/api/endpoints";
import { useAdminStore } from "@/stores/admin-store";

// /remote: pide la clave (si falta) y lleva al control de la presentación activa.
export function RemoteEntry() {
  const { adminKey, setAdminKey } = useAdminStore();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!adminKey) return;
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
  }, [adminKey, router]);

  if (!adminKey) return <AdminLogin onLogin={setAdminKey} />;

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
