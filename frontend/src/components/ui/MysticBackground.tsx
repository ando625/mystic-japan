"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function MysticBackground() {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 1200], [0, 90]);
  const starsY = useTransform(scrollY, [0, 1200], [0, -70]);
  const auroraY = useTransform(scrollY, [0, 1200], [0, 55]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
      <motion.div
        className="absolute -inset-x-8 -inset-y-10 bg-[url('/images/home/home.png')] bg-cover bg-center opacity-55"
        style={{ y: imageY }}
      />
      <motion.div
        animate={{
          backgroundPosition: ["18% 12%, 80% 10%, 0 0", "24% 15%, 74% 12%, 0 0", "18% 12%, 80% 10%, 0 0"],
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(168,85,247,0.34),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.24),transparent_28%),linear-gradient(180deg,rgba(5,8,22,0.22),rgba(5,8,22,0.88)_74%)]"
        style={{ y: auroraY }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={{ opacity: [0.5, 0.82, 0.58] }}
        className="stars-layer absolute inset-0"
        style={{ y: starsY }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.16, 0.28, 0.16] }}
        className="absolute left-[-20%] top-[18%] h-40 w-[140%] rotate-[-8deg] bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.24),rgba(168,85,247,0.22),transparent)] blur-3xl"
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(5,8,22,0.96),rgba(5,8,22,0))]" />
    </div>
  );
}
