/**
 * All homepage copy lives here. Edit this file to change what the site says —
 * no component changes needed.
 */

export type HeroSlide = {
  /** Path under /public, or a full CDN URL once media moves off-repo. */
  image: string;
  alt: string;
  /** Shown at bottom-right, above the carousel picker. */
  caption: string;
  /** Case study this slide represents — the caption links to `/case-study/[slug]`. */
  slug: string;
  /**
   * Optional background video, layered over `image`. The still is what shows
   * through the hero's tear first; if this is set, the video fades in on top
   * once it can play smoothly, muted + looped.
   */
  video?: string;
};

/**
 * The metadata band shown under the hero on a case-study page (team, role,
 * contributions, time). Optional — studies without it skip the band entirely.
 * See `CaseMeta.tsx` for the layout.
 */
export type ProjectMeta = {
  /** The author's role on the project. Shown in the "My Role" panel. */
  role: string;
  /** Everyone on the project. The first entry (the author) is emphasised. */
  team: string[];
  /** What the author personally did — rendered as a bulleted list. */
  contributions: string[];
  /** How long it took, e.g. "4 weeks". Omit to drop the "Time" panel. */
  timeline?: string;
  /** Optional subtitle under the timeline, e.g. the actual date range. */
  timelineDetail?: string;
  /** Optional faculty/advisors — a secondary list under the team. */
  advisors?: Advisor[];
};

/** An advisor on a project. The title renders as a subtitle under the name. */
export type Advisor = {
  name: string;
  /** Role and org, e.g. "Head of Design, Xbox". Omit for a bare name. */
  title?: string;
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
  /** Small labels on the homepage card — the project's disciplines and tools. */
  tags?: string[];
  /** Project metadata band under the hero. Studies without it skip the band. */
  meta?: ProjectMeta;
  /**
   * Archived studies stay in this list — their `/case-study/[slug]` page is
   * still built and still reads — but they drop out of everything that links
   * to them: the homepage list, the hero carousel, and the recommendations at
   * the foot of a study. Use `listedCaseStudies` for anything that shows work.
   */
  archived?: boolean;
};

export type Credential = {
  institution: string;
  /** The award, and any honour on it — the row's third column. */
  detail: string;
  /** Years, written out — education is read as when, not as how long. */
  period: string;
  /** Dimmed in the education list — use for secondary entries. */
  muted?: boolean;
};

/**
 * A résumé line. Deliberately the same three-part shape the education list
 * uses — a span, a name, and what it was — so both stacks render through one
 * set of rules in About.tsx and their columns line up down the whole section.
 */
export type Role = {
  org: string;
  title: string;
  /** Time actually worked. Where a role is a run of stints (see below), this
      is their sum, not the distance from the first start to the last end. */
  months: number;
};

/**
 * A span of time in the résumé's own units: months up to a year, then years to
 * the nearest half past it. Held as a number in the entries and formatted here
 * so the rule lives in one place — and so nothing has to be rewritten by hand
 * when a span changes. Roles only: the education list is dated by year (see
 * Credential), because a degree is read as when it happened, not how long it
 * took.
 */
export const duration = (months: number) => {
  if (months < 12) return `${months} mo${months === 1 ? "" : "s"}`;

  const years = Math.round((months / 12) * 2) / 2;
  const half = years % 1 !== 0;

  return `${Math.floor(years)}${half ? "½" : ""} ${years === 1 ? "yr" : "yrs"}`;
};

export const hero = {
  greeting: "Caleb Aguiar",
  tagline: "I’m a product designer and software engineer with a love for",
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
   * The hero carousel. One picker mark is rendered per slide, and each slide
   * gets its own seeded tear in the hero's paper — so both follow this array.
   * Add or remove entries freely.
   */
  slides: [
    {
      image: "https://media.kaelub.com/Xbox/Xbox_casestudy_hero.jpg",
      alt: "Two players on a couch in a lamplit room, an XBOX Arcade lobby on the screen in front of them",
      caption: "A Cloud Gaming Nook for XBOX + Discord",
      slug: "xbox",
      video: "https://media.kaelub.com/Xbox/xbox_vid.mp4",
    },
    {
      image: "/images/hero-1.webp",
      alt: "Caleb riding a passenger ferry, motion-blurred waterfront behind him",
      caption: "Extending Wear For Audio Wearables",
      slug: "audio",
      video: "https://media.kaelub.com/%20headphones_background_v1%20(2160p).mp4",
    },
    {
      image: "https://media.kaelub.com/case-2.webp",
      alt: "Walk-up-and-play minigolf course",
      caption: "Walk-Up-and-Play Minigolf",
      slug: "minigolf",
      video: "https://media.kaelub.com/minigolfbackground_v1%20(1080p).mp4",
    },
    {
      image: "https://media.kaelub.com/WOS/Cover.jpg",
      alt: "Who Owns Seattle dashboard: an ownership map of South Lake Union with a scrubbable ownership-history timeline",
      caption: "Who Owns Seattle?",
      slug: "wos",
    },
  ] as HeroSlide[],
};

