import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function generateVoterHash(name: string, email?: string, clientToken?: string): string {
  const raw = `${(name || "").trim().toLowerCase()}::${(email || "").trim().toLowerCase()}::${(clientToken || "").trim()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `voter_${Math.abs(hash).toString(36)}`;
}

export const FUNNY_TITLES = [
  "Chief Meme Officer",
  "The Unwavering Rebel",
  "Calculated Risk Taker",
  "First Blood Voter",
  "The Mystic Oracle",
  "Captain Hindsight",
  "Decision Maestro",
  "Chaos Coordinator",
  "Pixel Philosopher",
  "The Strategic Thinker"
];

export function getRandomFunnyTitle(): string {
  return FUNNY_TITLES[Math.floor(Math.random() * FUNNY_TITLES.length)];
}
