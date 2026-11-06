"use client";

import { animate } from "motion/react";
import { useEffect, useState } from "react";

// Número que cuenta desde 0 hasta `value` (o desde el valor anterior).
export function AnimatedNumber({ value, duration = 1.2, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [value, duration, delay]);
  return <>{Math.round(shown)}</>;
}
