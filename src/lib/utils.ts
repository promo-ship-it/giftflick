import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateShareUrl(shareId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/video/${shareId}`;
}

export function formatOccasion(occasion: string): string {
  return occasion
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getOccasionEmoji(occasion: string): string {
  const emojiMap: Record<string, string> = {
    BIRTHDAY: "🎂",
    ANNIVERSARY: "💕",
    THANK_YOU: "🙏",
    CONGRATULATIONS: "🎉",
    HOLIDAY: "🎄",
    VALENTINES: "❤️",
    MOTHERS_DAY: "🌸",
    FATHERS_DAY: "👔",
    GRADUATION: "🎓",
    WEDDING: "💒",
    BABY_SHOWER: "👶",
    JUST_BECAUSE: "✨",
    GET_WELL: "💐",
    SYMPATHY: "🕊️",
  };
  return emojiMap[occasion] || "🎁";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
