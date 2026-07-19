/**
 * All homepage copy lives here. Edit this file to change what the site says —
 * no component changes needed.
 */

export type HeroSlide = {
  /** Path under /public, or a full CDN URL once media moves off-repo. */
  image: string;
  alt: string;
  /** Shown at bottom-right, above the tick blocks. */
  caption: string;
  /**
   * Optional background video, layered over `image`. The still image is what
   * the fractal-tile reveal assembles; once that finishes, if this is set, the
   * video crossfades in on top and plays muted + looped.
   */
  video?: string;
};

export type CaseStudy = {
  /** Matches the markdown filename in `public/case studies/` and the
   *  `/case-study/[slug]` route. */
  slug: string;
  title: string;
  summary: string;
  /** Path under /public, or a full CDN URL once media moves off-repo. Used as
   *  the homepage card thumbnail. */
  cover: string;
  /** Full-bleed banner image on the case-study page. Falls back to `cover`. */
  hero?: string;
  /** Optional background video, layered over the hero banner on the
   *  case-study page once it's buffered enough to play. Muted + looped. */
  video?: string;
  /** Rendered as the small label above the title on hover. */
  discipline: string;
  year: string;
};

export type Credential = {
  institution: string;
  detail: string;
  period: string;
  /** Dimmed in the education list — use for secondary entries. */
  muted?: boolean;
};

export const hero = {
  greeting: "caleb aguiar",
  tagline: "i’m a product designer and software engineer with a love for",
  /** Cycles in the tagline, one word/phrase visible at a time. Add or remove
      entries freely — the layout reserves space for whichever is longest. */
  highlights: [
    "storytelling",
    "world-building",
    "motion design",
    "filmmaking",
    "urban studies",
  ],
  /**
   * The hero carousel. One tick block is rendered per slide, so the block count
   * follows this array — add or remove entries freely.
   */
  slides: [
    {
      image: "/images/hero-1.webp",
      alt: "Caleb riding a passenger ferry, motion-blurred waterfront behind him",
      caption: "Extending Wear For Audio Wearables",
      video: "https://media.kaelub.com/headphones_background_v1%20(2160p).mp4",
    },
    {
      image: "https://media.kaelub.com/case-2.webp",
      alt: "Walk-up-and-play minigolf course",
      caption: "Walk-Up-and-Play Minigolf",
      video: "https://media.kaelub.com/minigolfbackground_v1%20(1080p).mp4",
    },
    {
      image: "/images/hero-3.webp",
      alt: "Interface panels from a game-adjacent control system",
      caption: "Steam Shopping UX Redesign",
    },
    {
      image: "https://media.kaelub.com/WOS/Cover.jpg",
      alt: "Who Owns Seattle dashboard: an ownership map of South Lake Union with a scrubbable ownership-history timeline",
      caption: "Who Owns Seattle?",
    },
  ] as HeroSlide[],
};

export const caseStudiesIntro = {
  heading: "case studies",
  /** Sits opposite the heading, right-aligned behind a "+". */
  note: "this is a collection of my work from academia, industry, and corporate work.",
};

/**
 * Each slug matches a markdown file in `public/case studies/` and its
 * `/case-study/[slug]` page. Covers/heroes for minigolf and wos point at their
 * intended asset paths, which land when those image folders are added.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: "audio",
    title: "Extending Wear For Audio Wearables",
    summary:
      "Project Open is an audio form factor designed to improve the shortcomings of current headphones and earphones.",
    cover: "/images/case-1.webp",
    hero: "/images/hero-1.webp",
    video: "https://media.kaelub.com/headphones_background_v1%20(2160p).mp4",
    discipline: "Interaction Design",
    year: "2025",
  },
  {
    slug: "minigolf",
    title: "Walk-Up-and-Play Minigolf",
    summary:
      "A minigolf course built on nostalgia and spontaneity — finding the balance between complexity and clarity.",
    cover: "https://media.kaelub.com/Minigolf/1.png",
    hero: "https://media.kaelub.com/Minigolf/1.png",
    video: "https://media.kaelub.com/minigolfbackground_v1%20(1080p).mp4",
    discipline: "Experience Design",
    year: "2025",
  },
  {
    slug: "3",
    title: "Steam Storefront Redesign",
    summary:
      "Reframing Steam's storefront around immersion — you're buying the experience, not the game box.",
    cover: "/images/hero-3.webp",
    hero: "/images/hero-3.webp",
    discipline: "Product Design",
    year: "2025",
  },
  {
    slug: "wos",
    title: "Who Owns Seattle",
    summary:
      "A data visualizer tracing property ownership and economic change across downtown Seattle. (Work in progress.)",
    cover: "https://media.kaelub.com/WOS/1.png",
    hero: "https://media.kaelub.com/WOS/3.png",
    discipline: "Data Visualization",
    year: "2025",
  },
];

export const about = {
  heading: "who am i?",
  body: `My name is Caleb Aguiar (Kaelub) and I’m a UX Designer with a background in Software Engineering. Because of this I tend to prototype and enjoy immersing myself into all facets of my work. My projects explore the intersection of UI Design, interaction design, storytelling, AI, and sometimes social activism. I appreciate seeing and discussing where design can enhance a person’s wellness or where it can be used to promote social good.`,
  education: [
    {
      institution: "University of Washington",
      detail: "Masters in HCI + Design",
      period: "2025 – 2026",
    },
    {
      institution: "Trinity University · Cum Laude",
      detail: "B.S. in Computer Science",
      period: "2021 – 2025",
    },
    {
      institution: "University of Sydney · Study Abroad",
      detail: "Virtual Reality HCI",
      period: "2024",
      muted: true,
    },
  ] satisfies Credential[],
};

export const footer = {
  heading: "build with me :]",
  /** Sits under the heading — the one thing you actually want people to do. */
  invitation:
    "Always up for talking design, film, or a good idea that needs a prototype.",
  email: "kaelub.tech@gmail.com",

  /* TODO: swap these for  real handles */
  elsewhere: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/kaelub" },
    { label: "GitHub", href: "https://github.com/kaelub" },
    { label: "Résumé", href: "https://media.kaelub.com/Caleb_Design_Resume.pdf" },
  ],

  now: [
    { label: "Studying", value: "MHCI + Design, University of Washington" },
    { label: "Based in", value: "Seattle, WA" },
    { label: "Open to", value: "Product & UX design roles" },
  ],
};

export const filmmaker = {
  heading: "i’m also a filmmaker",
  body: "Beyond UX design, I spend time exploring videography, 3D motion, and short films to tell compelling visual stories. Go check them out!",
  image: "/images/filmmaker.webp",
  imageAlt: "Still frame from a short film — a figure beside a swimming pool",
  href: "/films",
};
