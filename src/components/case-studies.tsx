import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export const caseStudies = [
  {
    id: "audio",
    title: "Extending Wear For Audio Wearables",
    category: "Industrial Design",
    year: "2025",
    description:
      "Project Open is an audio form factor designed to improve the shortcomings of current headphones and earphones.",
    image:
      "/headphones/image_placeholder_8.png",
    bannerImage:
      "/headphones/image_placeholder_10.png",
    tags: ["3D Modeling", "Interaction Design", "Prototyping"],
    role: "Lead Product Designer and Filmmaker",
    advisors: [],
    contributions: [
      "Led the main prototyping and 3D modeling for nearly 20 iterative concepts.",
      "Contributed to nearly 30 trials of user testing to adjust designs for over 94 potential ears.",
      "Developed a branding and pitch video demonstrating the headphones' interactions."
    ],
    timeline: "4 weeks",
    showcaseVideo: "2mzSQccg3mY",
    team: ["Caleb Aguiar", "Alexander Akande", "Kyo Fan", "Meera Divecha Forespring", "Hannah Hatchett"],
  },
  {
    id: 3,
    title: "Creating A New Way To Shop and Find Games",
    category: "App Design",
    year: "2025",
    description:
      "A Steam Shop redesign to focus more on the immersion and entertainment value of each game.",
    image:
      "/steamredesign/steamredesign.jpg",
    tags: ["Web", "Ecommerce", "Gaming"],
    role: "UX/UI Designer",
    advisors: [
      { name: "Dr. Emily Chen", title: "Health UX Researcher, Stanford" },
    ],
    team: ["Caleb Aguiar", "Dr. Emily Chen"],
  },
  {
    id: 1,
    title: "Building a Mini Golf Course from Scratch",
    category: "Design",
    year: "2026",
    description:
      "Putting together physical objects with player interactions through code and arduinos",
    image:
      "/Minigolf/minigolfhole.png",
    tags: ["Interaction Design", "Physical Design", "Prototyping", "Electronics"],
    role: "Designer",
    advisors: [
      { name: "John Snavely", title: "Head of Design, Xbox" },
      { name: "Yessenia Garcia", title: "Technical Program Manager II, Xbox" },
    ],
    team: ["Caleb Aguiar", "Clarisse Pelayo Sicatt", "Sauhee Shannon Han", "Meera Forespring"],
    bannerVideo: "1187888582",
  },

];

export function getBrightAccent(color: string) {
  let hex = color.startsWith('#') ? color.substring(1) : color;
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return 'orange';

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min || max === 0) return 'orange';

  const d = max - min;
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);

  return `hsl(${h}, 100%, 75%)`;
}

// Corner radius used by both the dither mask and CSS — keep in sync
const CARD_RADIUS = 30; // px — matches rounded-[30px]


export function CaseStudyCard({ study, darkColor, isActive = false }: { study: (typeof caseStudies)[0]; darkColor: string; isActive?: boolean }) {
  return (
    <div className="relative aspect-[4/3]">
      <a
        href="#"
        className="group relative block w-full h-full overflow-hidden cursor-pointer"
        style={{
          borderRadius: CARD_RADIUS,
        }}
      >
        <img
          src={study.image}
          alt={study.title}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Hue-matching overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundColor: darkColor,
            mixBlendMode: "color",
            opacity: isActive ? 0 : 1,
          }}
        />

        {/* Mobile Title Overlay */}
        <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 lg:hidden pointer-events-none transition-opacity duration-500">
          <h3
            className="text-white"
            style={{
              fontFamily: '"Domaine Display", serif',
              fontWeight: 600,
              fontSize: "1.75rem",
              lineHeight: 1.2,
              textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5)"
            }}
          >
            {study.title}
          </h3>
        </div>


      </a>
    </div>
  );
}

