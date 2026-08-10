export const OCCASIONS = [
  { value: "BIRTHDAY", label: "Birthday", emoji: "🎂", color: "from-pink-500 to-purple-500" },
  { value: "ANNIVERSARY", label: "Anniversary", emoji: "💕", color: "from-red-500 to-pink-500" },
  { value: "THANK_YOU", label: "Thank You", emoji: "🙏", color: "from-yellow-500 to-orange-500" },
  { value: "CONGRATULATIONS", label: "Congratulations", emoji: "🎉", color: "from-green-500 to-teal-500" },
  { value: "HOLIDAY", label: "Holiday", emoji: "🎄", color: "from-red-500 to-green-500" },
  { value: "VALENTINES", label: "Valentine's Day", emoji: "❤️", color: "from-red-500 to-rose-500" },
  { value: "MOTHERS_DAY", label: "Mother's Day", emoji: "🌸", color: "from-pink-400 to-rose-400" },
  { value: "FATHERS_DAY", label: "Father's Day", emoji: "👔", color: "from-blue-500 to-indigo-500" },
  { value: "GRADUATION", label: "Graduation", emoji: "🎓", color: "from-indigo-500 to-purple-500" },
  { value: "WEDDING", label: "Wedding", emoji: "💒", color: "from-amber-200 to-yellow-400" },
  { value: "BABY_SHOWER", label: "Baby Shower", emoji: "👶", color: "from-sky-300 to-blue-400" },
  { value: "JUST_BECAUSE", label: "Just Because", emoji: "✨", color: "from-violet-500 to-fuchsia-500" },
  { value: "GET_WELL", label: "Get Well", emoji: "💐", color: "from-green-400 to-emerald-500" },
  { value: "SYMPATHY", label: "Sympathy", emoji: "🕊️", color: "from-slate-400 to-gray-500" },
] as const;

export const VIDEO_STYLES = [
  { value: "CINEMATIC", label: "Cinematic", description: "Dramatic, film-like quality", preview: "🎬" },
  { value: "PLAYFUL", label: "Playful", description: "Fun and colorful animation", preview: "🎨" },
  { value: "ELEGANT", label: "Elegant", description: "Sophisticated and refined", preview: "✨" },
  { value: "RETRO", label: "Retro", description: "Nostalgic 80s/90s vibes", preview: "📼" },
  { value: "NATURE", label: "Nature", description: "Scenic and organic", preview: "🌿" },
  { value: "ABSTRACT", label: "Abstract", description: "Modern and artistic", preview: "🔮" },
  { value: "NEON", label: "Neon", description: "Glowing cyberpunk style", preview: "💜" },
  { value: "WATERCOLOR", label: "Watercolor", description: "Soft, painted aesthetic", preview: "🎨" },
  { value: "COMIC", label: "Comic", description: "Bold pop-art style", preview: "💥" },
  { value: "MINIMALIST", label: "Minimalist", description: "Clean and simple", preview: "⬜" },
] as const;

export const FREE_VIDEOS_TOTAL = 2; // Lifetime free videos (not per month)
export const UNLIMITED_MONTHLY_CAP = 50; // Max videos per month on Pro+ plan

export const APP_NAME = "GiftFlick";
export const APP_DESCRIPTION = "AI-powered personalized video messages that make every occasion unforgettable.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giftflick.app";
