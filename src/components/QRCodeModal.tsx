"use client";

import React, { useState } from "react";
import { X, Copy, Check, Download, QrCode, Smartphone } from "lucide-react";
import { sounds } from "@/lib/audio";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrDataUrl: string;
  votingUrl: string;
  pollTitle: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  qrDataUrl,
  votingUrl,
  pollTitle,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(votingUrl);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    sounds.playClick();
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `poll-qr-${pollTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/90 border border-white/20 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Scan to Vote</h3>
          <p className="text-sm text-white/60 mt-1 line-clamp-1">
            {pollTitle}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-inner mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="Poll QR Code"
            className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
          />
          <div className="flex items-center gap-1.5 mt-3 text-slate-800 text-xs font-semibold">
            <Smartphone className="w-4 h-4 text-cyan-600" />
            <span>Point mobile camera to join immediately</span>
          </div>
        </div>

        {/* Voting URL */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md mb-5">
          <input
            type="text"
            readOnly
            value={votingUrl}
            className="bg-transparent text-xs text-cyan-200 flex-1 outline-none font-mono truncate px-1"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all active:scale-95 flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
