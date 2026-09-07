"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Pause,
  StopCircle,
  Sparkles,
  QrCode,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Users,
  Mail,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import QRCodeModal from "@/components/QRCodeModal";
import AnswerRevealModal from "@/components/AnswerRevealModal";
import ResultsChart from "@/components/ResultsChart";
import { sounds } from "@/lib/audio";

export default function ManagePollPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pollId = params.id as string;

  const [creatorKey, setCreatorKey] = useState<string>("");
  const [poll, setPoll] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [voters, setVoters] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showRevealModal, setShowRevealModal] = useState(false);

  // Resolve Creator Key from URL or localStorage
  useEffect(() => {
    const urlKey = searchParams.get("key");
    const storedKey = typeof window !== "undefined" ? localStorage.getItem(`poll_creator_key_${pollId}`) : null;
    const key = urlKey || storedKey || "";
    setCreatorKey(key);
  }, [pollId, searchParams]);

  // Fetch Poll Data
  const fetchPollData = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (creatorKey) {
        headers["x-creator-key"] = creatorKey;
      }

      const res = await fetch(`/api/polls/${pollId}`, {
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load poll");
      }

      const data = await res.json();
      setPoll(data.poll);
      setQuestions(data.questions);
      setTotalParticipants(data.totalParticipants);
      setVoters(data.voters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pollId, creatorKey]);

  useEffect(() => {
    if (pollId) {
      fetchPollData();
      // Fetch QR code
      fetch(`/api/polls/${pollId}/qr`)
        .then((r) => r.json())
        .then((d) => {
          if (d.qrDataUrl) setQrDataUrl(d.qrDataUrl);
        })
        .catch(console.error);

      // Auto poll every 4 seconds for live updates
      const interval = setInterval(fetchPollData, 4000);
      return () => clearInterval(interval);
    }
  }, [pollId, fetchPollData]);

  const updateSetting = async (fields: Record<string, any>) => {
    try {
      setUpdatingStatus(true);
      sounds.playClick();
      const res = await fetch(`/api/polls/${pollId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-creator-key": creatorKey,
        },
        body: JSON.stringify(fields),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Update failed");
      }

      await fetchPollData();
    } catch (e: any) {
      alert(e.message || "Failed to update setting");
      sounds.playBuzzer();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRevealAnswer = async () => {
    sounds.playClick();
    await updateSetting({ isAnswerRevealed: true });
    setShowRevealModal(true);
  };

  const votingUrl = typeof window !== "undefined" ? `${window.location.origin}/poll/${pollId}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(votingUrl);
    setCopiedLink(true);
    sounds.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-cyan-300">
        <RefreshCw className="w-8 h-8 animate-spin mb-3" />
        <span className="text-sm font-semibold">Loading Creator Suite...</span>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-20 p-6 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Poll Not Found</h2>
        <p className="text-sm text-white/50 mt-1">This poll may have been deleted or the link is invalid.</p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  // Find correct option for reveal modal
  const primaryQuestion = questions[0];
  const correctOption = primaryQuestion?.options.find((o: any) => o.isCorrect);

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner with Poll Status and Live Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.07] border border-white/15 backdrop-blur-2xl shadow-glass space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Host Control Room
              </span>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  poll.status === "active"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : poll.status === "paused"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}
              >
                ● Status: {poll.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-sm text-white/60 mt-1">{poll.description}</p>
            )}
          </div>

          {/* Share Links & QR Triggers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all active:scale-95 shadow-glass"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-300" />
                  <span>Copy Voting Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setShowQR(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all active:scale-95 shadow-glass"
            >
              <QrCode className="w-4 h-4 text-purple-300" />
              <span>Show QR Code</span>
            </button>

            <Link
              href={`/poll/${pollId}`}
              target="_blank"
              onClick={() => sounds.playClick()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Voter View</span>
            </Link>
          </div>
        </div>

        {/* State Machine Controls: Start, Pause, End, Reveal Answer */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white/50 mr-2">
            Host Controls:
          </span>

          {poll.status !== "active" && (
            <button
              onClick={() => updateSetting({ status: "active" })}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{poll.status === "paused" ? "Resume Poll" : "Start Poll"}</span>
            </button>
          )}

          {poll.status === "active" && (
            <button
              onClick={() => updateSetting({ status: "paused" })}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all active:scale-95"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Voting</span>
            </button>
          )}

          {poll.status !== "ended" && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to end this poll? No more votes can be cast.")) {
                  updateSetting({ status: "ended" });
                }
              }}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all active:scale-95"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>End Poll Permanently</span>
            </button>
          )}

          {/* Dramatic Reveal Answer Button */}
          <button
            onClick={handleRevealAnswer}
            disabled={updatingStatus}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>
              {poll.isAnswerRevealed ? "Re-play Answer Reveal" : "Reveal Correct Answer!"}
            </span>
          </button>
        </div>
      </div>

      {/* Real-time Config Toggles */}
      <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Toggle Public Results */}
        <button
          onClick={() => updateSetting({ showPublicResults: !poll.showPublicResults })}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            poll.showPublicResults
              ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
              : "bg-white/[0.02] border-white/10 text-white/50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">{poll.showPublicResults ? "ON" : "OFF"}</span>
          </div>
          <div className="text-xs font-bold text-white">Public Graph & %</div>
        </button>

        {/* Toggle Public Voter Details */}
        <button
          onClick={() => updateSetting({ showVoterDetails: !poll.showVoterDetails })}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            poll.showVoterDetails
              ? "bg-purple-500/15 border-purple-500/40 text-purple-200"
              : "bg-white/[0.02] border-white/10 text-white/50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">{poll.showVoterDetails ? "ON" : "OFF"}</span>
          </div>
          <div className="text-xs font-bold text-white">Public Voter Ledger</div>
        </button>

        {/* Toggle Email Collection */}
        <button
          onClick={() => updateSetting({ collectEmail: !poll.collectEmail })}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            poll.collectEmail
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
              : "bg-white/[0.02] border-white/10 text-white/50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Mail className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">{poll.collectEmail ? "ON" : "OFF"}</span>
          </div>
          <div className="text-xs font-bold text-white">Collect Email</div>
        </button>

        {/* Toggle Instant Reveal */}
        <button
          onClick={() => updateSetting({ revealImmediately: !poll.revealImmediately })}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            poll.revealImmediately
              ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
              : "bg-white/[0.02] border-white/10 text-white/50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">{poll.revealImmediately ? "ON" : "OFF"}</span>
          </div>
          <div className="text-xs font-bold text-white">Instant Reveal</div>
        </button>
      </div>

      {/* Results and Voter Ledger */}
      {questions.map((q) => (
        <ResultsChart
          key={q.id}
          questionText={q.questionText}
          totalVotes={q.totalVotes}
          options={q.options}
          voters={voters.filter((v) => v.questionId === q.id)}
          showPublicResults={true} // Creator always sees results
          showVoterDetails={true}  // Creator always sees voter ledger
          isAnswerRevealed={poll.isAnswerRevealed}
          isCreator={true}
        />
      ))}

      {/* Modals */}
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
      />
    </div>
  );
}
