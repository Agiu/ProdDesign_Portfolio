'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown, Pause, Play } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);

  // Scroll animations
  const { scrollY } = useScroll();

  // Parallax effects
  const textY = useTransform(scrollY, [0, 500], [0, 200]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const cityY = useTransform(scrollY, [0, 500], [0, 100]);
  const indicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  // Handle initial delay for scroll indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    pausedRef.current = newState;
  };

  // ASCII Animation Loop
  useEffect(() => {
    if (!preRef.current) return;

    // Trigger fade-in animation
    setTimeout(() => setFadeIn(true), 100);

    let A = 0; // Rotation around Y axis
    let fovTime = 0; // Time variable for FOV animation
    let rippleTime = 0; // Time variable for ripple effect

    const width = 240;
    const height = 200;
    const chars = '.,-~:;=!*#$@';

    // Pre-allocate arrays to avoid GC pressure
    const bufferSize = width * height;
    const output = new Array(bufferSize);
    const zBuffer = new Float32Array(bufferSize); // Using typed array for better performance

    // Define city buildings (x, z, width, depth, height) - more spaced out city
    const buildings = [
      // Row 1 - more spacing
      { x: -6, z: -6, w: 0.7, d: 0.7, h: 4 },
      { x: -4, z: -6, w: 0.6, d: 0.6, h: 6 },
      { x: -2, z: -6, w: 0.8, d: 0.8, h: 3 },
      { x: 0, z: -6, w: 0.5, d: 0.5, h: 5 },
      { x: 2, z: -6, w: 0.7, d: 0.7, h: 7 },
      { x: 4, z: -6, w: 0.6, d: 0.6, h: 4 },
      { x: 6, z: -6, w: 0.8, d: 0.8, h: 5 },

      // Row 2
      { x: -6, z: -4, w: 0.6, d: 0.6, h: 5 },
      { x: -4, z: -4, w: 0.8, d: 0.8, h: 8 },
      { x: -2, z: -4, w: 0.5, d: 0.5, h: 4 },
      { x: 0, z: -4, w: 0.7, d: 0.7, h: 6 },
      { x: 2, z: -4, w: 0.6, d: 0.6, h: 3 },
      { x: 4, z: -4, w: 0.8, d: 0.8, h: 7 },
      { x: 6, z: -4, w: 0.5, d: 0.5, h: 5 },

      // Row 3
      { x: -6, z: -2, w: 0.7, d: 0.7, h: 6 },
      { x: -4, z: -2, w: 0.6, d: 0.6, h: 4 },
      { x: -2, z: -2, w: 0.8, d: 0.8, h: 7 },
      { x: 0, z: -2, w: 0.7, d: 0.7, h: 8 },
      { x: 2, z: -2, w: 0.5, d: 0.5, h: 5 },
      { x: 4, z: -2, w: 0.7, d: 0.7, h: 6 },
      { x: 6, z: -2, w: 0.6, d: 0.6, h: 4 },

      // Row 4 (center)
      { x: -6, z: 0, w: 0.8, d: 0.8, h: 5 },
      { x: -4, z: 0, w: 0.5, d: 0.5, h: 7 },
      { x: -2, z: 0, w: 0.7, d: 0.7, h: 4 },
      { x: 0, z: 0, w: 0.6, d: 0.6, h: 6 },
      { x: 2, z: 0, w: 0.8, d: 0.8, h: 8 },
      { x: 4, z: 0, w: 0.7, d: 0.7, h: 5 },
      { x: 6, z: 0, w: 0.5, d: 0.5, h: 3 },

      // Row 5
      { x: -6, z: 2, w: 0.6, d: 0.6, h: 7 },
      { x: -4, z: 2, w: 0.7, d: 0.7, h: 5 },
      { x: -2, z: 2, w: 0.5, d: 0.5, h: 6 },
      { x: 0, z: 2, w: 0.8, d: 0.8, h: 4 },
      { x: 2, z: 2, w: 0.6, d: 0.6, h: 7 },
      { x: 4, z: 2, w: 0.7, d: 0.7, h: 6 },
      { x: 6, z: 2, w: 0.8, d: 0.8, h: 5 },

      // Row 6
      { x: -6, z: 4, w: 0.7, d: 0.7, h: 4 },
      { x: -4, z: 4, w: 0.5, d: 0.5, h: 5 },
      { x: -2, z: 4, w: 0.8, d: 0.8, h: 8 },
      { x: 0, z: 4, w: 0.6, d: 0.6, h: 6 },
      { x: 2, z: 4, w: 0.7, d: 0.7, h: 4 },
      { x: 4, z: 4, w: 0.8, d: 0.8, h: 5 },
      { x: 6, z: 4, w: 0.5, d: 0.5, h: 7 },

      // Row 7
      { x: -6, z: 6, w: 0.6, d: 0.6, h: 6 },
      { x: -4, z: 6, w: 0.8, d: 0.8, h: 4 },
      { x: -2, z: 6, w: 0.7, d: 0.7, h: 5 },
      { x: 0, z: 6, w: 0.5, d: 0.5, h: 7 },
      { x: 2, z: 6, w: 0.6, d: 0.6, h: 6 },
      { x: 4, z: 6, w: 0.7, d: 0.7, h: 4 },
      { x: 6, z: 6, w: 0.8, d: 0.8, h: 5 },

      // Distant towers - smaller and more spread out
      { x: -8, z: 9, w: 0.4, d: 0.4, h: 3 },
      { x: -6, z: 10, w: 0.35, d: 0.35, h: 4 },
      { x: -4, z: 9.5, w: 0.3, d: 0.3, h: 3.5 },
      { x: -2, z: 10.5, w: 0.4, d: 0.4, h: 2.5 },
      { x: 0, z: 9, w: 0.35, d: 0.35, h: 3 },
      { x: 2, z: 10, w: 0.3, d: 0.3, h: 4 },
      { x: 4, z: 9.5, w: 0.4, d: 0.4, h: 2 },
      { x: 6, z: 10.5, w: 0.35, d: 0.35, h: 3.5 },
      { x: 8, z: 9, w: 0.3, d: 0.3, h: 3 },

      // Even more distant tiny towers
      { x: -10, z: 13, w: 0.25, d: 0.25, h: 2 },
      { x: -7, z: 14, w: 0.2, d: 0.2, h: 2.5 },
      { x: -3.5, z: 13.5, w: 0.25, d: 0.25, h: 1.5 },
      { x: 0, z: 14.5, w: 0.2, d: 0.2, h: 2 },
      { x: 3.5, z: 13, w: 0.25, d: 0.25, h: 2.5 },
      { x: 7, z: 14, w: 0.2, d: 0.2, h: 1.5 },
      { x: 10, z: 13.5, w: 0.25, d: 0.25, h: 2 },

      // Far horizon tiny towers
      { x: -12, z: 17, w: 0.15, d: 0.15, h: 1.5 },
      { x: -8, z: 18, w: 0.15, d: 0.15, h: 1 },
      { x: -4, z: 17.5, w: 0.15, d: 0.15, h: 1.5 },
      { x: 0, z: 18, w: 0.15, d: 0.15, h: 1 },
      { x: 4, z: 17.5, w: 0.15, d: 0.15, h: 1.5 },
      { x: 8, z: 18, w: 0.15, d: 0.15, h: 1 },
      { x: 12, z: 17, w: 0.15, d: 0.15, h: 1.5 },
    ];

    // Pyramid in the far distance
    const pyramid = { x: 0, z: 22, baseSize: 8, h: 16 };

    const animate = () => {
      // If paused, just loop without updating
      if (pausedRef.current) {
        requestAnimationFrame(animate);
        return;
      }

      // Reset pre-allocated arrays instead of creating new ones
      output.fill(' ');
      zBuffer.fill(-Infinity);

      A += 0.002; // Slow rotation

      const cosA = Math.cos(A);
      const sinA = Math.sin(A);

      // Camera tilt (70 degrees downward - 45 + 25)
      const tiltAngle = -30 * Math.PI / 180; // 70 degrees
      const cosTilt = Math.cos(tiltAngle);
      const sinTilt = Math.sin(tiltAngle);

      // FOV animation - oscillate between 2 and 40
      fovTime += 0.001; // Slow breathing effect
      const fovDivisor = 2 + (38 * (1 / (Math.sinh(fovTime)) + 1) / 2); // Oscillates from 2 to 40
      const K2 = 30; // Distance from viewer
      const K1 = width * K2 * 1.2 / fovDivisor; // Animated FOV

      // Ripple effect
      rippleTime += 0.08;

      // Render ground plane with grid
      const gridSize = 50;
      const gridSpacing = 1;
      for (let gx = -gridSize; gx <= gridSize; gx += gridSpacing) {
        for (let gz = -gridSize; gz <= gridSize; gz += gridSpacing) {
          // Draw grid lines
          const isGridLine = (Math.abs(gx % 2) < 0.1) || (Math.abs(gz % 2) < 0.1);
          if (!isGridLine) continue;

          for (let step = 0; step < gridSpacing; step += 0.2) {
            // Horizontal grid lines
            let x = gx;
            let z = gz + step;

            // Calculate ripple effect based on distance from center
            const distFromCenter = Math.sqrt(x * x + z * z);
            const rippleWave = Math.sin(distFromCenter * 0.5 - rippleTime) * 0.15;
            let y = rippleWave;

            // Rotate around Y axis, then tilt camera
            let xRot = x * cosA - z * sinA;
            let zRot = x * sinA + z * cosA;
            let yRot = y;

            // Apply camera tilt (rotate around X-axis)
            let yTilted = yRot * cosTilt - zRot * sinTilt;
            let zTilted = yRot * sinTilt + zRot * cosTilt;

            let zDepth = K2 + zTilted;
            if (zDepth > 0) {
              const ooz = 1 / zDepth;
              const xp = Math.floor(width / 2 + K1 * ooz * xRot);
              const yp = Math.floor(height / 2 - K1 * ooz * yTilted);

              if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                const idx = xp + yp * width;
                if (ooz > zBuffer[idx]) {
                  zBuffer[idx] = ooz;
                  output[idx] = chars[2]; // Dim grid
                }
              }
            }

            // Vertical grid lines
            x = gx + step;
            z = gz;

            // Calculate ripple effect for vertical lines too
            const distFromCenter2 = Math.sqrt(x * x + z * z);
            const rippleWave2 = Math.sin(distFromCenter2 * 0.5 - rippleTime) * 0.15;
            y = rippleWave2;

            xRot = x * cosA - z * sinA;
            zRot = x * sinA + z * cosA;
            yRot = y;

            // Apply camera tilt (rotate around X-axis)
            yTilted = yRot * cosTilt - zRot * sinTilt;
            zTilted = yRot * sinTilt + zRot * cosTilt;

            zDepth = K2 + zTilted;
            if (zDepth > 0) {
              const ooz = 1 / zDepth;
              const xp = Math.floor(width / 2 + K1 * ooz * xRot);
              const yp = Math.floor(height / 2 - K1 * ooz * yTilted);

              if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                const idx = xp + yp * width;
                if (ooz > zBuffer[idx]) {
                  zBuffer[idx] = ooz;
                  output[idx] = chars[2]; // Dim grid
                }
              }
            }
          }
        }
      }

      // Render each building
      buildings.forEach(building => {
        const { x: bx, z: bz, w, d, h } = building;

        // Draw building as a box
        for (let y = 0; y <= h; y += 0.2) {
          for (let x = bx - w / 2; x <= bx + w / 2; x += 0.2) {
            for (let z = bz - d / 2; z <= bz + d / 2; z += 0.2) {
              // Only render surface points
              if (!(
                Math.abs(x - (bx - w / 2)) < 0.1 ||
                Math.abs(x - (bx + w / 2)) < 0.1 ||
                Math.abs(z - (bz - d / 2)) < 0.1 ||
                Math.abs(z - (bz + d / 2)) < 0.1 ||
                Math.abs(y - h) < 0.1
              )) continue;

              // Rotate around Y axis
              const xRot = x * cosA - z * sinA;
              const zRot = x * sinA + z * cosA;
              const yRot = y - h / 2; // Center vertically

              // Apply camera tilt (rotate around X-axis)
              const yTilted = yRot * cosTilt - zRot * sinTilt;
              const zTilted = yRot * sinTilt + zRot * cosTilt;

              const zDepth = K2 + zTilted;
              if (zDepth <= 0) continue;

              const ooz = 1 / zDepth;

              // Project to 2D
              const xp = Math.floor(width / 2 + K1 * ooz * xRot);
              const yp = Math.floor(height / 2 - K1 * ooz * yTilted);

              if (xp < 0 || xp >= width || yp < 0 || yp >= height) continue;

              const idx = xp + yp * width;

              if (ooz > zBuffer[idx]) {
                zBuffer[idx] = ooz;

                // Calculate lighting based on surface normal
                let N = 0;
                if (Math.abs(x - (bx - w / 2)) < 0.1) N = -0.8; // Left face (darker shadow)
                else if (Math.abs(x - (bx + w / 2)) < 0.1) N = 0.1; // Right face (dim)
                else if (Math.abs(z - (bz - d / 2)) < 0.1) N = -0.6; // Back face (shadow)
                else if (Math.abs(z - (bz + d / 2)) < 0.1) N = 0.9; // Front face (bright highlight)
                else if (Math.abs(y - h) < 0.1) N = 1; // Top face (brightest)

                const luminance = Math.floor((N + 1) * 5.5);
                output[idx] = chars[Math.max(0, Math.min(chars.length - 1, luminance))];
              }
            }
          }
        }
      });

      // Render the pyramid
      const { x: px, z: pz, baseSize, h: ph } = pyramid;
      for (let y = 0; y <= ph; y += 0.2) {
        for (let x = px - baseSize / 2 + y / 2; x <= px + baseSize / 2 - y / 2; x += 0.2) {
          for (let z = pz - baseSize / 2 + y / 2; z <= pz + baseSize / 2 - y / 2; z += 0.2) {
            // Only render surface points
            if (!(
              Math.abs(x - (px - baseSize / 2 + y / 2)) < 0.1 ||
              Math.abs(x - (px + baseSize / 2 - y / 2)) < 0.1 ||
              Math.abs(z - (pz - baseSize / 2 + y / 2)) < 0.1 ||
              Math.abs(z - (pz + baseSize / 2 - y / 2)) < 0.1 ||
              Math.abs(y - ph) < 0.1
            )) continue;

            // Rotate around Y axis
            const xRot = x * cosA - z * sinA;
            const zRot = x * sinA + z * cosA;
            const yRot = y - ph / 2; // Center vertically

            // Apply camera tilt (rotate around X-axis)
            const yTilted = yRot * cosTilt - zRot * sinTilt;
            const zTilted = yRot * sinTilt + zRot * cosTilt;

            const zDepth = K2 + zTilted;
            if (zDepth <= 0) continue;

            const ooz = 1 / zDepth;

            // Project to 2D
            const xp = Math.floor(width / 2 + K1 * ooz * xRot);
            const yp = Math.floor(height / 2 - K1 * ooz * yTilted);

            if (xp < 0 || xp >= width || yp < 0 || yp >= height) continue;

            const idx = xp + yp * width;

            if (ooz > zBuffer[idx]) {
              zBuffer[idx] = ooz;

              // Calculate lighting based on surface normal
              let N = 0;
              if (Math.abs(x - (px - baseSize / 2 + y / 2)) < 0.1) N = -0.8; // Left face (darker shadow)
              else if (Math.abs(x - (px + baseSize / 2 - y / 2)) < 0.1) N = 0.1; // Right face (dim)
              else if (Math.abs(z - (pz - baseSize / 2 + y / 2)) < 0.1) N = -0.6; // Back face (shadow)
              else if (Math.abs(z - (pz + baseSize / 2 - y / 2)) < 0.1) N = 0.9; // Front face (bright highlight)
              else if (Math.abs(y - ph) < 0.1) N = 1; // Top face (brightest)

              const luminance = Math.floor((N + 1) * 5.5);
              output[idx] = chars[Math.max(0, Math.min(chars.length - 1, luminance))];
            }
          }
        }
      }

      // Convert to string with line breaks
      let result = '';
      for (let i = 0; i < height; i++) {
        result += output.slice(i * width, (i + 1) * width).join('') + '\n';
      }

      if (preRef.current) {
        preRef.current.textContent = result;
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleScrollClick = () => {
    // Scroll to the next section (About)
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[1308px] h-screen min-h-[600px] mx-auto overflow-hidden bg-[#1a1f28]" data-name="Hero">

      {/* Rotating ASCII City - Added Parallax */}
      <motion.div style={{ y: cityY }} className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <pre
          ref={preRef}
          className={`text-[6px] md:text-[10px] leading-[0.7] font-mono whitespace-pre pointer-events-none select-none z-[1] transition-opacity duration-3000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
          style={{ color: '#4a5a6a' }}
        />
      </motion.div>

      {/* Text Elements - Added Parallax & Fade Out */}
      <motion.div
        className="absolute top-[40px] md:top-[48px] left-6 md:left-[48px] z-[15]"
        style={{ y: textY, opacity: textOpacity }}
      >
        <motion.p
          className="font-['Greycliff_CF:Light',sans-serif] leading-[1.32] not-italic text-[#ecf1f8] text-3xl md:text-[48px] whitespace-pre"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span>{`Hey! `}</span>
          <span className="font-['Greycliff_CF:Regular',sans-serif]">I'm</span>
          <span className="font-['Greycliff_CF:Extra_Bold',sans-serif]">{` Caleb Aguiar`}</span>
        </motion.p>

        <motion.div
          className="mt-4 md:mt-0 font-['Greycliff_CF:Regular',sans-serif] leading-[1.32] not-italic text-[#ecf1f8] text-lg md:text-[24px] text-left whitespace-nowrap whitespace-pre"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5, ease: 'easeOut' }}
        >
          <p className="mb-0">{`Most people design tools. `}</p>
          <p>I design experiences that inspire.</p>
        </motion.div>
      </motion.div>

      {/* Animation Control Button - Accessibility Feature */}
      <button
        onClick={togglePause}
        className="absolute bottom-6 right-6 z-[20] p-2 rounded-full border border-[#4a5a6a] text-[#4a5a6a] hover:text-[#ecf1f8] hover:border-[#ecf1f8] hover:bg-[#1a1f28]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#ecf1f8]/50"
        aria-label={isPaused ? "Resume animation" : "Pause animation"}
      >
        {isPaused ? <Play size={16} /> : <Pause size={16} />}
      </button>

      {/* Scroll indicator - Added Click Handler & Scroll Fade */}
      <motion.div
        className="fixed left-1/2 -translate-x-1/2 bottom-[40px] flex flex-col items-center gap-2 z-[1] cursor-pointer w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollIndicator ? 1 : 0 }}
        style={{ opacity: indicatorOpacity }}
        transition={{ duration: 1, ease: 'easeOut' }}
        onClick={handleScrollClick}
      >
        <span className="font-['Greycliff_CF:Regular',sans-serif] text-[#ecf1f8] text-[16px]">
          Scroll to explore
        </span>
        <motion.div
          animate={{
            y: [0, 8, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <ChevronDown className="text-[#ecf1f8]" size={32} />
        </motion.div>
      </motion.div>
    </div>
  );
}