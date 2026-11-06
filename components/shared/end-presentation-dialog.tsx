"use client";

import { SquareIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useEndPresentation } from "@/hooks/api/use-presentations";

// Botón "Terminar" con confirmación. Al terminar se libera el cupo de activa.
export function EndPresentationDialog({
  code,
  size = "sm",
  onEnded,
}: {
  code: string;
  size?: "sm" | "default" | "lg";
  onEnded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const end = useEndPresentation();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" size={size} />}>
        <SquareIcon className="fill-current" />
        Terminar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Terminar la presentación {code}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se cierra la votación y el público verá la pantalla de agradecimiento.
            Después podrás crear otra presentación.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={end.isPending}
            onClick={() =>
              end.mutate(code, {
                onSuccess: () => {
                  setOpen(false);
                  toast.success(`Presentación ${code} terminada`);
                  onEnded?.();
                },
                onError: (e) => toast.error(e.message),
              })
            }
          >
            {end.isPending ? "Terminando…" : "Terminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
