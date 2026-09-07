"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sounds } from "@/lib/audio";

export default function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(sounds.isMuted());
  }, []);

  const handleToggle = () => {
    const newMuted = sounds.toggleMute();
    setMuted(newMuted);
    if (!newMuted) {
      sounds.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white backdrop-blur-xl transition-all shadow-glass text-xs font-medium active:scale-95"
      title={muted ? "Sound Effects Muted (Click to enable)" : "Sound Effects Enabled (Click to mute)"}
    >
      {muted ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Sound Off</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">Sound FX</span>
        </>
      )}
    </button>
  );
}
