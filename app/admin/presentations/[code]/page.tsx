import { Suspense } from "react";
import { PresentationControl } from "@/components/admin/presentation-control";

// Panel de control en vivo de una presentación.
export default function PresentationControlPage({
  params,
}: PageProps<"/admin/presentations/[code]">) {
  return (
    <Suspense fallback={<p className="p-6">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({
  params,
}: Pick<PageProps<"/admin/presentations/[code]">, "params">) {
  const { code } = await params;
  return <PresentationControl code={code.toUpperCase()} />;
}
