import { useEffect, useRef } from 'react';

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

    return (
        <footer
            className="relative w-full overflow-hidden"
            style={{
                backgroundColor: darkColor,
                transition: 'background-color 0.6s ease',
            }}
        >
            <div className="relative w-full h-full flex flex-col justify-between px-6 py-12 md:pl-10 md:pr-4 lg:px-12 lg:py-16">

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
                            className="text-white"
                            style={{
                                fontFamily: '"Domaine Display", serif',
                                fontSize: 'clamp(2rem, 5vw, 4rem)',
                                fontWeight: 700,
                                lineHeight: 1.0,
                            }}
                        >
                            CA.
                        </h2>
                        <p
                            className="mt-4 text-white"
                            style={{
                                fontFamily: '"American Grotesk", sans-serif',
                                fontSize: 'clamp(14px, 1.5vw, 16px)',
                                fontWeight: 400,
                            }}
                        >
                            Product Designer · Looking For Work · Seattle, WA
                        </p>
                    </div>

                    {/* Right: links */}
                    <div className="flex flex-col gap-3 md:items-end mt-2">
                        {[
                            { label: 'LinkedIn', href: '#' },
                            { label: 'GitHub', href: '#' },
                            { label: 'Email', href: 'mailto:hello@calebaguiar.com' },
                        ].map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="text-white hover:text-white transition-colors"
                                style={{
                                    fontFamily: '"American Grotesk", sans-serif',
                                    fontSize: 'clamp(14px, 1.4vw, 16px)',
                                    fontWeight: 400,
                                    textTransform: 'lowercase' as const,
                                }}
                            >
                                {label}
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
                            Designed & built alongside Claude
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
