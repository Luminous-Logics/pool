import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import LiquidBackground from "@/components/LiquidBackground";

export const metadata: Metadata = {
  title: "LiquidPoll - Fluid Glassmorphism Polling Platform",
  description: "Create interactive, media-rich polls with real-time liquid glass aesthetics, single-vote verification, and dramatic animated reveals.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen relative selection:bg-cyan-500/30 selection:text-cyan-200">
        <LiquidBackground />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
