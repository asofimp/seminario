import { Suspense } from "react";
import { SlidePreview } from "@/components/screen/slide-preview";

// Vista previa de las diapositivas con datos de ejemplo (sin sesión en vivo).
// /screen/preview?slide=3&state=open|chart|closed
export default function PreviewPage({ searchParams }: PageProps<"/screen/preview">) {
  return (
    <Suspense fallback={null}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: Pick<PageProps<"/screen/preview">, "searchParams">) {
  const sp = await searchParams;
  const slide = Number(sp.slide ?? 1) - 1;
  const state = sp.state === "chart" || sp.state === "closed" ? sp.state : "open";
  return <SlidePreview slideIndex={Number.isFinite(slide) ? slide : 0} voteState={state} />;
}
