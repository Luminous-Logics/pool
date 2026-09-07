"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, CheckCircle2, UserCheck, ShieldCheck, EyeOff } from "lucide-react";
import { getRandomFunnyTitle } from "@/lib/utils";

interface OptionStats {
  id: string;
  text: string;
  mediaType?: string;
  mediaUrl?: string | null;
  isCorrect?: boolean;
  voteCount?: number;
  percentage?: number;
}

interface VoterRecord {
  id: string;
  voterName: string;
  voterEmail?: string | null;
  optionId: string;
  questionId: string;
  createdAt: string | Date;
}

interface ResultsChartProps {
  questionText: string;
  totalVotes: number;
  options: OptionStats[];
  voters?: VoterRecord[];
  showPublicResults: boolean;
  showVoterDetails: boolean;
  isAnswerRevealed?: boolean;
  isCreator?: boolean;
}

export default function ResultsChart({
  questionText,
  totalVotes,
  options,
  voters = [],
  showPublicResults,
  showVoterDetails,
  isAnswerRevealed = false,
  isCreator = false,
}: ResultsChartProps) {
  const [activeTab, setActiveTab] = useState<"graph" | "voters">("graph");

  // If host has disabled public results and current user isn't creator
  if (!showPublicResults && !isCreator) {
    return (
      <div className="p-8 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 text-white/50">
          <EyeOff className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-white/80">Results are Private</h4>
        <p className="text-sm text-white/50 mt-1 max-w-sm mx-auto">
          The host of this poll chose to keep the live tally confidential. Thanks for casting your vote!
        </p>
      </div>
    );
  }

  // Find max votes to highlight leading option
  const maxVotes = Math.max(...options.map((o) => o.voteCount || 0), 0);

  // Map option ID to text for voter list
  const optionMap: Record<string, string> = {};
  options.forEach((o) => {
    optionMap[o.id] = o.text || "Option";
  });

  return (
    <div className="w-full rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl p-5 sm:p-7 shadow-glass text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
            Live Results Tally
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold mt-0.5 text-white line-clamp-1">
            {questionText}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector if voter details available */}
          {(showVoterDetails || isCreator) && (
            <div className="flex p-1 rounded-xl bg-black/30 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("graph")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "graph"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Graph</span>
              </button>
              <button
                onClick={() => setActiveTab("voters")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "voters"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Voters ({voters.length})</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-white/90">
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</span>
          </div>
        </div>
      </div>

      {activeTab === "graph" ? (
        /* Options Progress Graph */
        <div className="space-y-4 pt-5">
          {options.map((opt, idx) => {
            const count = opt.voteCount || 0;
            const percentage = opt.percentage || 0;
            const isLeading = count > 0 && count === maxVotes;
            const isCorrect = isAnswerRevealed && opt.isCorrect;

            return (
              <div
                key={opt.id}
                className="group relative rounded-2xl p-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Liquid Progress Fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 -z-10 transition-colors ${
                    isCorrect
                      ? "bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-teal-500/30"
                      : isLeading
                      ? "bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-indigo-500/25"
                      : "bg-gradient-to-r from-white/10 to-white/5"
                  }`}
                />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {opt.mediaUrl && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/15 flex-shrink-0">
                        {opt.mediaType === "video" ? (
                          <video
                            src={opt.mediaUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={opt.mediaUrl}
                            alt="Option thumb"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-200 transition-colors truncate">
                          {opt.text}
                        </span>
                        {isCorrect && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Correct
                          </span>
                        )}
                        {isLeading && !isCorrect && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-semibold">
                            Leading
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Percentage and Counts */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-base sm:text-lg text-white">
                      {percentage}%
                    </div>
                    <div className="text-xs text-white/50">
                      {count} {count === 1 ? "person" : "people"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Voter Ledger List */
        <div className="pt-5 space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {voters.length === 0 ? (
            <div className="text-center py-8 text-white/50 text-sm">
              No votes cast yet. Be the first to grace this ledger!
            </div>
          ) : (
            voters.map((voter, index) => (
              <div
                key={voter.id || index}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-md">
                    {voter.voterName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">
                        {voter.voterName}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    {voter.voterEmail && (
                      <span className="text-[11px] text-white/40 block">
                        {voter.voterEmail}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 inline-block max-w-[140px] truncate">
                    {optionMap[voter.optionId] || "Selected Choice"}
                  </span>
                  <span className="text-[10px] text-white/40 block mt-0.5">
                    {new Date(voter.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