export function CaseStudies({ darkColor = '#0a0a0a' }: { darkColor?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStudy, setActiveStudy] = useState<(typeof caseStudies)[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const cardsRef = useRef<Record<string | number, HTMLDivElement | null>>({});

  const brightAccent = getBrightAccent(darkColor);



  useEffect(() => {
    const visibleCards = new Set<string | number>();

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          const idEntry = Object.entries(cardsRef.current).find(
            ([_, el]) => el === entry.target
          );
          if (idEntry) {
            const idStr = idEntry[0];
            const id = isNaN(Number(idStr)) ? idStr : Number(idStr);
            if (entry.isIntersecting) {
              visibleCards.add(id);
              changed = true;
            } else {
              visibleCards.delete(id);
              changed = true;
            }
          }
        });

        if (changed) {
          if (visibleCards.size === 0) {
            // Only reset if we've scrolled above the first case study
            const firstCardId = caseStudies[0]?.id;
            const firstCardEl = firstCardId ? cardsRef.current[firstCardId] : null;
            if (firstCardEl) {
              const rect = firstCardEl.getBoundingClientRect();
              if (rect.top > window.innerHeight * 0.4) {
                setActiveStudy(null);
              }
            } else {
              setActiveStudy(null);
            }
          } else {
            const firstVisibleId = Array.from(visibleCards)[0];
            const study = caseStudies.find(s => s.id === firstVisibleId);
            if (study) setActiveStudy(study);
          }
        }
      },
      {
        threshold: 0.7
      }
    );

    // Initial check and observe
    const elements = Object.values(cardsRef.current).filter(Boolean) as HTMLDivElement[];
    elements.forEach(el => observer.observe(el));

    // Re-observe if refs change (e.g. after mount)
    // Though they shouldn't change much since list is static.
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full"
      style={{
        backgroundColor: darkColor,
        transition: 'background-color 0.6s ease',
      }}
    >
      <div>
        <div className="relative w-full h-full px-6 md:pl-10 md:pr-4 lg:px-12 py-20 md:py-28">
          <div className="w-full">
            {/* Two-column layout: sticky title left, cards right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left column: Sticky title */}
              <div className="lg:col-span-4 lg:sticky lg:top-32 self-start flex flex-col">
                <div className="grid w-full">
                  {/* Default State */}
                  <div
                    className="col-start-1 row-start-1 w-full transition-all duration-300 ease-in-out"
                    style={{
                      opacity: activeStudy ? 0 : 1,
                      transform: activeStudy ? 'translateY(-15px)' : 'translateY(0)',
                      pointerEvents: activeStudy ? 'none' : 'auto',
                      transitionDelay: activeStudy ? '0ms' : '200ms',
                    }}
                  >
                    <h2
                      className="text-white"
                      style={{
                        fontFamily: '"Domaine Display", serif',
                        fontSize: "clamp(2.8rem, 4vw, 8rem)",
                        fontWeight: 700,
                        lineHeight: 1.1,
                      }}
                    >
                      CASE<br />STUDIES
                    </h2>
                    <p
                      className="text-white mt-4 text-[13px] max-w-md leading-relaxed"
                      style={{ fontFamily: '"American Grotesk", sans-serif', fontSize: 'clamp(14px, 2vw, 18px)' }}
                    >
                      This is a collection of my work from academia, higher education client work, and corporate work.
                    </p>
                  </div>

                  {/* Hovered State */}
                  <div
                    className="col-start-1 row-start-1 w-full transition-all duration-300 ease-in-out hidden lg:block"
                    style={{
                      opacity: activeStudy ? 1 : 0,
                      transform: activeStudy ? 'translateY(0)' : 'translateY(15px)',
                      pointerEvents: activeStudy ? 'auto' : 'none',
                      transitionDelay: activeStudy ? '200ms' : '0ms',
                    }}
                  >
                    {activeStudy && (
                      <div className="flex flex-col gap-6">
                        {/* Title & Description */}
                        <div>
                          <h3 className="text-white text-3xl md:text-4xl mb-3 leading-tight" style={{ fontFamily: '"Domaine Display", serif', fontWeight: 600 }}>
                            {activeStudy.title}
                          </h3>
                          <p className="text-white/75 text-[15px] md:text-[16px] leading-relaxed max-w-sm mb-4" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                            {activeStudy.description}
                          </p>

                          {/* Tags */}
                          <div className="flex gap-2 flex-wrap">
                            {activeStudy.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] uppercase text-white/80 bg-white/5 px-3 py-1.5"
                                style={{
                                  fontFamily: '"American Grotesk", sans-serif',
                                  borderRadius: 999,
                                  letterSpacing: "0.05em"
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                          <div>
                            <h4 className="text-white/40 text-[10px] md:text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: '"American Grotesk", sans-serif' }}>Year</h4>
                            <p className="text-white/90 text-[14px] md:text-[15px]" style={{ fontFamily: '"American Grotesk", sans-serif' }}>{activeStudy.year}</p>
                          </div>
                          <div className="col-span-2">
                            <h4 className="text-white/40 text-[10px] md:text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: '"American Grotesk", sans-serif' }}>Category</h4>
                            <p className="text-white/90 text-[14px] md:text-[15px]" style={{ fontFamily: '"American Grotesk", sans-serif' }}>{activeStudy.category}</p>
                          </div>
                        </div>

                        {/* View Case Study Link */}
                        <div className="mt-4">
                          {(activeStudy.id === 1 || activeStudy.id === 3) ? (
                            <button
                              onClick={() => setShowModal(true)}
                              className="inline-flex items-center text-[12px] uppercase tracking-widest transition-colors group text-[color:var(--accent)] hover:text-white"
                              style={{
                                fontFamily: '"American Grotesk", sans-serif',
                                '--accent': brightAccent
                              } as React.CSSProperties}
                            >
                              <span className="border-b border-current pb-1 transition-colors">View Case Study</span>
                              <svg className="w-3 h-3 ml-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                          ) : (
                            <Link
                              to={`/case-study/${activeStudy.id}`}
                              className="inline-flex items-center text-[12px] uppercase tracking-widest transition-colors group text-[color:var(--accent)] hover:text-white"
                              style={{
                                fontFamily: '"American Grotesk", sans-serif',
                                '--accent': brightAccent
                              } as React.CSSProperties}
                            >
                              <span className="border-b border-current pb-1 transition-colors">View Case Study</span>
                              <svg className="w-3 h-3 ml-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column: Case study cards */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 gap-5 md:gap-6">
                  {caseStudies.map((study) => {
                    const isActive = activeStudy?.id === study.id;
                    const isNotBuilt = study.id === 1 || study.id === 3;
                    return (
                      <div
                        key={study.id}
                        ref={(el) => { cardsRef.current[study.id] = el; }}
                        className="block"
                      >
                        {isNotBuilt ? (
                          <div
                            onClick={(e) => { e.preventDefault(); setShowModal(true); }}
                            className="block cursor-pointer"
                          >
                            <CaseStudyCard study={study} darkColor={darkColor!} isActive={isActive} />
                          </div>
                        ) : (
                          <Link
                            to={`/case-study/${study.id}`}
                            className="block"
                          >
                            <CaseStudyCard study={study} darkColor={darkColor!} isActive={isActive} />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div
            className="relative bg-[#1a1a1a] p-8 rounded-2xl max-w-md w-full shadow-2xl"
            style={{ fontFamily: '"American Grotesk", sans-serif' }}
          >
            <h3 className="text-white text-xl md:text-2xl mb-4 font-semibold" style={{ fontFamily: '"Domaine Display", serif' }}>
              Work in Progress
            </h3>
            <p className="text-white/80 text-[15px] leading-relaxed mb-6">
              Sorry, this case study is still being built out. Check back later (hopefully by <span style={{ color: brightAccent }}>June 1st</span>)!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-xl text-white/90 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </section >
  );
}
