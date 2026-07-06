"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { defaultImage } from "@/data/fallback-spots";
import { cn } from "@/lib/utils";

export function AnimatedSpotImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [currentSrc, setCurrentSrc] = useState(src || defaultImage);

  useEffect(() => {
    setCurrentSrc(src || defaultImage);
  }, [src]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-slate-950", className)}>
      <motion.div
        animate={
          reduceMotion
            ? {}
            : {
                scale: [1.02, 1.1, 1.04],
                x: ["0%", "-1.8%", "1.4%", "0%"],
                y: ["0%", "-1.2%", "1%", "0%"],
              }
        }
        className="absolute inset-0"
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
      >
        <Image
          alt={alt}
          className="object-cover"
          fill
          onError={() => setCurrentSrc(defaultImage)}
          priority={priority}
          sizes="(min-width: 1024px) 58vw, 100vw"
          src={currentSrc}
          unoptimized
        />
      </motion.div>
      <motion.div
        animate={reduceMotion ? {} : { opacity: [0.18, 0.38, 0.2], x: ["-9%", "8%", "-9%"] }}
        className="pointer-events-none absolute left-[-25%] top-[28%] h-32 w-[150%] rotate-[-10deg] bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.26),rgba(168,85,247,0.28),transparent)] blur-3xl"
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="spot-drift-layer pointer-events-none absolute inset-0" />
      <div className="spot-rain-layer pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(5,8,22,0.22)_72%),linear-gradient(180deg,rgba(5,8,22,0.04),rgba(5,8,22,0.62))]" />
    </div>
  );
}
