"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, Sparkles, X, Laugh, Zap } from "lucide-react";
import { sounds } from "@/lib/audio";

interface AnswerRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  correctOption?: {
    id: string;
    text: string;
    mediaType?: string;
    mediaUrl?: string | null;
  };
  userVotedOptionId?: string;
}

const FUNNY_REVEAL_QUOTES = [
  "Behold the sacred truth! No more arguing in the group chat.",
  "Whether you guessed right or completely bombed, at least you participated!",
  "History was written today. Well, poll history anyway.",
  "Drop the mic! The verdict has officially landed.",
  "Einstein is nodding from above... or facepalming.",
];

export default function AnswerRevealModal({
  isOpen,
  onClose,
  questionText,
  correctOption,
  userVotedOptionId,
}: AnswerRevealModalProps) {
  const [phase, setPhase] = useState<"suspense" | "revealed">("suspense");
  const [funnyQuote, setFunnyQuote] = useState("");

  const isUserCorrect = userVotedOptionId && correctOption && userVotedOptionId === correctOption.id;

  useEffect(() => {
    if (!isOpen) {
      setPhase("suspense");
      return;
    }

    setFunnyQuote(
      FUNNY_REVEAL_QUOTES[Math.floor(Math.random() * FUNNY_REVEAL_QUOTES.length)]
    );

    // Play suspense drumroll
    sounds.playDrumroll(2.2);

    const timer = setTimeout(() => {
      setPhase("revealed");
      sounds.playFanfare();

      // Fire confetti burst!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#a855f7", "#ec4899", "#eab308", "#10b981"],
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/90 border border-white/20 p-6 sm:p-8 shadow-2xl shadow-purple-950/60 backdrop-blur-2xl text-white overflow-hidden">
        {/* Ambient liquid glow background */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-amber-500/25 to-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {phase === "suspense" ? (
            <motion.div
              key="suspense"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="py-10 text-center flex flex-col items-center justify-center"
            >
              {/* Pulsating liquid energy ring */}
              <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["40%", "50%", "40%"],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 opacity-60 blur-xl"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/50 z-10"
                >
                  <Zap className="w-10 h-10 text-cyan-300 animate-bounce" />
                </motion.div>
              </div>

              <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent">
                Cracking the Vault...
              </h3>
              <p className="text-sm text-white/60 mt-2 max-w-xs animate-pulse">
                Hold your breath! The host is unsealing the correct answer right now...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center pt-2"
            >
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-glass">
                <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>The Revealed Answer</span>
              </div>

              <h4 className="text-sm text-white/60 font-medium mb-1 line-clamp-1">
                {questionText}
              </h4>

              {/* Reveal Card */}
              <div className="my-5 p-5 rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] border border-emerald-500/50 backdrop-blur-2xl shadow-xl shadow-emerald-950/40 text-left">
                {correctOption?.mediaUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden max-h-48 bg-black/50 border border-white/20">
                    {correctOption.mediaType === "video" ? (
                      <video
                        src={correctOption.mediaUrl}
                        controls
                        autoPlay
                        muted
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={correctOption.mediaUrl}
                        alt="Correct answer media"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Correct Choice
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
                      {correctOption?.text || "Option"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Voter match feedback */}
              {userVotedOptionId && (
                <div
                  className={`p-3 rounded-xl border backdrop-blur-md mb-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 ${
                    isUserCorrect
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                      : "bg-amber-500/15 border-amber-500/40 text-amber-200"
                  }`}
                >
                  {isUserCorrect ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>🎯 Bullseye! You chose the exact right answer! Genius mode activated!</span>
                    </>
                  ) : (
                    <>
                      <Laugh className="w-4 h-4 text-rose-300" />
                      <span>Oof! Not quite this time, but points for courage! 🦄</span>
                    </>
                  )}
                </div>
              )}

              {/* Funny Quote */}
              <p className="text-xs text-white/50 italic mb-6">
                &ldquo;{funnyQuote}&rdquo;
              </p>

              {/* Action */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                Back to Results
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
