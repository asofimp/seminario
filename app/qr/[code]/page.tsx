import { Suspense } from "react";
import { QrScreen } from "@/components/qr/qr-screen";

// Pantalla aparte con el QR y el código de una presentación.
export default function QrCodePage({ params }: PageProps<"/qr/[code]">) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/qr/[code]">, "params">) {
  const { code } = await params;
  return <QrScreen code={code.toUpperCase()} />;
}
