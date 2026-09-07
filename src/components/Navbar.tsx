"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, BarChart3, Sparkles } from "lucide-react";
import SoundToggle from "./SoundToggle";
import { sounds } from "@/lib/audio";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 py-3 sm:px-8">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-glass">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/30 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
              LiquidPoll
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live LibSQL
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <SoundToggle />

          <Link
            href="/create"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 border border-white/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Poll</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
