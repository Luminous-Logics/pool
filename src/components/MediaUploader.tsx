"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Film, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { sounds } from "@/lib/audio";

interface MediaUploaderProps {
  value?: string;
  mediaType?: "text" | "image" | "video";
  onChange: (url: string | undefined, type: "text" | "image" | "video") => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function MediaUploader({
  value,
  mediaType = "text",
  onChange,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);

    // Validate size (strictly 10MB)
    if (file.size > MAX_SIZE) {
      setErrorMessage(
        `File is too large! Maximum allowed size is 10 MB (Your file: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`
      );
      sounds.playBuzzer();
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setErrorMessage("Only image (PNG, JPG, GIF, WebP) or video (MP4, WebM) files are allowed.");
      sounds.playBuzzer();
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url, data.mediaType);
      sounds.playClick();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Failed to upload media");
      sounds.playBuzzer();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined, "text");
    setErrorMessage(null);
    sounds.playClick();
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/25 bg-black/40 backdrop-blur-md">
          {mediaType === "video" ? (
            <div className="relative aspect-video max-h-48 w-full bg-slate-950 flex items-center justify-center">
              <video
                src={value}
                controls
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-500/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                <Film className="w-3 h-3" />
                Video (Max 10MB)
              </div>
            </div>
          ) : (
            <div className="relative aspect-video max-h-48 w-full bg-slate-950/60 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Option media"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-cyan-500/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Image
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/90 text-white hover:bg-rose-600 shadow-md transition-all hover:scale-110 active:scale-95"
            title="Remove media"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-cyan-400 bg-cyan-500/15"
              : "border-white/20 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.06]"
          } backdrop-blur-md`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <div className="flex flex-col items-center py-2">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-xs text-cyan-200 mt-2 font-medium">
                  Uploading media...
                </span>
              </div>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-cyan-300">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs text-white/80">
                  <span className="font-semibold text-cyan-300 underline underline-offset-2">
                    Upload image or video
                  </span>{" "}
                  or drag & drop
                </div>
                <p className="text-[11px] text-white/50">
                  PNG, JPG, GIF, MP4, WebM (up to 10 MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
