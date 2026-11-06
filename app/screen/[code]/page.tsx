import { Suspense } from "react";
import { ScreenView } from "@/components/screen/screen-view";

// Pantalla proyectada que ve todo el mundo: diapositivas + votaciones en vivo.
export default function ScreenPage({ params }: PageProps<"/screen/[code]">) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/screen/[code]">, "params">) {
  const { code } = await params;
  return <ScreenView code={code.toUpperCase()} />;
}
