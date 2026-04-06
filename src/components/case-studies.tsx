import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export const caseStudies = [
  {
    id: 1,
    title: "Xbox Restructuring",
    category: "Product Design",
    year: "2026",
    description:
      "End-to-end redesign of a SaaS analytics platform, improving data legibility and user task completion by 40%.",
    image:
      "https://images.unsplash.com/photo-1720962158883-b0f2021fb51e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwcmVkZXNpZ24lMjBkYXNoYm9hcmQlMjBkYXJrfGVufDF8fHx8MTc3NTA4NDA1Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["UI/UX", "Design System", "Analytics"],
    role: "Designer",
    advisors: [
      { name: "John Snavely", title: "Head of Design, Xbox" },
      { name: "Yessenia Garcia", title: "Technical Program Manager II, Xbox" },
    ],
    team: ["Caleb Aguiar", "Clarisse Pelayo Sicatt", "Sauhee Shannon Han", "Meera Forespring"],
  },
  {
    id: 2,
    title: "Forma Branding",
    category: "Brand Identity",
    year: "2025",
    description:
      "A complete visual identity system for a sustainable architecture studio — from logo to environmental signage.",
    image:
      "https://images.unsplash.com/photo-1762365189058-7be5b07e038b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGluZyUyMGlkZW50aXR5JTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc3NTA4NDA1Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Branding", "Print", "Strategy"],
    role: "Art Director",
    advisors: [
      { name: "Marco Rossi", title: "Founding Partner, Studio Forma" },
      { name: "Mike Ross", title: "Brand Strategist, Freelance" },
    ],
    team: ["Caleb Aguiar", "Studio Forma", "Mike Ross"],
  },
  {
    id: 3,
    title: "Pulse Mobile",
    category: "App Design",
    year: "2024",
    description:
      "Health tracking app with adaptive interfaces that respond to user behavior and biometric input patterns.",
    image:
      "https://images.unsplash.com/photo-1748801583967-3038967d7279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBVSSUyMHByb3RvdHlwZXxlbnwxfHx8fDE3NzUwODQwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Mobile", "iOS", "Health"],
    role: "UX/UI Designer",
    advisors: [
      { name: "Dr. Emily Chen", title: "Health UX Researcher, Stanford" },
    ],
    team: ["Caleb Aguiar", "Dr. Emily Chen"],
  },
  {
    id: 4,
    title: "Voidmarket",
    category: "E-Commerce",
    year: "2024",
    description:
      "Reimagining luxury e-commerce with immersive product storytelling and a brutalist checkout flow.",
    image:
      "https://images.unsplash.com/photo-1648134859177-66e35b61e106?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBwcm9kdWN0JTIwcGFnZSUyMGRlc2lnbnxlbnwxfHx8fDE3NzUwODQwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Web", "E-Commerce", "Interaction"],
    role: "Front-End Developer & Designer",
    advisors: [
      { name: "Voidmarket Founders", title: "Co-founders, Voidmarket" },
    ],
    team: ["Caleb Aguiar", "Voidmarket Founders"],
  },
  {
    id: 5,
    title: "Synthwave OS",
    category: "Concept Design",
    year: "2024",
    description:
      "A speculative operating system UI exploring retro-futurism aesthetics with modern usability paradigms.",
    image:
      "https://images.unsplash.com/photo-1761044590861-71df31e43d0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcHAlMjBpbnRlcmZhY2UlMjBkZXNpZ24lMjBkYXJrfGVufDF8fHx8MTc3NTA4NDA1MXww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Concept", "UI", "Exploration"],
    role: "Sole Designer",
    advisors: [],
    team: ["Caleb Aguiar"],
  },
];

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
function PixelatedImageCanvas({
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
  const animRef = useRef<number>(0);
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

export function CaseStudyCard({ study, darkColor }: { study: (typeof caseStudies)[0]; darkColor: string }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>("");
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        if (w > 0 && h > 0) {
          setDims({ w, h });
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        {/* Bitrate-slider pixelated image canvas */}
        {dims.w > 0 && dims.h > 0 && (
          <PixelatedImageCanvas
            src={study.image}
            hovered={hovered}
            width={dims.w}
            height={dims.h}
          />
        )}

        {/* Hue-matching overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundColor: darkColor,
            mixBlendMode: "color",
            opacity: hovered ? 0 : 1,
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-20 pointer-events-none transition-all duration-700"
          style={{
            background: hovered
              ? "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 30%, transparent 55%)",
          }}
        />



        {/* Content */}
        <div className="absolute inset-0 z-30 flex flex-col justify-end p-5 md:p-7">

          <h3
            className="text-white transition-all duration-500"
            style={{
              fontFamily: '"Domaine Display", serif',
              fontWeight: 700,
              fontSize: hovered ? "1.35rem" : "2.5rem",
              transform: hovered ? "translateY(0)" : "translateY(3px)",
            }}
          >
            {study.title}
          </h3>

          <div
            className="flex items-center gap-2 mb-2 transition-all duration-500"
            style={{
              opacity: hovered ? 1 : 0.5,
              transform: hovered ? "translateY(0)" : "translateY(5px)",
            }}
          >
            <span
              className="text-[10px] uppercase text-white"
              style={{ fontFamily: '"American Grotesk", sans-serif' }}
            >
              {study.category}
            </span>
            <span className="text-white/40">·</span>
            <span
              className="text-[10px] text-white/60"
              style={{ fontFamily: '"American Grotesk", sans-serif' }}
            >
              {study.year}
            </span>
          </div>

          <p
            className="text-white/70 text-[15px] leading-relaxed max-w-sm mt-2 transition-all duration-600"
            style={{
              fontFamily: '"American Grotesk", sans-serif',
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(10px)",
              maxHeight: hovered ? 80 : 0,
              overflow: "hidden",
            }}
          >
            {study.description}
          </p>

          {/* Tags — pill shaped */}
          <div
            className="flex gap-2 mt-3 flex-wrap transition-all duration-500"
            style={{
              opacity: hovered ? 0.7 : 0,
              transform: hovered ? "translateY(0)" : "translateY(6px)",
            }}
          >
            {study.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase text-white/70 border border-white/20 px-3 py-1"
                style={{
                  fontFamily: '"American Grotesk", sans-serif',
                  borderRadius: 999,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </a>
    </div>
  );
}

export function CaseStudies({ darkColor = '#0a0a0a' }: { darkColor?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When rect.bottom is less than windowHeight, the About section below is entering the screen.
      // We fade out the content over a span of ~400px (or half the window height).
      const fadeDistance = Math.min(windowHeight * 0.6, 500);

      if (rect.bottom > windowHeight) {
        setOpacity(1);
      } else {
        const overlap = windowHeight - rect.bottom;
        const newOpacity = Math.max(0, 1 - overlap / fadeDistance);
        setOpacity(newOpacity);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize on mount

    return () => window.removeEventListener("scroll", handleScroll);
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
      <div
        style={{
          opacity,
          pointerEvents: opacity < 0.1 ? "none" : "auto",
        }}
      >
        <div className="relative w-full h-full px-6 md:pl-10 md:pr-4 lg:px-12 py-20 md:py-28">
          <div className="w-full">
            {/* Two-column layout: sticky title left, cards right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left column: Sticky title */}
              <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
                <div>
                  <h2
                    className="text-white"
                    style={{
                      fontFamily: '"Domaine Display", serif',
                      fontSize: "clamp(2.8rem, 4vw, 8rem)",
                      fontWeight: 700,
                      lineHeight: 1.1,
                    }}
                  >
                    CASE STUDIES
                  </h2>
                  <p
                    className="text-white mt-4 text-[13px] max-w-md leading-relaxed"
                    style={{ fontFamily: '"American Grotesk", sans-serif', fontSize: 'clamp(14px, 2vw, 18px)' }}
                  >
                    This is a collection of my work from academia, higher education client work, and corporate work.
                  </p>
                </div>
              </div>

              {/* Right column: Case study cards */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 gap-5 md:gap-6">
                  {caseStudies.map((study) => (
                    <Link to={`/case-study/${study.id}`} key={study.id} className="block">
                      <CaseStudyCard study={study} darkColor={darkColor!} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
