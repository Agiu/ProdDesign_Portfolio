/**
 * The recruiter page (`/recruiter`) — the résumé argument on one screen.
 *
 * The homepage sells the work; this page sells the person doing it. Same
 * content in a different order: every position I've held, what each one
 * actually changed, a picture or two of it, and the shortest possible route to
 * the case study or the video that proves it.
 *
 * Positions mirror `about.experience` in `content/home.ts` — that list is the
 * canonical résumé and this one is its long form, so a role added there wants
 * a matching entry here. Durations are the same numbers, read out through the
 * same `duration()` formatter, rather than restated as text.
 *
 * ── Placeholders ───────────────────────────────────────────────────────────
 * Three things render as a marked placeholder rather than as missing content,
 * so an unfinished entry is obvious on the page instead of silently thin:
 *   • an impact with `placeholder: true`  → hatched bar, "to fill in" label
 *   • a shot with an empty `src`          → hatched frame with its caption
 *   • a link with an empty `href`         → inert chip, not a dead link
 * Fill the field in and the placeholder treatment disappears on its own —
 * there's no second flag to remember to unset.
 */

/** One thing a role changed. The headline carries it; the detail is optional. */
export type Impact = {
  /** One line, past tense, the thing itself — not the responsibility. */
  headline: string;
  /** The sentence a recruiter reads if the headline caught them. */
  detail?: string;
  /**
   * The CTAs this impact earns on its own — a case study, a video, a press
   * mention — rendered right under it rather than left to pile up with the
   * rest of the position's own links (see `Position.links`, further down,
   * for what stays there: a general link that isn't any one bullet's own).
   * Same `PositionLink` shape, same Cta component, just addressed here
   * instead.
   */
  links?: PositionLink[];
  /** Renders as a marked gap to fill rather than as a claim. */
  placeholder?: boolean;
};

/**
 * A picture of the work. Lifted from the case studies wherever a position has
 * one, so this page adds no new media to host — an empty `src` renders the
 * frame as a placeholder and keeps its caption as the note about what belongs
 * there.
 */
export type Shot = {
  /** Path under /public, or a media.kaelub.com URL. Empty = placeholder. */
  src: string;
  alt: string;
  /** Doubles as the placeholder's own label when `src` is empty. */
  caption?: string;
  /**
   * An empty `src` with this set renders the confidential card (a solid
   * plate, lock glyph, "Under NDA") instead of the ordinary hatched
   * placeholder — for a slot that will never get an image, rather than one
   * that's just waiting on one. Ignored once `src` is filled in; there's
   * nothing left to redact once the image exists.
   */
  nda?: boolean;
};

/**
 * A call to action under a position, or under one impact of it (see
 * `Impact.links`). `study` sends the reader to a case study on this site and
 * carries the `?from=recruiter` marker that sends a "back" click here rather
 * than to the homepage (Cta, below); `video` goes off to YouTube — a single
 * film or a playlist, only a difference of label ("View Video" /
 * "View Videos"). `link` is anything else worth citing — a press writeup, an
 * announcement — with no routing of its own beyond the URL itself.
 */
export type PositionLink = {
  label: string;
  /** Empty renders an inert chip — the CTA is planned, the URL isn't in yet. */
  href: string;
  kind: "study" | "video" | "link";
};

export type Position = {
  org: string;
  title: string;
  /** Time actually worked, summed across stints. Same numbers as home.ts. */
  months?: number;
  /** Written-out dates where known. Falls back to the duration alone. */
  period?: string;
  place?: string;
  /** One line: what the role was, before what it changed. */
  summary: string;
  impacts: Impact[];
  shots: Shot[];
  links?: PositionLink[];
  /**
   * Schooling renders a step quieter on the rail than employment — the degrees
   * are the frame around the roles, not entries competing with them.
   */
  kind?: "role" | "education";
  /**
   * A real logo mark, once there is one: drop a square SVG or PNG in
   * `public/logos/` and point at it (e.g. `/logos/microsoft.svg`). Until then
   * every mark is drawn from the organisation's initials — see Timeline.tsx.
   */
  logo?: string;
  /**
   * The quick-nav chip's own label (QuickNav.tsx), for the one case `org`
   * alone can't carry: Trinity shows up three times on the rail, at three
   * different stretches of the same career, and a nav that just said "Trinity
   * University" three times over would send a click nowhere in particular.
   * Omit it and the chip reads `org`, which is right for every entry that
   * doesn't share an org with another one.
   */
  navLabel?: string;
};