/**
 * Every study, archived ones included — this is what the `/case-study/[slug]`
 * route builds from, so an archived page keeps working for anyone holding its
 * link. Anything that *shows* work reads `listedCaseStudies` below instead.
 *
 * Each slug matches a markdown file in `public/case studies/` and its
 * `/case-study/[slug]` page. Covers/heroes for minigolf and wos point at their
 * intended asset paths, which land when those image folders are added.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: "xbox",
    title: "Instant Matchmaking and Game Discovery",
    summary:
      "XBOX Arcade is matchmaking and game discovery combined, utilizing player data to help friend groups play.",
    cover: "https://media.kaelub.com/Xbox/Xbox_casestudy_hero1.jpg",
    hero: "https://media.kaelub.com/Xbox/Xbox_casestudy_hero1.jpg",
    video: "https://media.kaelub.com/Xbox/xbox_vid.mp4",
    discipline: "Product Design",
    year: "2026",
    tags: ["Product Design", "Cloud Gaming", "Motion Design", "Prototyping"],
    meta: {
      role: "Designer, Prototyper, Story Strategist",
      timeline: "Feb - Aug 2026",
      team: [
        "Caleb Aguiar",
        "Clarisse Pelayo Sicat",
        "Sauhee Han",
        "Meera Forespring",
      ],
      advisors: [
        { name: "John Snavely", title: "Head of Design, Xbox" },
        { name: "Yessenia Garcia", title: "Technical Program Manager, Xbox" },
      ],
      contributions: [
        "Led prototyping and strategy of key features such as an immediate group decision-making tool and adaptive information cards per group and category.",
        "Led art and design direction for hi-fi mockups, and implemented animation and motion design into our prototype for a smoother user experience.",
        "Co-directed and produced a product pitch that fits the realm of Xbox and Discord, with funding from Netflix.",
      ],
    },
  },
  {
    slug: "trinity-search",
    title: "Creating a Searching Suite for Trinity University",
    summary:
      "Due to new technology, Trinity.edu hired me to redesign their searching experience for their new SearchStax system.",
    cover: "https://media.kaelub.com/Trinity-Search/Hero.jpg",
    hero: "https://media.kaelub.com/trinity-banner.jpg",
    discipline: "Information Architecture",
    year: "2024",
    tags: ["Search UX", "Information Architecture", "Higher Ed"],
  },
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
    tags: ["3D Modeling", "Interaction Design", "Prototyping"],
    meta: {
      role: "Lead Product Designer and Filmmaker",
      timeline: "4 weeks",
      team: [
        "Caleb Aguiar",
        "Alexander Akande",
        "Kaiyo Fan",
        "Meera Divecha Forespring",
        "Hannah Hatchett",
      ],
      contributions: [
        "Led the main prototyping and 3D modeling for nearly 20 iterative concepts.",
        "Contributed to nearly 30 trials of user testing to adjust designs for over 94 potential ears.",
        "Developed a branding and pitch video demonstrating the headphones' interactions.",
      ],
    },
  },
  {
    slug: "trinity-edu",
    title: "Recentering Student Perspectives on Trinity.edu",
    summary:
      "It's time for a renvisioning of a site with numerous perspectives to convince and support.",
    cover: "https://media.kaelub.com/Trinity-Redesign/Hero.jpg",
    hero: "https://media.kaelub.com/trinity-banner.jpg",
    discipline: "UX Research",
    year: "2024",
    tags: ["UX Research", "Higher Ed", "Website"],
    archived: true,
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
    tags: ["AI", "Data Visualization", "Urban Studies", "Product Design"],
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
    tags: ["Web", "Shopping UX", "Gaming"],
    archived: true,
  },
  {
    slug: "minigolf",
    title: "Walk-Up-and-Play Minigolf",
    summary:
      "Desigining, programming, and building an interactive golf course",
    cover: "https://media.kaelub.com/Minigolf/1.png",
    hero: "https://media.kaelub.com/Minigolf/1.png",
    video: "https://media.kaelub.com/minigolfbackground_v1%20(1080p).mp4",
    discipline: "Experience Design",
    year: "2025",
    tags: ["Interaction Design", "Physical Design", "Prototyping", "Electronics"],
    meta: {
      role: "Designer, Programmer",
      timeline: "10 weeks",
      team: [
        "Caleb Aguiar",
        "Alexander Akande",
        "Emily Wong",
        "Marlyn Reed",
      ],
      contributions: [
        "Developed the physical structure and player interactions for the mini golf hole.",
        "Programmed multiple Adafruit CPXs to either move objects or rearrange light colors.",
        "Prototyped and tested physical interactions.",
        "Created project videos to showcase the atmosphere and prototypes.",
      ],
    },
  },
];

/**
 * The studies the site actually shows — the homepage list, the hero carousel,
 * and the recommendations under a study all read this. Archive a study by
 * setting `archived: true` on it above; its page stays built and reachable,
 * it just stops being linked to from anywhere.
 */
