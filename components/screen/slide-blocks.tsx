"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { LampContainer } from "@/components/ui/lamp";
import { Meteors } from "@/components/ui/meteors";
import { cn } from "@/lib/utils";
import type { SlideContext } from "./decks/types";
import { JoinBox } from "./vote-slide";

// Bloques de diapositiva que se repiten entre fases.

// Portada: líneas animadas (Aceternity), tema al centro y código abajo.
export function CoverSlide({ ctx, children }: { ctx: SlideContext; children: ReactNode }) {
  return (
    <BackgroundLines className="flex h-full w-full flex-col items-center justify-center px-4 md:h-full">
      <h2 className="relative z-20 bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text py-2 text-center font-sans text-2xl font-bold tracking-tight text-transparent md:py-10 md:text-4xl lg:text-7xl dark:from-neutral-600 dark:to-white">
        {children}
      </h2>
      <div className="absolute bottom-[5vh] left-1/2 z-20 -translate-x-1/2">
        <JoinBox code={ctx.code} joinHost={ctx.joinHost} compact />
      </div>
    </BackgroundLines>
  );
}

// Cierre con la lámpara (Aceternity).
export function ClosingSlide({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <LampContainer className="h-full min-h-0 rounded-none">
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-8xl"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="text-center text-[clamp(1.1rem,1.9vw,2rem)] text-slate-400"
        >
          {subtitle}
        </motion.p>
      )}
    </LampContainer>
  );
}

// Cifra grande con meteoros de fondo.
export function StatCard({ figure, children, highlight }: { figure: string; children: ReactNode; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-[0.8vh] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-[1.8vw]",
        highlight && "border-cyan-400/30",
      )}
    >
      <span className="relative z-10 text-[clamp(2.4rem,5vw,5.5rem)] leading-none font-bold text-gradient">{figure}</span>
      <span className="relative z-10 text-[clamp(1rem,1.5vw,1.6rem)] text-neutral-400">{children}</span>
      <Meteors number={12} />
    </div>
  );
}

// Fila horizontal: número/ícono · título · detalle (para tablas de 2–3 columnas).
export function ListRow({
  lead,
  title,
  detail,
  aside,
  index = 0,
}: {
  lead?: ReactNode;
  title: ReactNode;
  detail?: ReactNode;
  aside?: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.08 }}
      className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center gap-[1.4vw] rounded-2xl border border-white/10 bg-white/[0.04] px-[1.6vw] py-[1.3vh]"
    >
      <span className="font-mono text-[clamp(0.95rem,1.4vw,1.6rem)] font-bold text-cyan-400 [&_svg]:size-[1.3em]">{lead}</span>
      <span className="text-[clamp(1.05rem,1.6vw,1.8rem)] leading-tight font-semibold">{title}</span>
      <span className="text-[clamp(0.95rem,1.35vw,1.5rem)] leading-snug text-neutral-400">{detail}</span>
      <span className="text-right text-[clamp(0.85rem,1.2vw,1.3rem)] whitespace-nowrap text-neutral-500">{aside}</span>
    </motion.div>
  );
}
