import { Suspense } from "react";
import { PresenterRemote } from "@/components/remote/presenter-remote";

// Control remoto del presentador: solo botones grandes para manejar la presentación.
export default function RemoteCodePage({ params }: PageProps<"/remote/[code]">) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/remote/[code]">, "params">) {
  const { code } = await params;
  return <PresenterRemote code={code.toUpperCase()} />;
}