export const listedCaseStudies = caseStudies.filter((study) => !study.archived);

export const about = {
  heading: "A Little About Me",
  portrait: {
    src: "https://media.kaelub.com/caleb_a_profile.jpg",
    alt: "Caleb Aguiar",
  },
  /* Three passes at the same answer — who, what, and why. Set as three short
     paragraphs with air between them (see About.tsx). */
  body: [
    `My name is Caleb Aguiar (Kaelub) and I’m a UX Designer with a background in Software Engineering.`,

    `Because of this molding of two subjects, my projects tend to explore UI Design, interaction design, storytelling, artificial intelligence, web engineering, and sometimes social activism.`,

    `During my freetime I'm either playing videos games, composing music, or practicing my violin.`,
  ],
  /* Sits under the bio as a quiet closing fact, not part of the prose above
     it. The footer states this too (see `footer.now`), which is fine — that
     one is a contact detail, this one is part of the introduction. */
  location: "Located in Seattle, Washington",
  /*
   * Condensed from the full history: consecutive stints at one employer are
   * folded into the role they add up to, so each line is a job rather than a
   * contract. Their months are summed rather than measured end to end — the
   * Trinity UX line has a break in the middle of it (the masters), and counting
   * across that would bill time not worked.
   *
   * No descriptions: the rows are one line each by design (see About.tsx), and
   * the case studies below are where the work actually gets explained.
   */
  experience: [
    { org: "Microsoft", title: "Product Designer (MHCI+D Capstone)", months: 7 },
    { org: "Trinity University", title: "UX Designer", months: 18 },
    { org: "ForeFlight", title: "Software Engineer Intern", months: 3 },
    { org: "Spend With Us", title: "Software Development Intern", months: 5 },
    { org: "Trinity University", title: "Creative Producer Intern", months: 32 },
  ] satisfies Role[],

  /*
   * The one link out of this section. It hangs off the résumé rows rather
   * than off the pair of lists, because /recruiter is those rows at length:
   * the same jobs with what each one changed, the work it produced, and a
   * way to get in touch at the foot of it.
   */
  more: {
    label: "See My Impact",
    href: "/recruiter",
  },

  education: [
    {
      institution: "University of Washington",
      detail: "Masters in HCI + Design",
      period: "2025 – 2026",
    },
    {
      institution: "Trinity University",
      detail: "B.S. Computer Science · Cum Laude",
      period: "2021 – 2025",
    },
    {
      institution: "University of Sydney",
      detail: "Study Abroad · Virtual Reality HCI",
      period: "2024",
      muted: true,
    },
  ] satisfies Credential[],
};

export const footer = {
  heading: "Build with me :]",
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
    { label: "Based in", value: "Seattle, WA" },
    { label: "Open to", value: "Product & UX design roles" },
  ],
};

export const filmmaker = {
  heading: "I’m also a filmmaker",
  body: "Beyond UX design, I spend time exploring videography, 3D motion, and short films to tell compelling visual stories. Go check them out!",
  image: "/images/filmmaker.webp",
  imageAlt: "Still frame from a short film — a figure beside a swimming pool",
  href: "/films",
};