export const greeting = {
  /**
   * The rotating half of the title. One word each, all of them a name for the
   * person reading — the line is "Hi <word>, I'm Caleb" and it has to still be
   * that sentence whichever one is showing. The layout reserves the width of
   * the longest, so length is free; add and remove freely.
   */
  salutations: ["Recruiter", "Curious Person", "Scouter", "Onlooker", "Observer"],
  name: "Caleb",
  /** Sits under the title — the claim the timeline below then evidences. */
  intro:
    "I dislike how LinkedIn organizes its profile information, it doesn't allow me to talk about impacts as in depth as I want to. So this page is for more curious folk.",
};

/** Heads the timeline. One line, because the rail below is the argument. */
export const timeline = {
  heading: "Every position, and what it changed",
  note: "Newest first. Education sits on the same rail as the roles, just quieter, because it's the frame around them rather than a job.",
};

/**
 * Reverse chronological — the most recent role is the one being hired against,
 * so it reads first and everything under it is the run-up to it.
 */
export const positions: Position[] = [
  {
    org: "Microsoft",
    logo: "/logos/microsoft.svg",
    title: "Product Designer, Xbox (MHCI+D Capstone)",
    months: 7,
    period: "Feb 2026 – Aug 2026",
    place: "Remote",
    summary:
      "Developed a seven-month long project with Xbox on what a cloud gaming nook could be: a shared surface where a friend group discovers, decides, and drops into a game together.",
    impacts: [
      {
        headline:
          "Led prototyping and strategy on the two features the concept rests on",
        detail:
          "An immediate group decision-making tool that collapses the negotiation into one shared moment, and adaptive information cards that change what they surface depending on who is in the group.",
      },
      {
        headline: "Owned art direction and motion for the prototype",
        detail:
          "Set the hi-fi visual direction and built the motion design in, so the flows read as a product rather than a sequence of screens.",
      },
      {
        headline: "Co-directed and fully produced the product pitch video",
        detail:
          "Using Adobe Premiere Pro & After Effects, I color graded, foley'd, and did the motion graphics for this entire video.",
        links: [
          { label: "View Video", href: "https://youtu.be/oO-0QA1BzfQ", kind: "video" },
        ],
      },
    ],
    shots: [
      {
        src: "https://media.kaelub.com/Xbox/Xbox_casestudy_hero1.jpg",
        alt: "Xbox Arcade, a cloud gaming nook built around group discovery",
        caption: "Xbox Arcade, the cloud gaming nook / made using photoshop, lightroom, and blender",
      },
      {
        src: "",
        alt: "",
        caption: "A prototype screen or a motion still from Xbox Arcade",
      },
    ],
    /* The pitch video now sits with the impact it backs (above); the case
       study is the position's own, so it stays here. */
    links: [
      { label: "Read case study", href: "/case-study/xbox", kind: "study" },
    ],
  },
  {
    org: "University of Washington",
    logo: "/logos/washington.svg",
    title: "Masters Student and Videographer for MHCI+D",
    period: "Sept 2025 – Aug 2026",
    place: "Seattle, WA",
    kind: "education",
    summary:
      "A team of people and I pushed the online aesthetic presence of the program forward; I gave a few lectures about storytelling and multimedia as well as created initiatives to bring designers closer to the codebase. I also developed some pretty data heavy apps while completing this masters program.",
    impacts: [
      {
        headline: "Formed an AI first Initiative for prototyping",
        detail:
          "I created a weekly event called Vibe-Time to help designers get closer to the codebase and get used to on-the-fly prototyping using frontier models. I had more than half the cohort come to the vibe-time program, which was awesome.",
      },
      {
        headline: "Became a lecturer",
        detail:
          "I created a few skill-shareout-lectures for multimedia foundations and camerawork so the cohort could increase their storytelling abilities. I spoke for an hour and a half straight about videos, cameras, framing, cinematography, and editing for at least one of the lectures.",
      },
      {
        headline: "Building Who Owns Seattle, a property-ownership data visualizer",
        detail:
          "Traces how downtown Seattle changed hands over time using King County's public records; still being created.",
        links: [
          { label: "Read case study", href: "/case-study/wos", kind: "study" },
        ],
      },
      {
        headline: "Designed and Led Project Open: open-back headphones for urban use.",
        detail:
          "Designed and prototyped comfortable headphones by user testing over 30 times to fit designs across more than 90 potential ears, and shot + edited the pitch video for it.",
        links: [
          { label: "Read case study", href: "/case-study/audio", kind: "study" },
          { label: "View Video", href: "https://youtu.be/2mzSQccg3mY", kind: "video" },
        ],
      },
      {
        headline: "Designed, programmed, and built a walk-up-and-play minigolf hole",
        detail:
          "Physical structure and player interactions, driven by multiple Adafruit CPXs, a collaborative course two people play at once.",
        links: [
          { label: "Read case study", href: "/case-study/minigolf", kind: "study" },
        ],
      },

    ],
    shots: [
      {
        src: "https://media.kaelub.com/vibe-time.jpeg",
        alt: "The MHCI+D cohort gathered around a table full of laptops at Vibe-Time, the weekly AI-prototyping meetup",
        caption: "Vibe-Time, the weekly AI-prototyping meetup",
      },
      {
        src: "https://media.kaelub.com/Lecture.jpg",
        alt: "Caleb presenting a slide titled \"Caleb's Video Editing Workshop\" to the cohort",
        caption: "One of the multimedia lectures for the cohort",
      },
      {
        src: "https://media.kaelub.com/WOS/3.png",
        alt: "Who Owns Seattle, a loading state over a skeleton of the South Lake Union ownership map",
        caption: "Who Owns Seattle, the ownership map",
      },
      {
        src: "https://media.kaelub.com/Audio/headphone_render.jpg",
        alt: "Project Open, a render of the bandless headphone form factor",
        caption: "Project Open, the bandless form factor",
      },
      {
        src: "https://media.kaelub.com/Minigolf/1.png",
        alt: "The finished collaborative minigolf hole",
        caption: "Draw Together, the finished hole",
      },
    ],
    /* Every link here now sits with the impact it actually backs (above) —
       three case studies and a video under one entry used to read as a row
       of identical "Read case study" chips with no way to tell which was
       which. Nothing left that's the position's own rather than one bullet's,
       so there's no `links` array here at all. */
  },
  {
    org: "Trinity University",
    logo: "/logos/trinity.svg",
    title: "UX Designer Contractor",
    months: 18,
    /* TODO: the written-out dates. The 18 months are a run of stints with the
       masters in the middle of them, so this is a range with a gap in it —
       write it however the résumé does. */
    place: "San Antonio, TX",
    summary:
      "I was Trinity's in-house ux designer for the web team. I helped reenvision the search experience; the school, department, and program pages. Which proactively assisted a larger redesign project later in the year.",
    impacts: [
      {
        headline: "Redesigned the university's search experience for SearchStax",
        detail:
          "Brought in to rebuild the searching suite on top of the new platform, the shortcut students reach for when the navigation fails them.",
        links: [
          { label: "Read case study", href: "/case-study/trinity-search", kind: "study" },
        ],
      },
      {
        headline: "Rebuilt school, department, and program templates around the end user",
        detail:
          "Reconfigured navigation for the prospective students who turned out to be most of the traffic, while holding consistency with the rest of Trinity.edu.",
      },
      {
        headline: "Migrated and created content for new design system",
        detail:
          "For the entire school redesign project, I helped with content UX, gearing most of the school's information on its site towards prospective students instead of a generalized audience.",
      },
    ],
    shots: [
      {
        src: "https://media.kaelub.com/Trinity-Search/Hero.jpg",
        alt: "The redesigned Trinity University search results experience",
        caption: "The searching suite",
      },
      {
        src: "https://media.kaelub.com/Trinity-Redesign/Hero.jpg",
        alt: "The Trinity.edu redesign, a school and program page template",
        caption: "Trinity.edu school and program templates",
      },
    ],
    /* The one link here now sits with the impact it backs (the search
       redesign, above) rather than at the position's own foot. */
  },
  {
    org: "ForeFlight: A Boeing Company",
    logo: "/logos/foreflight.png",
    title: "Software Engineer Intern",
    place: "Austin, Tx",
    months: 3,
    /* TODO: dates. */
    summary:
      "Worked on the debriefing team to ensure the desktop version of the mobile app worked seamlessly with private pilot's tracklogs and logbooks.",
    impacts: [
      {
        headline: "Built a bridge between two data-heavy systems",
        detail:
          "I designed and Built frontend features for a pilot debriefing system between logbooks and track logs on the desktop app. This allowed pilots to easily organize their dense flight information into a simple archive.",
      },
      {
        headline: "Shipped over 3000+ lines of code",
        detail:
          "From the project I worked on, bug fixes, and quality of life nuggets I added in their systems; I added over 3000 lines of code.",
      },
    ],
    shots: [
      {
        src: "",
        alt: "",
        nda: true,
      },
    ],
  },
  {
    org: "Spend With Us",
    logo: "/logos/spendwithus.png",
    title: "Software Development Intern",
    place: "Sydney, NSW, Australia",
    months: 5,
    /* TODO: dates and location. */
    summary:
      "I continued work on an online store vendor created to help local Australian bush businesses that were affected by major bush fires during COVID.",
    impacts: [
      {
        headline: "Started scaffolding on a new Artisan Website for luxury goods",
        detail: "Near the end of the internship the CEO wanted me to start developing an Artisan Website. I built it in a couple days by using wordpress and it's own backend system.",
      },
      {
        headline: "Reduced site loading time by 6 seconds",
        detail: "Through a few php injections and alterations to how image content is populated throughout the site, I brought the site loading times from 10 seconds to about 4 seconds. I don't personally think its much faster, but at least it's not 10 seconds slow.",
      },
    ],
    shots: [

    ],
  },
  {
    org: "Trinity University",
    logo: "/logos/trinity.svg",
    navLabel: "Trinity (Video)",
    title: "Creative Producer Intern",
    months: 32,
    /* TODO: dates. Nearly three years of it, so the range is worth writing. */
    place: "San Antonio, TX",
    summary:
      "The university's video work: commencement and event recaps, student documentaries, and recruitment films, shot, cut, and colored in house.",
    impacts: [
      {
        headline: "Won three Viddy Awards for videos I've created",
        detail:
          "From my time at the Strategic Communications Department, as an intern, I brought in a few awards for the entire team.",
        links: [
          {
            label: "See the announcement",
            href: "https://www.linkedin.com/posts/kaelub_trinity-university-strategic-communications-activity-7183345371073449984--zMM",
            kind: "link",
          },
        ],
      },
      {
        headline: "Produced event, documentary, and recruitment videos for the university",
        detail:
          "Commencement recaps, Bid Day, and student profiles, all shot and edited end to end on the university's own channels.",
      },
      {
        headline: "Created content that reached an audience of over 300,000+ people by being as organic as possible.",
        detail:
          "I produced and composed music for a set of vignettes which were very raw compared to a normal university's marketing polishing. These videos were cinematic yet very in depth about 5 students' journeys in reaching their picked major.",
        links: [
          {
            label: "Watch Major Declaration Day",
            href: "https://www.youtube.com/watch?v=pED6xhw1aOc&list=PL63oJnhgV-LLsFsGanNIZCVyKzZ5SIWNZ&index=3",
            kind: "video",
          },
        ],
      },
    ],
    shots: [
    ],
  },
  {
    org: "Trinity University",
    logo: "/logos/trinity.svg",
    navLabel: "Trinity (B.S. CS)",
    title: "B.S. Computer Science · Cum Laude",
    period: "2021 – 2025",
    place: "San Antonio, TX",
    kind: "education",
    summary:
      "Computer science, with a study-abroad term at the University of Sydney on virtual reality and HCI. This is where the engineering half of the work comes from.",
    impacts: [],
    shots: [],
  },
];

/**
 * The recruiter-specific ask, sat above the site footer rather than replacing
 * it: the footer is the standing invitation every page ends on, and this is
 * the answer to the questions a hiring read arrives with.
 */
export const contact = {
  heading: "What I'm looking for",
  /** Label / value pairs — scanned, not read. */
  facts: [
    { label: "Roles", value: "Product Design · UX Design · Design Engineering" },
    { label: "Based in", value: "Seattle, WA (open to hybrid and remote)" },
  ],
  /** The one line under the facts, before the ways to reach me. */
  note: "If any of the above lines up, the fastest route to me is email. I answer every one.",
};
