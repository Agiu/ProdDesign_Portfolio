/**
 * Copy for the terminal pretrial homepage (app/page.tsx, components/system).
 * Case studies, films, the résumé rows, and contact details are still read
 * from content/home.ts and content/films.ts, so this file only holds what the
 * new layout says on its own.
 *
 * Readouts are texture, but every value in them is true, and nothing a visitor
 * needs lives only in a readout: the same facts appear in plain language in
 * the hero statement, the profile, or the contact block.
 */

export type Readout = { label: string; value: string };

export const system = {
  nav: [
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Films", href: "#films" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    name: ["Caleb", "Aguiar"],
    statement:
      "Product designer and software engineer working across UX, motion, and film.",
    cta: { label: "See the case studies", href: "#work" },
    /** The frame's top edge. Decorative, so it's hidden from assistive tech. */
    frameTop: [
      ["kaelub.com", "Portfolio index, 2026"],
      ["Product design", "Software engineering"],
      ["Seattle, WA", "47.61° N, 122.33° W"],
    ],
    /** The frame's bottom edge. Real information, so it stays readable. */
    frameBottom: [
      { label: "Status", value: "Open to product and UX roles" },
      { label: "Education", value: "MHCI+D, University of Washington" },
      { label: "Based in", value: "Seattle, WA" },
    ] satisfies Readout[],
    still: {
      src: "/images/hero-1.webp",
      alt: "Caleb running along a waterfront railing, wearing the Project Open headphone prototype",
      caption: "Plate 01 / Project Open",
    },
  },

  work: {
    heading: "Case studies",
    /** The first N listed studies get a cover and full readout; the rest
        collapse to one-line rows underneath. */
    featuredCount: 3,
    moreHeading: "More projects",
  },

  about: {
    heading: "About",
    body: [
      "I’m Caleb Aguiar (Kaelub), a product designer with a background in software engineering. I work in the handoff between design thinking and implementation.",
      "Because I can build what I design, I prototype early. My projects move between UI and interaction design, storytelling, AI, web engineering, and sometimes social activism.",
    ],
    disciplines:
      "Product design, interaction design, software engineering, motion, film",
  },

  films: {
    heading: "Films",
    intro:
      "Beyond UX design, I explore videography, 3D motion, and short films to tell visual stories.",
    /** YouTube ids from content/films.ts, in display order. The first leads. */
    selection: ["iBr7-u9myAw", "oO-0QA1BzfQ", "2mzSQccg3mY", "OY9rGIfXh1I"],
    archive: { label: "All films", href: "/films" },
  },

  contact: {
    closing: "End of index",
  },
};
