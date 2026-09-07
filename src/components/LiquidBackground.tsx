"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-slate-950">
      {/* Deep mesh gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950" />

      {/* Primary Cyan/Blue Liquid Orb */}
      <motion.div
        animate={{
          x: [0, 80, -60, 40, 0],
          y: [0, -70, 50, -30, 0],
          scale: [1, 1.2, 0.9, 1.15, 1],
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "40% 60% 70% 30% / 50% 60% 30% 60%",
            "70% 30% 50% 50% / 30% 50% 60% 70%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
          ],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-indigo-600/15 rounded-full blur-3xl"
      />

      {/* Violet/Purple Liquid Orb */}
      <motion.div
        animate={{
          x: [0, -90, 70, -40, 0],
          y: [0, 80, -60, 50, 0],
          scale: [1, 1.15, 0.85, 1.2, 1],
          borderRadius: [
            "50% 50% 40% 60% / 40% 60% 50% 50%",
            "60% 40% 70% 30% / 70% 30% 60% 40%",
            "40% 60% 30% 70% / 40% 50% 70% 60%",
            "50% 50% 40% 60% / 40% 60% 50% 50%",
          ],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-fuchsia-500/20 via-purple-600/25 to-pink-600/15 rounded-full blur-3xl"
      />

      {/* Emerald/Teal Floating Liquid Drop */}
      <motion.div
        animate={{
          x: [0, 50, -80, 20, 0],
          y: [0, -60, 40, -50, 0],
          scale: [1, 0.9, 1.25, 0.95, 1],
          borderRadius: [
            "40% 60% 60% 40% / 60% 40% 50% 50%",
            "70% 30% 40% 60% / 50% 60% 40% 60%",
            "50% 50% 70% 30% / 40% 70% 50% 60%",
            "40% 60% 60% 40% / 60% 40% 50% 50%",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-600/15 to-cyan-600/20 rounded-full blur-3xl"
      />

      {/* Amber/Rose subtle accent blob */}
      <motion.div
        animate={{
          x: [0, -40, 60, -20, 0],
          y: [0, 50, -40, 30, 0],
          scale: [1, 1.1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-2/3 right-1/4 w-[350px] h-[350px] bg-gradient-to-r from-amber-500/10 via-rose-500/15 to-purple-500/15 rounded-full blur-2xl"
      />

      {/* Fine liquid noise & glass shimmer grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
    </div>
  );
}
