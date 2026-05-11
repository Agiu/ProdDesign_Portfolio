import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export const caseStudies = [
  {
    id: 2,
    title: "Headphones of the Future",
    category: "Industrial Design",
    year: "2025",
    description:
      "A bandless headphone concept designed to alleviate head fatigue and provide a more open audio experience.",
    image:
      "/headphones/image_placeholder_8.png",
    bannerImage:
      "/headphones/image_placeholder_10.png",
    tags: ["3D Modeling", "Interaction Design", "Prototyping"],
    role: "Product Designer, Cinematographer",
    advisors: [],
    contributions: [
      "Led the main prototyping and 3D modeling for nearly 20 iterative concepts.",
      "Contributed to nearly 30 rounds of user testing to adjust designs for over 47 potential ears.",
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

// ─── Rounded-rectangle SDF ───────────────────────────────────────────────────
// Returns negative inside the shape, positive outside.
// hw/hh are the true half-extents (width/2, height/2). r is corner radius.
function sdfRoundedRect(
  px: number,
  py: number,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  r: number
): number {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  return (
    Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) +
    Math.min(Math.max(qx, qy), 0) -
    r
  );
}

// Dither mask shaped as a rounded rectangle — dissolve traces the curved edges
function generateDitherMask(
  width: number,
  height: number,
  edgeSize: number = 44,
  cornerRadius: number = CARD_RADIUS
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const bayer8 = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
  ].map((row) => row.map((v) => v / 64));

  const imageData = ctx.createImageData(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const hw = width / 2;
  const hh = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // sdf: negative = inside shape, positive = outside
      const sdf = sdfRoundedRect(x + 0.5, y + 0.5, cx, cy, hw, hh, cornerRadius);
      // distFromEdge: how far inward from the boundary (positive inside, negative outside)
      const distFromEdge = -sdf;

      const opacity = Math.min(Math.max(distFromEdge / edgeSize, 0), 1);
      const threshold = bayer8[y % 8][x % 8];
      const pixel = opacity > threshold ? 255 : 0;
      const idx = (y * width + x) * 4;
      imageData.data[idx] = pixel;
      imageData.data[idx + 1] = pixel;
      imageData.data[idx + 2] = pixel;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

// ─ Bitrate-slider image canvas ─────────────────────────────────────────────
export function PixelatedImageCanvas({
  src,
  hovered,
  width,
  height,
}: {
  src: string;
  hovered: boolean;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const animStartTimeRef = useRef<number | null>(null);
  const animStartValueRef = useRef(0);
  const prevTargetRef = useRef(0);

  const MAX_BLOCK = 72;
  const ANIM_DURATION = 700; // ms

  // Ease-in-ease-out function (smoothstep)
  const easeInOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  useEffect(() => {
    setImgLoaded(false);
    imgRef.current = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    return () => { img.onload = null; };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;
    const ctx = canvas.getContext("2d")!;

    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }
    const tmp = offscreenRef.current;
    let rafId = 0;

    const draw = (timestamp: number) => {
      const target = hovered ? 1 : 0;

      // Detect if target changed and restart animation
      if (target !== prevTargetRef.current) {
        animStartTimeRef.current = timestamp;
        animStartValueRef.current = progressRef.current;
        prevTargetRef.current = target;
      }

      // Initialize animation start time if target changed
      if (animStartTimeRef.current === null) {
        animStartTimeRef.current = timestamp;
        animStartValueRef.current = progressRef.current;
      }

      const elapsed = timestamp - animStartTimeRef.current;
      const progress = Math.min(elapsed / ANIM_DURATION, 1);
      const easedProgress = easeInOutQuad(progress);

      // Interpolate from start value to target
      progressRef.current =
        animStartValueRef.current + (target - animStartValueRef.current) * easedProgress;

      // Reset animation if we've reached the target
      if (progress >= 1) {
        progressRef.current = target;
        animStartTimeRef.current = null;
      }

      const p = progressRef.current;
      const blockSize = Math.max(1, Math.round(MAX_BLOCK * Math.pow(1 - p, 2.8)));

      ctx.clearRect(0, 0, width, height);

      if (imgRef.current) {
        const img = imgRef.current;
        // object-fit: cover crop
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = width / height;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (imgAspect > canvasAspect) {
          sw = img.naturalHeight * canvasAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / canvasAspect;
          sy = (img.naturalHeight - sh) / 2;
        }

        if (blockSize <= 1) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        } else {
          const smallW = Math.max(1, Math.ceil(width / blockSize));
          const smallH = Math.max(1, Math.ceil(height / blockSize));
          tmp.width = smallW;
          tmp.height = smallH;
          const tmpCtx = tmp.getContext("2d")!;
          tmpCtx.imageSmoothingEnabled = blockSize > 8;
          tmpCtx.clearRect(0, 0, smallW, smallH);
          tmpCtx.drawImage(img, sx, sy, sw, sh, 0, 0, smallW, smallH);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(tmp, 0, 0, width, height);
        }
      }

      // Scanlines: thick at low res, gone at full res
      const scanlineAlpha = Math.pow(1 - p, 1.8) * 0.14;
      if (scanlineAlpha > 0.002) {
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.globalAlpha = scanlineAlpha;
        for (let y = 0; y < height; y += 3) {
          ctx.fillRect(0, y, width, 1);
        }
        ctx.globalAlpha = 1;
      }

      // CSS filter: tolerance-crush → natural colour
      const contrast = (1 + (1 - p) * 2.2).toFixed(3);
      const brightness = (0.38 + p * 0.22).toFixed(3);
      //const saturate = (p * 1.15).toFixed(3);
      canvas.style.filter = `contrast(${contrast}) brightness(${brightness})`;
      //{saturate(${saturate})}

      if (progressRef.current !== target) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [hovered, width, height, imgLoaded]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full z-0"
      style={{}}
    />
  );
}

export function CaseStudyCard({ study, darkColor, isActive = false }: { study: (typeof caseStudies)[0]; darkColor: string; isActive?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>("");

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        if (w > 0 && h > 0) {
          setMaskUrl(generateDitherMask(w, h, 44, CARD_RADIUS));
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative aspect-[4/3]"
    >
      <a
        href="#"
        className="group relative block w-full h-full overflow-hidden cursor-pointer"
        style={{
          borderRadius: CARD_RADIUS,
          maskImage: maskUrl ? `url(${maskUrl})` : undefined,
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
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
  const cardsRef = useRef<Record<number, HTMLDivElement | null>>({});

  const brightAccent = getBrightAccent(darkColor);



  useEffect(() => {
    const visibleCards = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          const idEntry = Object.entries(cardsRef.current).find(
            ([_, el]) => el === entry.target
          );
          if (idEntry) {
            const id = Number(idEntry[0]);
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
