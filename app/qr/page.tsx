import { Suspense } from "react";
import { ActiveQrScreen } from "@/components/qr/qr-screen";

// Pantalla aparte con el QR de la presentación activa.
export default function QrPage() {
  return (
    <Suspense fallback={null}>
      <ActiveQrScreen />
    </Suspense>
  );
}
