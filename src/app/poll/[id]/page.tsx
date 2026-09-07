"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  QrCode,
  Share2,
  CheckCircle2,
  AlertCircle,
  Pause,
  StopCircle,
  Loader2,
  ShieldCheck,
  Film,
  Image as ImageIcon,
  Flame,
  Award,
  Lock,
} from "lucide-react";
import ResultsChart from "@/components/ResultsChart";
import AnswerRevealModal from "@/components/AnswerRevealModal";
import QRCodeModal from "@/components/QRCodeModal";
import { sounds } from "@/lib/audio";
import { getRandomFunnyTitle } from "@/lib/utils";

export default function VoterPage() {
  const params = useParams();
  const pollId = params.id as string;

  const [poll, setPoll] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Voter inputs
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});

  // Voting state
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voterTitle, setVoterTitle] = useState("");

  // Modals
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [correctOption, setCorrectOption] = useState<any>(null);

  // Client Token for 1-vote verification
  const [clientToken, setClientToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("survey_client_token");
      if (!token) {
        token = `tok_${Math.random().toString(36).substring(2)}${Date.now()}`;
        localStorage.setItem("survey_client_token", token);
      }
      setClientToken(token);

      // Check if user already voted in this poll
      const prevVote = localStorage.getItem(`survey_voted_${pollId}`);
      if (prevVote) {
        setHasVoted(true);
        try {
          const parsed = JSON.parse(prevVote);
          setSelectedChoices(parsed.choices || {});
          if (parsed.voterName) setVoterName(parsed.voterName);
        } catch (e) {}
      }

      setVoterTitle(getRandomFunnyTitle());
    }
  }, [pollId]);

  // Fetch Poll Data
  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load poll");
      const data = await res.json();
      setPoll(data.poll);
      setQuestions(data.questions);
      setTotalParticipants(data.totalParticipants);
      setVoters(data.voters || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    if (pollId) {
      fetchPoll();
      // Fetch QR
      fetch(`/api/polls/${pollId}/qr`)
        .then((r) => r.json())
        .then((d) => {
          if (d.qrDataUrl) setQrDataUrl(d.qrDataUrl);
        })
        .catch(console.error);

      // Refresh poll every 5s for live status
      const interval = setInterval(fetchPoll, 5000);
      return () => clearInterval(interval);
    }
  }, [pollId, fetchPoll]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (hasVoted || poll?.status !== "active") return;
    sounds.playClick();
    setSelectedChoices((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setErrorMessage(null);
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!voterName.trim()) {
      setErrorMessage("Please enter your name to cast your vote!");
      sounds.playBuzzer();
      return;
    }

    if (poll.collectEmail && (!voterEmail || !voterEmail.includes("@"))) {
      setErrorMessage("A valid email address is required by the host.");
      sounds.playBuzzer();
      return;
    }

    // Ensure all questions are answered
    for (const q of questions) {
      if (!selectedChoices[q.id]) {
        setErrorMessage(`Please pick an answer for: "${q.questionText}"`);
        sounds.playBuzzer();
        return;
      }
    }

    const votePayload = Object.entries(selectedChoices).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterName,
          voterEmail,
          clientToken,
          votes: votePayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.alreadyVoted) {
          setHasVoted(true);
        }
        throw new Error(data.error || "Failed to submit vote");
      }

      // Mark as voted locally
      setHasVoted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `survey_voted_${pollId}`,
          JSON.stringify({ voterName, choices: selectedChoices })
        );
      }

      await fetchPoll();

      // Check if instant reveal is enabled!
      if (data.revealImmediately) {
        // Find correct option for question
        const q0 = questions[0];
        const correctOpt = q0?.options.find((o: any) => o.isCorrect);
        if (correctOpt) {
          setCorrectOption(correctOpt);
          setShowRevealModal(true);
        } else {
          sounds.playFanfare();
        }
      } else {
        sounds.playFanfare();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit vote");
      sounds.playBuzzer();
    } finally {
      setIsSubmitting(false);
    }
  };

  const votingUrl = typeof window !== "undefined" ? window.location.href : "";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-cyan-300">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <span className="text-sm font-semibold">Loading Poll Experience...</span>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-20 p-6 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl">
        <h2 className="text-2xl font-bold text-white">Poll Not Found</h2>
        <p className="text-sm text-white/50 mt-1">Check your link or contact the poll creator.</p>
      </div>
    );
  }

  const primaryQuestion = questions[0];
  const primaryChoiceId = selectedChoices[primaryQuestion?.id];

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Poll Header Glass Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.07] border border-white/20 backdrop-blur-2xl shadow-glass text-center space-y-4 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Status Pill & Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              poll.status === "active"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : poll.status === "paused"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40"
            }`}
          >
            {poll.status === "active"
              ? "● Voting Open"
              : poll.status === "paused"
              ? "⏸️ Paused"
              : "🏁 Concluded"}
          </span>

          <button
            onClick={() => {
              sounds.playClick();
              setShowQR(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-300" />
            <span>Scan / Share</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {poll.title}
        </h1>

        {poll.description && (
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto">
            {poll.description}
          </p>
        )}

        {/* Voter status alert */}
        {hasVoted && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Your ballot is recorded! Single-vote locked.</span>
          </div>
        )}
      </div>

      {/* PAUSED STATE ALERT */}
      {poll.status === "paused" && !hasVoted && (
        <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-2xl text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-2">
            <Pause className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-amber-200">
            Hold Your Horses! Poll is Paused
          </h3>
          <p className="text-sm text-amber-100/70 max-w-md mx-auto">
            The host temporarily paused voting (maybe refilling coffee or reviewing memes).
            Keep this tab open, voting will resume when the host restarts!
          </p>
        </div>
      )}

      {/* ENDED STATE ALERT */}
      {poll.status === "ended" && !hasVoted && (
        <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 backdrop-blur-2xl text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center mx-auto mb-2">
            <StopCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-rose-200">
            Voting Has Concluded
          </h3>
          <p className="text-sm text-rose-100/70 max-w-md mx-auto">
            This poll has officially wrapped up. Review the final results and scoreboard below!
          </p>
        </div>
      )}

      {/* VOTING FORM (When Active & User hasn't voted yet) */}
      {!hasVoted && poll.status === "active" && (
        <form onSubmit={handleVoteSubmit} className="space-y-6">
          {/* Questions & Options */}
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-6 sm:p-8 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-glass space-y-5"
            >
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Question #{qIdx + 1}</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-extrabold text-white">
                {q.questionText}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {q.options.map((opt: any, oIdx: number) => {
                  const isSelected = selectedChoices[q.id] === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`relative group rounded-2xl p-4 border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]"
                          : "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-white/25"
                      } backdrop-blur-xl flex flex-col justify-between`}
                    >
                      {/* Media container if image or video option */}
                      {opt.mediaUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden aspect-video bg-black/50 border border-white/15 relative">
                          {opt.mediaType === "video" ? (
                            <video
                              src={opt.mediaUrl}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={opt.mediaUrl}
                              alt="Option preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                      )}

                      {/* Option Text and Check Radio */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                              isSelected
                                ? "bg-cyan-400 text-slate-950 border-cyan-400"
                                : "border-white/30 text-white/70"
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span
                            className={`text-sm sm:text-base font-bold transition-colors ${
                              isSelected ? "text-cyan-200" : "text-white"
                            }`}
                          >
                            {opt.text}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Voter Identity Form (Strict 1 Vote Per Person) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-glass space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Voter Identification (1 Vote Per Person)</span>
              </div>
              <span className="text-[11px] text-white/50 italic">
                Title: &ldquo;{voterTitle}&rdquo;
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/80">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alex Carter"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-cyan-400 text-white placeholder-white/40 text-sm outline-none transition-all shadow-inner"
                />
              </div>

              {poll.collectEmail && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-white/80">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={voterEmail}
                    onChange={(e) => setVoterEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-cyan-400 text-white placeholder-white/40 text-sm outline-none transition-all shadow-inner"
                  />
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-cyan-500/30 border border-white/25 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Locking in Your Verdict...</span>
                </>
              ) : (
                <>
                  <span>Cast My Vote</span>
                  <Award className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* RESULTS DISPLAY (Visible if voted, or ended, or poll settings allow) */}
      {(hasVoted || poll.status === "ended") && (
        <div className="space-y-6">
          {/* Action to reveal answer manually if configured or already revealed */}
          {poll.isAnswerRevealed && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  sounds.playClick();
                  const q0 = questions[0];
                  const corr = q0?.options.find((o: any) => o.isCorrect);
                  setCorrectOption(corr);
                  setShowRevealModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>View Revealed Answer</span>
              </button>
            </div>
          )}

          {questions.map((q) => (
            <ResultsChart
              key={q.id}
              questionText={q.questionText}
              totalVotes={q.totalVotes}
              options={q.options}
              voters={voters.filter((v) => v.questionId === q.id)}
              showPublicResults={poll.showPublicResults}
              showVoterDetails={poll.showVoterDetails}
              isAnswerRevealed={poll.isAnswerRevealed}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        qrDataUrl={qrDataUrl}
        votingUrl={votingUrl}
        pollTitle={poll.title}
      />

      <AnswerRevealModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        questionText={primaryQuestion?.questionText || poll.title}
        correctOption={correctOption}
        userVotedOptionId={primaryChoiceId}
      />
    </div>
  );
}
