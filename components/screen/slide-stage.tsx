"use client";

import { MaximizeIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight-new";
import { cn } from "@/lib/utils";
import type { Deck, SlideContext } from "./decks";

// Dibuja una diapositiva a pantalla completa con el fondo, la barra inferior
// (dirección + código + número) y la barra de progreso.
export function SlideStage({
  deck,
  slideIndex,
  ctx,
  showFullscreenHint,
}: {
  deck: Deck;
  slideIndex: number;
  ctx: SlideContext;
  showFullscreenHint?: boolean;
}) {
  const slide = deck.slides[slideIndex];
  const progress = ((slideIndex + 1) / deck.slides.length) * 100;

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-neutral-950 antialiased">
      {/* Fondo Aceternity común a las diapositivas (las de pantalla completa traen el suyo). */}
      {!slide.fullBleed && (
        <div className="pointer-events-none absolute inset-0 isolate z-0">
          <Spotlight />
          <BackgroundBeams />
        </div>
      )}
      <div className={cn("relative z-10 flex-1 overflow-hidden", !slide.fullBleed && "px-[5vw] pt-[4vh] pb-[2vh]")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            className="h-full"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {slide.render(ctx)}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="relative z-10 flex items-center justify-between gap-4 px-[5vw] py-[1.6vh] text-[clamp(0.8rem,1.1vw,1.2rem)] text-neutral-500">
        <span>
          {ctx.joinHost} · código <span className="font-mono font-bold tracking-widest text-neutral-200">{ctx.code}</span>
        </span>
        <span className="flex items-center gap-3 tabular-nums">
          {slideIndex + 1} / {deck.slides.length}
          {showFullscreenHint && <MaximizeIcon className="size-4 opacity-50" aria-label="F: pantalla completa" />}
        </span>
      </footer>
      <div className="relative z-10 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>
    </main>
  );
}
