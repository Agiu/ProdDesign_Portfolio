/**
 * The films / video-portfolio page (`/films`). Content mirrors the video
 * section of kaelub.com/video-portfolio.
 *
 * ── TODO: fill in each `youtubeId` ─────────────────────────────────────────
 * Every film below has an empty `youtubeId`. Paste the 11-character id from
 * the video's YouTube URL:
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ   → "dQw4w9WgXcQ"
 *   https://youtu.be/dQw4w9WgXcQ                  → "dQw4w9WgXcQ"
 * The thumbnail and the modal player both derive from this id — nothing else
 * to wire up. A film left with an empty id renders as a disabled placeholder
 * card, so the page still builds and looks right before the ids land.
 */

export type Film = {
  /** 11-char YouTube video id (see the file header). Empty = placeholder. */
  youtubeId: string;
  title: string;
  description: string;
  /** Free-text label shown as the card eyebrow, e.g. "Short Film". */
  category: string;
  /** Optional; shown beside the category when present. */
  year?: string;
};

export const filmsPage = {
  heading: "video & multimedia",
  intro:
    "A collection of videography, 3D motion, and short films exploring visual storytelling outside of traditional product design.",
};

export const films: Film[] = [
  {
    youtubeId: "iBr7-u9myAw",
    title: "Caleb Aguiar: Demo Reel",
    description:
      "A showcase of my videography, editing, and motion design work.",
    category: "Demo Reel",
  },
  {
    youtubeId: "2mzSQccg3mY",
    title: "Headphones of the Future: Project Open",
    description:
      "A concept video exploring the interaction and design of bandless headphones.",
    category: "Product Design",
  },
  {
    youtubeId: "0EFLRxWz0xE",
    title: "Bid Day 2024!",
    description:
      "A high-energy recap capturing the excitement of Bid Day 2024.",
    category: "Event Videography",
    year: "2024",
  },
  {
    youtubeId: "OY9rGIfXh1I",
    title: "Jekyllyde",
    description:
      "A short film project exploring lighting, narrative pacing, and duality.",
    category: "Short Film",
  },
  {
    youtubeId: "KjhYBqqyhSk",
    title: "An Introduction and my path — Live Mas Scholarship Video",
    description: "A personal documentary detailing my journey and passions.",
    category: "Documentary",
  },
  {
    youtubeId: "WphwNnOQC7s",
    title: "Ethan Brown '25 | Major Declaration Day",
    description: "Capturing a pivotal moment for a student's academic journey.",
    category: "Documentary",
  },
  {
    youtubeId: "lehaYhcnj10",
    title: "Winter 2023 Commencement Recap",
    description:
      "A cinematic recap of the Winter 2023 graduation ceremonies.",
    category: "Event Videography",
    year: "2023",
  },
  {
    youtubeId: "J305VXJf5eU",
    title: "HLA Short Film: TOUR (S2FM)",
    description: "A short film produced entirely within the Source 2 engine.",
    category: "Short Film · Animation",
  },
];
