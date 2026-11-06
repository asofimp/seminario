// Solo variables NEXT_PUBLIC_*: se inlinean en el bundle durante `next build`.

// REST: por defecto pasa por el rewrite de next.config.ts (/api -> backend),
// así el navegador no necesita CORS.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// Socket.io: conexión directa al backend (namespace /live). Sin variable, usa
// el mismo host desde el que se abrió la página (así funciona desde el celular
// en la misma red: http://<ip>:3001 -> socket a http://<ip>:3000).
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000");

// Dirección que se muestra al público para unirse (ej. "192.168.1.20:3001" o un
// dominio). Sin variable, usa el host desde el que se abrió la pantalla.
export const JOIN_HOST = process.env.NEXT_PUBLIC_JOIN_HOST;
