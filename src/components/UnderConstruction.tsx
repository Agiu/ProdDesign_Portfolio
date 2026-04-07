import { useEffect, useRef, useState } from 'react';

// ── Bayer 8×8 ordered dithering matrix ──────────────────────────
const BAYER8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

// Pre-flatten BAYER8 into a Float32Array for fast lookup (no 2D indexing overhead)
const BAYER_FLAT = new Float32Array(64);
for (let y = 0; y < 8; y++)
  for (let x = 0; x < 8; x++)
    BAYER_FLAT[y * 8 + x] = (BAYER8[y][x] / 64.0 - 0.5);

// ── Sky palette stops (mirrored from WeatherHero) ────────────────
interface SkyStop { hour: number; bg: string; glow: string }

const SKY_STOPS: SkyStop[] = [
  { hour: 0, bg: '#020510', glow: '#1a3a70' },
  { hour: 4, bg: '#04050e', glow: '#283a80' },
  { hour: 6, bg: '#120510', glow: '#c05070' },
  { hour: 8, bg: '#1a0c02', glow: '#d89830' },
  { hour: 12, bg: '#250500', glow: '#f07020' },
  { hour: 15, bg: '#200800', glow: '#e07820' },
  { hour: 18, bg: '#180308', glow: '#b84058' },
  { hour: 20, bg: '#080510', glow: '#383280' },
  { hour: 23, bg: '#020510', glow: '#1a3a70' },
];

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerpHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

function getSkyColors(hour: number): { bg: string; glow: string } {
  const h = ((hour % 24) + 24) % 24;
  const stops = SKY_STOPS;
  if (h <= stops[0].hour) return stops[0];
  if (h >= stops[stops.length - 1].hour) return stops[stops.length - 1];
  let lo = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    if (h >= stops[i].hour && h < stops[i + 1].hour) { lo = i; break; }
  }
  const hi = lo + 1;
  const t = (h - stops[lo].hour) / (stops[hi].hour - stops[lo].hour);
  return {
    bg: lerpHex(stops[lo].bg, stops[hi].bg, t),
    glow: lerpHex(stops[lo].glow, stops[hi].glow, t),
  };
}

// ── Draw — reuses persistent off-screen canvas ───────────────────
const CELL = 4;
const LEVELS = 6;
const STEP = 255 / (LEVELS - 1);
const SCALE = 255 / LEVELS;

function drawFrame(
  canvas: HTMLCanvasElement,
  off: HTMLCanvasElement,
  glowHex: string,
  bgHex: string,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pw = Math.ceil((canvas.offsetWidth * dpr) / CELL);
  const ph = Math.ceil((canvas.offsetHeight * dpr) / CELL);
  const cw = pw * CELL;
  const ch = ph * CELL;

  // Resize only when necessary
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
  if (off.width !== pw || off.height !== ph) {
    off.width = pw;
    off.height = ph;
  }

  const oc = off.getContext('2d', { willReadFrequently: true })!;

  // Background
  oc.fillStyle = bgHex;
  oc.fillRect(0, 0, pw, ph);

  // Radial glow via ellipse transform
  const [gr, gg, gb] = hexToRgb(glowHex);
  oc.save();
  oc.translate(pw * 0.5, ph * 0.5);
  oc.scale(pw * 0.55, ph * 0.44);
  const grd = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
  grd.addColorStop(0, `rgba(${gr},${gg},${gb},0.60)`);
  grd.addColorStop(0.45, `rgba(${gr},${gg},${gb},0.22)`);
  grd.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
  oc.fillStyle = grd;
  oc.fillRect(-1, -1, 2, 2);
  oc.restore();

  // Bayer dithering — hot path, kept tight
  const img = oc.getImageData(0, 0, pw, ph);
  const d = img.data;
  for (let y = 0; y < ph; y++) {
    const row = (y & 7) * 8;          // y % 8, pre-shifted
    for (let x = 0; x < pw; x++) {
      const th = BAYER_FLAT[row + (x & 7)] * SCALE;
      const i = (y * pw + x) * 4;
      d[i] = Math.max(0, Math.min(255, Math.round((d[i] + th) / STEP) * STEP));
      d[i + 1] = Math.max(0, Math.min(255, Math.round((d[i + 1] + th) / STEP) * STEP));
      d[i + 2] = Math.max(0, Math.min(255, Math.round((d[i + 2] + th) / STEP) * STEP));
    }
  }
  oc.putImageData(img, 0, 0);

  // Scale up to display canvas
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, cw, ch);
}

// ── Constants ───────────────────────────────────────────────────
const CYCLE_MS = 10_000;
const TARGET_FPS = 15;                       // color changes slowly — 15 fps is plenty
const FRAME_MS = 1000 / TARGET_FPS;

export function UnderConstruction() {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);   // persistent off-screen canvas
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const lastDrawTs = useRef<number>(0);
  const lastGlow = useRef<string>('');
  const lastBg = useRef<string>('');

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create the persistent off-screen canvas once
    if (!offRef.current) offRef.current = document.createElement('canvas');
    const off = offRef.current;

    const animate = (ts: number) => {
      rafRef.current = requestAnimationFrame(animate);

      if (startRef.current === null) startRef.current = ts;

      // Throttle: skip frame if not enough time has elapsed
      if (ts - lastDrawTs.current < FRAME_MS) return;
      lastDrawTs.current = ts;

      const elapsed = ts - startRef.current;
      const virtualHour = ((elapsed % CYCLE_MS) / CYCLE_MS) * 24;
      const { bg, glow } = getSkyColors(virtualHour);

      // Skip pixel work entirely if colors haven't changed
      if (glow === lastGlow.current && bg === lastBg.current) return;
      lastGlow.current = glow;
      lastBg.current = bg;

      drawFrame(canvas, off, glow, bg);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'all',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Dithered animated glow canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', maxWidth: '680px', width: '100%' }}>
        <p
          style={{
            fontFamily: '"American Grotesk", sans-serif',
            fontSize: 'clamp(11px, 1.2vw, 13px)',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,1)',
            marginBottom: '1.5rem',
          }}
        >
          2026
        </p>

        <h1
          style={{
            fontFamily: '"Domaine Display", serif',
            fontSize: 'clamp(2.8rem, 7vw, 7rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            color: '#ffffff',
            margin: 0,
            marginBottom: '1.5rem',
          }}
        >
          Under
          <br />
          Construction
        </h1>

        <div
          style={{
            width: '48px',
            height: '1px',
            backgroundColor: 'rgba(255,255,255,1)',
            margin: '0 auto 1.75rem',
          }}
        />

        <p
          style={{
            fontFamily: '"American Grotesk", sans-serif',
            fontSize: 'clamp(14px, 1.6vw, 17px)',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'rgba(255,255,255, 1)',
            margin: 0,
          }}
        >
          Hope you've been well!
        </p>
      </div>
    </div>
  );
}
