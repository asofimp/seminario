"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import type { SlideContext } from "./decks/types";
import { Kicker, SlideFrame } from "./slide-kit";

// Diapositiva para unirse: QR que abre la presentación directo en el celular,
// más la dirección y el código para entrar a mano.
export function JoinSlide({ ctx }: { ctx: SlideContext }) {
  const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
  const url = `${protocol}//${ctx.joinHost}/p/${ctx.code}`;

  return (
    <SlideFrame>
      <div className="grid items-center gap-[4vw] sm:grid-cols-[auto_1fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="rounded-[2rem] bg-white p-[1.6vw] shadow-2xl shadow-cyan-500/20"
        >
          <QRCodeSVG
            value={url}
            level="M"
            marginSize={0}
            bgColor="#ffffff"
            fgColor="#0a0a0a"
            className="block size-[clamp(14rem,30vw,34rem)]"
          />
        </motion.div>

        <div className="flex flex-col gap-[3vh]">
          <Kicker>Únete desde tu celular</Kicker>
          <h1 className="text-[clamp(2rem,4.2vw,4.5rem)] leading-[1.08] font-bold tracking-tight">
            Escanea el código QR
          </h1>
          <div className="flex flex-col gap-[1.2vh] text-[clamp(1.1rem,1.8vw,2rem)] text-neutral-400">
            <p>o entra a</p>
            <p className="font-semibold break-all text-neutral-100">{ctx.joinHost}</p>
            <p>y escribe el código</p>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-fit rounded-3xl border border-white/15 bg-neutral-950/80 px-[2vw] py-[1.2vh] font-mono text-[clamp(3rem,7vw,8rem)] leading-none font-bold tracking-[0.2em] text-gradient"
          >
            {ctx.code}
          </motion.p>
        </div>
      </div>
    </SlideFrame>
  );
}
