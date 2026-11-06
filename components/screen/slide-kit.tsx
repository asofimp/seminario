"use client";

import type { ReactNode } from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { cn } from "@/lib/utils";

// Piezas de diseño para diapositivas proyectadas (tipografía grande y fluida,
// efectos de Aceternity UI).

export function SlideFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-center gap-[3vh]", className)}>
      {children}
    </div>
  );
}

// Etiqueta de sección con efecto de texto "descifrándose".
export function Kicker({ children }: { children: string }) {
  return (
    <p className="font-mono text-[clamp(0.9rem,1.3vw,1.35rem)] font-medium tracking-[0.25em] uppercase">
      <EncryptedText
        text={children}
        revealDelayMs={35}
        flipDelayMs={40}
        encryptedClassName="text-neutral-600"
        revealedClassName="text-cyan-400"
      />
    </p>
  );
}

// Título que aparece palabra por palabra (TextGenerateEffect).
export function Title({ children, className }: { children: string; className?: string }) {
  return (
    <TextGenerateEffect
      words={children}
      duration={0.6}
      className={cn(
        "[&>div]:mt-0 [&>div>div]:text-[clamp(2rem,4.2vw,4.5rem)] [&>div>div]:leading-[1.08] [&>div>div]:font-bold [&>div>div]:tracking-tight",
        className,
      )}
    />
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[clamp(1.1rem,1.9vw,2rem)] text-neutral-400", className)}>{children}</p>;
}

// "Idea clave" con el borde de degradado animado de Aceternity.
export function Callout({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BackgroundGradient containerClassName="rounded-3xl p-[2px]" className={cn("rounded-[22px] bg-neutral-950 px-[2.2vw] py-[2vh]", className)}>
      <div className="text-[clamp(1.1rem,1.8vw,1.9rem)] leading-snug text-neutral-100">
        {label && (
          <span className="mb-1 block text-[0.6em] font-semibold tracking-[0.2em] text-cyan-400 uppercase">{label}</span>
        )}
        {children}
      </div>
    </BackgroundGradient>
  );
}

// Tarjeta de contenido. `highlight` la rodea con el degradado animado.
export function Tile({
  icon,
  title,
  children,
  highlight,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col gap-[1vh] rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-[1.6vw] backdrop-blur",
        highlight && "rounded-[14px] border-transparent bg-neutral-950",
        className,
      )}
    >
      {icon && (
        <span className="flex size-[clamp(2.2rem,3.4vw,3.8rem)] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300 [&_svg]:size-[55%]">
          {icon}
        </span>
      )}
      <p className="text-[clamp(1.1rem,1.8vw,2rem)] leading-tight font-semibold text-neutral-100">{title}</p>
      {children && <div className="text-[clamp(0.95rem,1.35vw,1.5rem)] text-neutral-400">{children}</div>}
    </div>
  );
  return highlight ? (
    <BackgroundGradient containerClassName="h-full rounded-2xl p-[2px]" className="h-full">
      {body}
    </BackgroundGradient>
  ) : (
    body
  );
}

export function Footnote({ children }: { children: ReactNode }) {
  return <p className="text-[clamp(0.8rem,1.1vw,1.2rem)] text-neutral-500 italic">{children}</p>;
}
