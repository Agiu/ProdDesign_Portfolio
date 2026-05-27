import { useEffect, useRef } from 'react';
import { getBrightAccent } from './case-studies';

/* ── Subtle dither dot canvas ── */
function DitherDots({ color = 'rgba(255,255,255,0.06)' }: { color?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = 300;
        const h = 300;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const spacing = 10;
        for (let x = 0; x < w; x += spacing) {
            for (let y = 0; y < h; y += spacing) {
                const noise = Math.random();
                if (noise > 0.5) {
                    const r = noise * 1.8;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
            }
        }
    }, [color]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute"
            style={{ width: 300, height: 300, opacity: 0.7 }}
        />
    );
}

/* ── Horizontal dither line ──  */
function DitherLine() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = 800;
        const h = 4;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        for (let x = 0; x < w; x += 2) {
            const on = Math.random() > 0.3;
            if (on) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12 + 0.03})`;
                ctx.fillRect(x, 0, 1, h);
            }
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-[2px] opacity-60"
            style={{ imageRendering: 'pixelated' }}
        />
    );
}

interface FooterProps {
    darkColor?: string;
}

export function Footer({ darkColor = '#020510' }: FooterProps) {
    const year = new Date().getFullYear();
    const brightAccent = getBrightAccent(darkColor);

    return (
        <footer
            className="relative w-full"
        >
            {/* Top Border Deco */}
            <div className="absolute top-0 left-0 w-full z-20 flex flex-col items-center pointer-events-none"
                style={{ color: brightAccent, transition: 'color 0.6s ease' }}>
                {/* Asterisk Cross & Horizontal Line */}
                <div className="relative w-full flex justify-center mt-[-22px]">
                    <div className="absolute top-1/2 left-6 right-6 md:left-10 md:right-4 lg:left-12 lg:right-12 bg-current z-[-1]"
                        style={{ height: '2.5px', marginTop: '-1.25px' }}></div>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="6" y1="6" x2="38" y2="38"></line>
                        <line x1="38" y1="6" x2="6" y2="38"></line>
                    </svg>
                </div>
            </div>

            <div className="relative w-full h-full flex flex-col justify-between px-6 py-12 md:pl-10 md:pr-4 lg:px-12 lg:py-16 overflow-hidden">

                {/* Dither dot decorations inside the container */}
                <div className="absolute top-0 right-0 opacity-40 pointer-events-none">
                    <DitherDots />
                </div>
                <div className="absolute bottom-0 left-0 opacity-30 pointer-events-none -rotate-45">
                    <DitherDots color="rgba(255,255,255,0.04)" />
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10">
                    {/* Left: name + tagline */}
                    <div>
                        <h2
                            style={{
                                fontFamily: '"Domaine Text", serif', letterSpacing: 'normal',
                                fontSize: 'clamp(2rem, 5vw, 4rem)',
                                fontWeight: 700,
                                lineHeight: 1.0,
                                color: brightAccent
                            }}
                        >
                            CA.
                        </h2>
                        <p
                            className="mt-4"
                            style={{
                                fontFamily: '"American Grotesk", sans-serif',
                                fontSize: 'clamp(14px, 1.5vw, 16px)',
                                fontWeight: 400,
                                color: brightAccent
                            }}
                        >
                            Product Designer · Seattle, WA
                        </p>
                    </div>

                    {/* Right: links */}
                    <div className="flex flex-col gap-3 md:items-end mt-2">
                        {[
                            { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/kaelub/' },
                            { label: 'GITHUB', href: 'https://github.com/Agiu' },
                            { label: 'EMAIL', href: 'mailto:kaelub.tech@gmail.com' },
                        ].map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="group transition-colors text-[color:var(--accent)] hover:text-white inline-block"
                                style={{
                                    fontFamily: '"American Grotesk", sans-serif',
                                    fontSize: 'clamp(14px, 1.4vw, 16px)',
                                    fontWeight: 400,
                                    textTransform: 'uppercase' as const,
                                    '--accent': brightAccent
                                } as React.CSSProperties}
                            >
                                <span className="border-b border-current pb-0.5 transition-colors">{label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 md:mt-24">

                    <div className="mt-4 flex flex-col md:flex-row md:justify-between gap-2">
                        <p
                            className="text-white/40"
                            style={{
                                fontFamily: '"American Grotesk", sans-serif',
                                fontSize: '0.75rem',
                            }}
                        >
                            © {year} Caleb Aguiar. All rights reserved.
                        </p>
                        <p
                            className="text-white/40"
                            style={{
                                fontFamily: '"American Grotesk", sans-serif',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase' as const,
                            }}
                        >
                            Designed & built By Caleb :3
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
