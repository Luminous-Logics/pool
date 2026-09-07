"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Check,
  Settings2,
  Sparkles,
  HelpCircle,
  Mail,
  Eye,
  Users,
  Film,
  Image as ImageIcon,
  Loader2,
  Flame,
  ArrowRight,
} from "lucide-react";
import MediaUploader from "@/components/MediaUploader";
import { sounds } from "@/lib/audio";

interface OptionItem {
  id: string;
  text: string;
  mediaType: "text" | "image" | "video";
  mediaUrl?: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  questionText: string;
  options: OptionItem[];
}

export default function CreatePollPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Poll metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Configurable settings
  const [collectEmail, setCollectEmail] = useState(false);
  const [revealImmediately, setRevealImmediately] = useState(true);
  const [showPublicResults, setShowPublicResults] = useState(true);
  const [showVoterDetails, setShowVoterDetails] = useState(true);

  // Question & options
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: "q1",
      questionText: "",
      options: [
        { id: "o1", text: "", mediaType: "text", isCorrect: false },
        { id: "o2", text: "", mediaType: "text", isCorrect: false },
      ],
    },
  ]);

  const addOption = (questionIndex: number) => {
    sounds.playClick();
    const updated = [...questions];
    updated[questionIndex].options.push({
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: "",
      mediaType: "text",
      isCorrect: false,
    });
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    sounds.playClick();
    const updated = [...questions];
    if (updated[questionIndex].options.length <= 2) {
      setErrorMessage("Every question must have at least 2 options!");
      sounds.playBuzzer();
      return;
    }
    updated[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    sounds.playClick();
    const updated = [...questions];
    const currentIsCorrect = updated[questionIndex].options[optionIndex].isCorrect;

    // Single correct answer toggle: turn off others in same question
    updated[questionIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optionIndex ? !currentIsCorrect : false;
    });

    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please give your poll an eye-catching title!");
      sounds.playBuzzer();
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setErrorMessage(`Question #${i + 1} is missing its question prompt!`);
        sounds.playBuzzer();
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        if (!o.text.trim() && !o.mediaUrl) {
          setErrorMessage(`Option #${j + 1} in question #${i + 1} needs text or media.`);
          sounds.playBuzzer();
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status: "active",
          collectEmail,
          revealImmediately,
          showPublicResults,
          showVoterDetails,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create poll");
      }

      sounds.playFanfare();
      // Store creator key in localStorage for convenience
      localStorage.setItem(`poll_creator_key_${data.pollId}`, data.creatorKey);

      router.push(`/manage/${data.pollId}?key=${data.creatorKey}&created=true`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Something went wrong creating the poll");
      sounds.playBuzzer();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-xl">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Design Your Liquid Poll
        </h1>
        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto">
          Craft your question, upload images or video choices up to 10MB, pick the correct answer, and customize who sees what!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Poll General Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-glass space-y-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>1. Poll Details</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white/90">
              Poll Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Which sci-fi spaceship design is unbeatable?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 focus:border-cyan-400 focus:bg-white/[0.08] text-white placeholder-white/40 text-base outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white/90">
              Description / Context <span className="text-white/40 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Give your voters a hilarious tip or helpful context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 focus:border-cyan-400 focus:bg-white/[0.08] text-white placeholder-white/40 text-sm outline-none transition-all shadow-inner resize-none"
            />
          </div>
        </div>

        {/* Step 2: Questions and Options */}
        {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="p-6 sm:p-8 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-glass space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Question #{qIndex + 1}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white/90">
                Question Text <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Type your question prompt here..."
                value={q.questionText}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].questionText = e.target.value;
                  setQuestions(updated);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 focus:border-cyan-400 text-white placeholder-white/40 text-base outline-none transition-all shadow-inner"
              />
            </div>

            {/* Options List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white/90">
                  Options & Media Choices <span className="text-white/40 font-normal">(Min 2)</span>
                </label>
                <span className="text-xs text-cyan-300/80">
                  💡 Click the star/badge to set the correct answer
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => (
                  <div
                    key={opt.id}
                    className={`relative p-4 rounded-2xl border transition-all ${
                      opt.isCorrect
                        ? "bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/40"
                        : "bg-white/[0.04] border-white/10 hover:border-white/20"
                    } backdrop-blur-xl space-y-3`}
                  >
                    {/* Option Top Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white/60 uppercase">
                        Option {String.fromCharCode(65 + oIndex)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Correct Answer Selector */}
                        <button
                          type="button"
                          onClick={() => toggleCorrectAnswer(qIndex, oIndex)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            opt.isCorrect
                              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                              : "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{opt.isCorrect ? "Correct Choice" : "Mark Correct"}</span>
                        </button>

                        {/* Remove Option */}
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/30 text-white/40 hover:text-rose-300 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Option Text Input */}
                    <input
                      type="text"
                      placeholder={`Choice ${String.fromCharCode(65 + oIndex)} text label`}
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].options[oIndex].text = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-cyan-400 text-white placeholder-white/40 text-sm outline-none transition-all"
                    />

                    {/* Media Uploader for this option (image/video up to 10MB) */}
                    <div>
                      <MediaUploader
                        value={opt.mediaUrl}
                        mediaType={opt.mediaType}
                        onChange={(url, type) => {
                          const updated = [...questions];
                          updated[qIndex].options[oIndex].mediaUrl = url;
                          updated[qIndex].options[oIndex].mediaType = type;
                          setQuestions(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Option Button */}
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-dashed border-white/20 hover:border-cyan-400 bg-white/[0.02] hover:bg-cyan-500/10 text-cyan-300 text-sm font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Option</span>
              </button>
            </div>
          </div>
        ))}

        {/* Step 3: Configurable Settings / Toggles */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-glass space-y-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Settings2 className="w-4 h-4" />
            <span>3. Configurable Settings & Privacy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Collect Email Toggle */}
            <div
              onClick={() => {
                sounds.playClick();
                setCollectEmail(!collectEmail);
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3 pr-2">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Collect Email</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    Require voters to enter a valid email address
                  </div>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  collectEmail ? "bg-cyan-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    collectEmail ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            {/* Reveal Answer Immediately Toggle */}
            <div
              onClick={() => {
                sounds.playClick();
                setRevealImmediately(!revealImmediately);
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3 pr-2">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Instant Reveal</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    Reveal correct answer with animation immediately after voting
                  </div>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  revealImmediately ? "bg-purple-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    revealImmediately ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            {/* Show Public Graph / Results Toggle */}
            <div
              onClick={() => {
                sounds.playClick();
                setShowPublicResults(!showPublicResults);
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3 pr-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 mt-0.5">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Public Graph & %</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    Show vote counts and percentage graphs to voters
                  </div>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  showPublicResults ? "bg-emerald-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    showPublicResults ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            {/* Show Public Voter Details Toggle */}
            <div
              onClick={() => {
                sounds.playClick();
                setShowVoterDetails(!showVoterDetails);
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3 pr-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Public Voter Ledger</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    Show attendee names and which option they selected
                  </div>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  showVoterDetails ? "bg-amber-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    showVoterDetails ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm font-semibold backdrop-blur-xl">
            {errorMessage}
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-lg shadow-xl shadow-cyan-500/30 border border-white/25 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span>Launching Poll...</span>
              </>
            ) : (
              <>
                <span>Publish Poll & Get QR Code</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
