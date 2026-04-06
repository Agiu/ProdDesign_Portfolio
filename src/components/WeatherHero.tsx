import { useEffect, useRef, useState, useCallback } from 'react';


// Bayer 8x8 ordered dithering matrix
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

interface WeatherData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  currentTemp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  hourlyTemps: number[];
  hourlyTimes: string[];
  currentHour: number;
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function blendHex(hex1: string, hex2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function blendRgba(rgba1: string, rgba2: string, t: number): string {
  const parse = (s: string) => {
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
    if (!m) return [0, 0, 0, 1];
    return [+m[1], +m[2], +m[3], m[4] ? +m[4] : 1];
  };
  const a = parse(rgba1);
  const b = parse(rgba2);
  return `rgba(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)},${(a[3] + (b[3] - a[3]) * t).toFixed(3)})`;
}

interface ColorPalette {
  gradient: string[];
  mountainFills: string[];
  glowColor: string;
  accentDot: string;
}

// Palette definitions keyed by hour of day (deep blue night → warm orange-red day)
const TIME_PALETTE_STOPS: { hour: number; palette: ColorPalette }[] = [
  {
    hour: 0, // Midnight – deep navy
    palette: {
      gradient: ['#020510', '#060d20', '#0c1a38', '#153058', '#1e4075'],
      mountainFills: ['rgba(10,20,60,0.85)', 'rgba(15,35,90,0.55)', 'rgba(25,55,120,0.3)'],
      glowColor: '#1a3a7080',
      accentDot: '#4080c0',
    },
  },
  {
    hour: 4, // Deep night → pre-dawn
    palette: {
      gradient: ['#04050e', '#08102a', '#101c48', '#1c2a62', '#283a80'],
      mountainFills: ['rgba(12,15,55,0.85)', 'rgba(20,28,80,0.55)', 'rgba(35,48,110,0.3)'],
      glowColor: '#283a8080',
      accentDot: '#5060a8',
    },
  },
  {
    hour: 6, // Dawn – purple-rose breaking through
    palette: {
      gradient: ['#120510', '#2a0c1a', '#501830', '#803050', '#b85070'],
      mountainFills: ['rgba(60,15,30,0.85)', 'rgba(100,30,50,0.55)', 'rgba(150,55,70,0.3)'],
      glowColor: '#c0507080',
      accentDot: '#e08090',
    },
  },
  {
    hour: 8, // Golden morning
    palette: {
      gradient: ['#1a0c02', '#3a2005', '#6a400a', '#a06818', '#d89830'],
      mountainFills: ['rgba(100,50,5,0.85)', 'rgba(150,80,15,0.55)', 'rgba(200,120,35,0.3)'],
      glowColor: '#d8983080',
      accentDot: '#f0b848',
    },
  },
  {
    hour: 12, // Peak midday – warm orange-red
    palette: {
      gradient: ['#250500', '#581000', '#8a2800', '#c04a08', '#f07020'],
      mountainFills: ['rgba(140,35,0,0.85)', 'rgba(190,65,8,0.55)', 'rgba(230,100,30,0.3)'],
      glowColor: '#f0702080',
      accentDot: '#ff9040',
    },
  },
  {
    hour: 15, // Afternoon – rich amber
    palette: {
      gradient: ['#200800', '#4a1800', '#7a3000', '#b05010', '#e07820'],
      mountainFills: ['rgba(130,40,0,0.85)', 'rgba(175,65,10,0.55)', 'rgba(220,100,30,0.3)'],
      glowColor: '#e0782080',
      accentDot: '#f09838',
    },
  },
  {
    hour: 18, // Sunset – deep crimson-purple
    palette: {
      gradient: ['#180308', '#350a15', '#5a1528', '#882840', '#b84058'],
      mountainFills: ['rgba(80,15,25,0.85)', 'rgba(120,30,45,0.55)', 'rgba(170,55,65,0.3)'],
      glowColor: '#b8405880',
      accentDot: '#d86878',
    },
  },
  {
    hour: 20, // Dusk – purple fading to blue
    palette: {
      gradient: ['#080510', '#100a22', '#1a1540', '#282260', '#383280'],
      mountainFills: ['rgba(20,15,55,0.85)', 'rgba(30,25,80,0.55)', 'rgba(50,40,110,0.3)'],
      glowColor: '#38328080',
      accentDot: '#6060b0',
    },
  },
  {
    hour: 23, // Late night – back to deep navy (loops to midnight)
    palette: {
      gradient: ['#020510', '#060d20', '#0c1a38', '#153058', '#1e4075'],
      mountainFills: ['rgba(10,20,60,0.85)', 'rgba(15,35,90,0.55)', 'rgba(25,55,120,0.3)'],
      glowColor: '#1a3a7080',
      accentDot: '#4080c0',
    },
  },
];

function getTimePalette(hour: number): ColorPalette {
  const h = Math.max(0, Math.min(23, hour));
  const stops = TIME_PALETTE_STOPS;

  if (h <= stops[0].hour) return stops[0].palette;
  if (h >= stops[stops.length - 1].hour) return stops[stops.length - 1].palette;

  let lo = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    if (h >= stops[i].hour && h < stops[i + 1].hour) {
      lo = i;
      break;
    }
  }
  const hi = lo + 1;
  const t = (h - stops[lo].hour) / (stops[hi].hour - stops[lo].hour);
  const a = stops[lo].palette;
  const b = stops[hi].palette;

  return {
    gradient: a.gradient.map((c, idx) => blendHex(c, b.gradient[idx], t)),
    mountainFills: a.mountainFills.map((c, idx) => blendRgba(c, b.mountainFills[idx], t)),
    glowColor: blendHex(a.glowColor.slice(0, 7), b.glowColor.slice(0, 7), t) + a.glowColor.slice(7),
    accentDot: blendHex(a.accentDot, b.accentDot, t),
  };
}

