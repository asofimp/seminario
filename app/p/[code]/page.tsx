import { Suspense } from "react";
import { AudienceView } from "@/components/audience/audience-view";

// Vista del participante (celular): sigue la pregunta activa y permite votar.
export default function AudiencePage({ params }: PageProps<"/p/[code]">) {
  return (
    <Suspense fallback={<p className="p-6">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/p/[code]">, "params">) {
  const { code } = await params;
  return <AudienceView code={code.toUpperCase()} />;
}