// Smooth cubic interpolation through temperature points (Catmull-Rom)
function smoothInterpolate(temps: number[], t: number): number {
  const n = temps.length;
  const idx = Math.max(0, Math.min(n - 1, t * (n - 1)));
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, n - 1);
  const frac = idx - i0;
  const im1 = Math.max(0, i0 - 1);
  const i2 = Math.min(n - 1, i1 + 1);
  const p0 = temps[im1], p1 = temps[i0], p2 = temps[i1], p3 = temps[i2];
  const tt = frac, ttt = tt * tt, tttt = ttt * tt;
  return 0.5 * ((2 * p1) + (-p0 + p2) * tt + (2 * p0 - 5 * p1 + 4 * p2 - p3) * ttt + (-p0 + 3 * p1 - 3 * p2 + p3) * tttt);
}

function formatHour(h: number): string {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function cToF(c: number): number {
  return c * 9 / 5 + 32;
}

const FALLBACK_WEATHER: WeatherData = {
  city: 'New York',
  region: 'NY',
  country: 'United States',
  latitude: 40.71,
  longitude: -74.01,
  currentTemp: 22,
  feelsLike: 24,
  humidity: 55,
  windSpeed: 12,
  weatherCode: 1,
  hourlyTemps: [16, 15, 14, 13, 13, 14, 15, 17, 19, 21, 23, 25, 26, 27, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18],
  hourlyTimes: Array.from({ length: 24 }, (_, i) => `2026-02-07T${String(i).padStart(2, '0')}:00`),
  currentHour: new Date().getHours(),
};

// ─── Rotating hook line index ──
const HOOK_LINES = [
  ' I love making films.',
  ' Most people design tools. I design experiences that inspire.',
  ' I build things that move people.',
  ' I think in systems, but I create with feeling.',
  ' I turn complexity into clarity.',
];

// ─── Main Hero Component ──────────────────────────────────────
export function WeatherHero({ onDarkColorChange }: { onDarkColorChange?: (color: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const animFrameRef = useRef<number>(0);
  const lastEmittedColor = useRef<string>('');
  const onDarkColorChangeRef = useRef(onDarkColorChange);
  onDarkColorChangeRef.current = onDarkColorChange;

  // ── Load Google Fonts (Removed) ──

  // ── Rotating hook line index ──
  const [hookIndex, setHookIndex] = useState(0);
  const [hookVisible, setHookVisible] = useState(true);
  useEffect(() => {
    const INTERVAL = 5000;
    const FADE_OUT = 400; // ms before switch to fade out
    const id = setInterval(() => {
      setHookVisible(false);
      setTimeout(() => {
        setHookIndex((i) => (i + 1) % HOOK_LINES.length);
        setHookVisible(true);
      }, FADE_OUT);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Viewed hour: null means "live / current time"
  const [viewedHour, setViewedHour] = useState<number | null>(null);
  const viewedHourRef = useRef<number | null>(null);
  useEffect(() => { viewedHourRef.current = viewedHour; }, [viewedHour]);
  const [dragging, setDragging] = useState(false);

  // ── Momentum / inertia tracking ──
  const lastPointerTime = useRef(0);
  const lastPointerHour = useRef(0);
  const velocityRef = useRef(0);        // hours per second
  const momentumFrameRef = useRef(0);
  const momentumHourRef = useRef(0);     // fractional hour during coast

  const FRICTION = 0.92;                // per-frame decay (60 fps ≈ 0.92^60 ≈ 0.007 after 1s)
  const VELOCITY_THRESHOLD = 0.05;      // stop coasting below this

  // Convert a pointer clientX to a continuous hour (0–23)
  const getHourFromPointer = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pct * 23; // continuous, no snapping during drag
  }, []);

  // Stop any active momentum animation
  const stopMomentum = useCallback(() => {
    if (momentumFrameRef.current) {
      cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = 0;
    }
    velocityRef.current = 0;
  }, []);

  // Start coasting after pointer up
  const startMomentum = useCallback(() => {
    const vel = velocityRef.current;
    if (Math.abs(vel) < VELOCITY_THRESHOLD) {
      // Snap to nearest half-hour when there's no real momentum
      const cur = viewedHourRef.current;
      if (cur !== null) setViewedHour(Math.round(cur * 2) / 2);
      return;
    }
    momentumHourRef.current = viewedHourRef.current ?? 0;
    let lastT = performance.now();

    const coast = (now: number) => {
      const dt = (now - lastT) / 1000; // seconds
      lastT = now;

      velocityRef.current *= FRICTION;
      if (Math.abs(velocityRef.current) < VELOCITY_THRESHOLD) {
        // Done — snap to nearest half-hour
        const snapped = Math.round(momentumHourRef.current * 2) / 2;
        setViewedHour(Math.max(0, Math.min(23, snapped)));
        momentumFrameRef.current = 0;
        return;
      }

      momentumHourRef.current += velocityRef.current * dt;
      // Clamp and dampen at edges
      if (momentumHourRef.current <= 0) {
        momentumHourRef.current = 0;
        velocityRef.current = 0;
      } else if (momentumHourRef.current >= 23) {
        momentumHourRef.current = 23;
        velocityRef.current = 0;
      }

      setViewedHour(momentumHourRef.current);
      momentumFrameRef.current = requestAnimationFrame(coast);
    };

    momentumFrameRef.current = requestAnimationFrame(coast);
  }, []);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    stopMomentum();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const hour = getHourFromPointer(e.clientX);
    setViewedHour(hour);
    lastPointerTime.current = performance.now();
    lastPointerHour.current = hour;
    velocityRef.current = 0;
  }, [getHourFromPointer, stopMomentum]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const hour = getHourFromPointer(e.clientX);
    const now = performance.now();
    const dt = (now - lastPointerTime.current) / 1000; // seconds
    if (dt > 0.005) { // avoid division by tiny dt
      // Smooth velocity with a weighted average
      const instantVel = (hour - lastPointerHour.current) / dt;
      velocityRef.current = velocityRef.current * 0.6 + instantVel * 0.4;
      lastPointerTime.current = now;
      lastPointerHour.current = hour;
    }
    setViewedHour(hour);
  }, [dragging, getHourFromPointer]);

  const handleCanvasPointerUp = useCallback(() => {
    setDragging(false);
    startMomentum();
  }, [startMomentum]);

  const handleCanvasDoubleClick = useCallback(() => {
    stopMomentum();
    setViewedHour(null);
  }, [stopMomentum]);

  // Cleanup momentum on unmount
  useEffect(() => {
    return () => { cancelAnimationFrame(momentumFrameRef.current); };
  }, []);

  // Live clock (ticks every second for smooth updates)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch weather data
  useEffect(() => {
    let cancelled = false;
    async function fetchWeather() {
      try {
        // Hard-coded to Seattle, WA
        const lat = 47.6062;
        const lon = -122.3321;

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto&forecast_days=1`
        );
        if (!weatherRes.ok) throw new Error('Weather failed');
        const wd = await weatherRes.json();
        if (cancelled) return;

        setWeather({
          city: 'Seattle',
          region: 'WA',
          country: 'United States',
          latitude: lat,
          longitude: lon,
          currentTemp: wd.current.temperature_2m,
          feelsLike: wd.current.apparent_temperature,
          humidity: wd.current.relative_humidity_2m,
          windSpeed: wd.current.wind_speed_10m,
          weatherCode: wd.current.weather_code,
          hourlyTemps: wd.hourly.temperature_2m,
          hourlyTimes: wd.hourly.time,
          currentHour: new Date().getHours(),
        });
      } catch {
        if (!cancelled) setWeather(FALLBACK_WEATHER);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  // ─── Canvas rendering ───────────────────────────────────────
  const renderCanvas = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !weather) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(rect.width * dpr);
    const ch = Math.round(rect.height * dpr);

    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const CELL = 5;
    const rw = Math.ceil(cw / CELL);
    const rh = Math.ceil(ch / CELL);

    if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas');
    const offscreen = offscreenRef.current;
    if (offscreen.width !== rw || offscreen.height !== rh) {
      offscreen.width = rw;
      offscreen.height = rh;
    }
    const oc = offscreen.getContext('2d', { alpha: false })!;

    // ── Determine active hour (viewed vs current) ──
    const activeHour = viewedHourRef.current ?? weather.currentHour;
    const activeTemp = smoothInterpolate(weather.hourlyTemps, activeHour / 23);
    const palette = getTimePalette(activeHour);

    // ── Background gradient ──
    const bgGrad = oc.createLinearGradient(0, rh, rw, 0);
    palette.gradient.forEach((color, i) => {
      bgGrad.addColorStop(i / (palette.gradient.length - 1), color);
    });
    oc.fillStyle = bgGrad;
    oc.fillRect(0, 0, rw, rh);

    // Radial glow (subtle drift)
    const glowPhase = Math.sin(time * 0.0003) * 0.05;
    const gx = rw * (0.35 + glowPhase);
    const gy = rh * (0.55 - glowPhase * 0.5);
    const radGrad = oc.createRadialGradient(gx, gy, 0, gx, gy, rw * 0.7);
    radGrad.addColorStop(0, palette.glowColor);
    radGrad.addColorStop(0.4, palette.gradient[3] + '30');
    radGrad.addColorStop(1, 'transparent');
    oc.fillStyle = radGrad;
    oc.fillRect(0, 0, rw, rh);

    const g2x = rw * (0.75 - glowPhase);
    const g2y = rh * (0.3 + glowPhase);
    const radGrad2 = oc.createRadialGradient(g2x, g2y, 0, g2x, g2y, rw * 0.5);
    radGrad2.addColorStop(0, palette.gradient[4] + '25');
    radGrad2.addColorStop(1, 'transparent');
    oc.fillStyle = radGrad2;
    oc.fillRect(0, 0, rw, rh);

    // ── Temperature mountains ──
    const temps = weather.hourlyTemps;
    const minT = Math.min(...temps) - 3;
    const maxT = Math.max(...temps) + 3;
    const range = maxT - minT || 1;

    const getTempY = (temp: number, baseOffset = 0) => {
      const norm = (temp - minT) / range;
      return rh * 0.92 - norm * rh * 0.55 + rh * baseOffset;
    };

    for (let layer = 2; layer >= 0; layer--) {
      oc.beginPath();
      oc.moveTo(0, rh + 2);
      const offset = layer * 0.06;
      const waveAmp = (2 - layer) * 0.02;
      const waveFreq = 3 + layer * 1.5;
      const ts = time * 0.00008 * (layer + 1);

      for (let x = 0; x <= rw; x++) {
        const t = x / rw;
        let temp = smoothInterpolate(temps, t);
        temp += Math.sin(t * Math.PI * waveFreq + ts) * range * waveAmp;
        temp += Math.cos(t * Math.PI * waveFreq * 0.7 + ts * 1.3) * range * waveAmp * 0.6;
        oc.lineTo(x, getTempY(temp, offset));
      }
      oc.lineTo(rw, rh + 2);
      oc.closePath();
      oc.fillStyle = palette.mountainFills[layer];
      oc.fill();
    }

    // Temperature curve line
    oc.beginPath();
    oc.strokeStyle = palette.gradient[4] + '60';
    oc.lineWidth = 1.5;
    for (let x = 0; x <= rw; x++) {
      const t = x / rw;
      const temp = smoothInterpolate(temps, t);
      if (x === 0) oc.moveTo(x, getTempY(temp));
      else oc.lineTo(x, getTempY(temp));
    }
    oc.stroke();

    // ── "Now" marker (dim) ──
    const nowX = Math.round((weather.currentHour / 23) * rw);
    oc.strokeStyle = 'rgba(255,255,255,0.1)';
    oc.lineWidth = 1;
    oc.setLineDash([2, 3]);
    oc.beginPath();
    oc.moveTo(nowX, 0);
    oc.lineTo(nowX, rh);
    oc.stroke();
    oc.setLineDash([]);

    const nowTemp = smoothInterpolate(temps, weather.currentHour / 23);
    const nowY = getTempY(nowTemp);
    oc.fillStyle = 'rgba(255,255,255,0.4)';
    oc.beginPath();
    oc.arc(nowX, nowY, 1.5, 0, Math.PI * 2);
    oc.fill();

    // ── Active "viewed" marker (bright) ──
    const viewX = Math.round((activeHour / 23) * rw);
    const viewY = getTempY(activeTemp);

    // Vertical glow line
    oc.strokeStyle = 'rgba(255,255,255,0.22)';
    oc.lineWidth = 1;
    oc.setLineDash([2, 2]);
    oc.beginPath();
    oc.moveTo(viewX, 0);
    oc.lineTo(viewX, rh);
    oc.stroke();
    oc.setLineDash([]);

    // Bright dot
    oc.fillStyle = '#ffffff';
    oc.beginPath();
    oc.arc(viewX, viewY, 3, 0, Math.PI * 2);
    oc.fill();

    // Glow
    const dotGlow = oc.createRadialGradient(viewX, viewY, 0, viewX, viewY, 12);
    dotGlow.addColorStop(0, 'rgba(255,255,255,0.35)');
    dotGlow.addColorStop(1, 'transparent');
    oc.fillStyle = dotGlow;
    oc.fillRect(viewX - 12, viewY - 12, 24, 24);

    // ── Vignette ──
    const vigTop = oc.createLinearGradient(0, 0, 0, rh * 0.25);
    vigTop.addColorStop(0, 'rgba(0,0,0,0.5)');
    vigTop.addColorStop(1, 'rgba(0,0,0,0)');
    oc.fillStyle = vigTop;
    oc.fillRect(0, 0, rw, rh * 0.25);

    const vigBot = oc.createLinearGradient(0, rh * 0.82, 0, rh);
    vigBot.addColorStop(0, 'rgba(0,0,0,0)');
    vigBot.addColorStop(1, 'rgba(0,0,0,0.65)');
    oc.fillStyle = vigBot;
    oc.fillRect(0, rh * 0.82, rw, rh * 0.18);

    // ── Bayer ordered dithering ──
    const imageData = oc.getImageData(0, 0, rw, rh);
    const data = imageData.data;
    const LEVELS = 5;
    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const idx = (y * rw + x) * 4;
        const threshold = (BAYER8[y % 8][x % 8] / 64.0 - 0.5) * (255 / LEVELS);
        for (let c = 0; c < 3; c++) {
          const step = 255 / (LEVELS - 1);
          data[idx + c] = Math.max(0, Math.min(255, Math.round((data[idx + c] + threshold) / step) * step));
        }
      }
    }
    oc.putImageData(imageData, 0, 0);

    // ── Scale up pixelated ──
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, cw, ch);

    // ── Crosshatch overlay ──
    ctx.globalAlpha = 0.035;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    const sp = CELL * 3;
    for (let i = -ch; i < cw + ch; i += sp) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + ch, ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i + ch, 0); ctx.lineTo(i, ch); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    setCanvasReady(true);

    // Call the callback with the dark color
    if (onDarkColorChangeRef.current) {
      const color = palette.gradient[0];
      if (color !== lastEmittedColor.current) {
        onDarkColorChangeRef.current(color);
        lastEmittedColor.current = color;
      }
    }
  }, [weather]);

  // Animation loop
  useEffect(() => {
    if (!weather) return;
    let running = true;
    const animate = (t: number) => {
      if (!running) return;
      renderCanvas(t);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animFrameRef.current); };
  }, [weather, renderCanvas]);

  useEffect(() => {
    const h = () => renderCanvas(performance.now());
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [renderCanvas]);

  // ─── Derived display values ──────────────────────────────────
  const wd = weather || FALLBACK_WEATHER;
  const activeHour = viewedHour ?? wd.currentHour;
  const activeTemp = weather ? smoothInterpolate(wd.hourlyTemps, activeHour / 23) : wd.currentTemp;
  const isLive = viewedHour === null || Math.abs(viewedHour - wd.currentHour) < 0.5;
  const desc = getWeatherDescription(wd.weatherCode);

  // Compute display time: live clock when not scrubbing, scrubbed hour otherwise
  const displayTime = (() => {
    if (viewedHour === null || Math.abs(viewedHour - wd.currentHour) < 0.5) {
      // Live: use actual clock in Seattle timezone
      const seattleTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      const h = seattleTime.getHours();
      const m = seattleTime.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    } else {
      // Scrubbed: derive from the viewed hour
      const h = Math.floor(viewedHour);
      const m = Math.round((viewedHour - h) * 60);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    }
  })();



  // Derive the darkest gradient color for the current time-of-day
  const darkColor = getTimePalette(activeHour).gradient[0];

  const nameWeatherBlock = (
    <div>
      <h1
        className="text-white"
        style={{
          fontFamily: '"Domaine Display", serif',
          fontSize: 'clamp(2.8rem, 6vw, 8rem)',
          fontWeight: 700,
          lineHeight: 1.1,

        }}
      >
        CALEB
        <br />
        AGUIAR
      </h1>

      <span className="text-white mt-4 md:mt-5"> ___________</span>

      {/* Location */}
      <p
        className="text-white mt-4 md:mt-5"
        style={{
          fontFamily: '"American Grotesk", sans-serif',
          fontSize: 'clamp(14px, 2vw, 18px)',
          fontWeight: 400,
        }}
      >
        I'm Located In {wd.city}{wd.region ? `, ${wd.region}` : ''} · {displayTime}
      </p>


      {/* Weather details */}
      <p
        className="text-white mt-1.5"
        style={{
          fontFamily: '"American Grotesk", sans-serif',
          fontSize: 'clamp(13px, 1.5vw, 16px)',
          fontWeight: 300,
        }}
      >
        {desc} · {cToF(activeTemp).toFixed(0)}°F
      </p>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden select-none flex flex-col md:flex-row" style={{ backgroundColor: darkColor, transition: 'background-color 0.6s ease' }}>

      {/* ——— Left / Top black panel ——— */}
      <div
        className="w-full md:w-[28%] md:min-w-[280px] md:max-w-[700px] md:h-full flex flex-col justify-start md:justify-between p-6 md:p-10 lg:p-12 relative z-10 shrink-0"
        style={{ backgroundColor: darkColor, transition: 'background-color 0.6s ease' }}
      >
        {/* Top: Hook */}
        <div>
          <p
            className="text-white"
            style={{
              fontFamily: '"Domaine Display", serif',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.8rem)',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            I'm a designer and software engineer.

            <span
              style={{
                opacity: hookVisible ? 1 : 0,
                transition: 'opacity 0.4s ease',
                display: 'inline',
              }}
            >
              {HOOK_LINES[hookIndex]}
            </span>
          </p>
        </div>

        {/* Bottom: Name + weather (desktop only) */}
        <div className="hidden md:block">
          {nameWeatherBlock}
        </div>
      </div>

      {/* ——— Right / Bottom side: Canvas + Timeline ——— */}
      <div className="flex-1 min-h-[240px] md:min-h-0 h-full relative flex items-stretch p-3 md:p-4 lg:p-12">
        <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{
          borderRadius: '30px',
          opacity: canvasReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            style={{ imageRendering: 'pixelated' }}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            onDoubleClick={handleCanvasDoubleClick}
          />

          {/* Loading overlay */}
          {loading && !weather && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black" style={{ borderRadius: '30px' }}>
              <div className="text-white/40 font-mono" style={{ fontSize: '11px' }}>
                FETCHING WEATHER DATA...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ——— Bottom: Name + weather (mobile only, on solid black) ——— */}
      <div className="shrink-0 z-20 p-6 md:hidden" style={{ backgroundColor: darkColor, transition: 'background-color 0.6s ease' }}>
        {nameWeatherBlock}
      </div>
    </div>
  );
}