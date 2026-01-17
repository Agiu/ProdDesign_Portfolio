'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useEffect, useState } from 'react';

interface AsciiLayer {
  chars: string;
  color: string;
}

export default function AsciiArtParallax({ imageUrl }: { imageUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<{
    sky: AsciiLayer;
    mountains: AsciiLayer;
    land: AsciiLayer;
  } | null>(null);

  const { scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Different parallax speeds for each layer
  const ySky = useTransform(scrollY, [0, 1000], [0, 100]);
  const yMountains = useTransform(scrollY, [0, 1000], [0, 300]);
  const yLand = useTransform(scrollY, [0, 1000], [0, 500]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size
      const targetWidth = 160; // ASCII art width in characters
      const targetHeight = 120; // ASCII art height in characters
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const pixels = imageData.data;

      // ASCII characters from dense to light
      const asciiChars = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.', ' '];

      // Function to convert RGB to luminance
      const getLuminance = (r: number, g: number, b: number) => {
        return 0.299 * r + 0.587 * g + 0.114 * b;
      };

      // Function to get blue shade based on luminance
      const getBlueShade = (luminance: number): string => {
        // Map luminance (0-255) to blue shades
        if (luminance > 200) return '#8a9aaa'; // Very light blue
        if (luminance > 150) return '#6a7a8a'; // Light blue
        if (luminance > 100) return '#4a5a6a'; // Medium blue
        if (luminance > 50) return '#3a4a5a'; // Dark blue
        return '#2a3a4a'; // Very dark blue
      };

      // Function to get ASCII char based on luminance
      const getAsciiChar = (luminance: number): string => {
        const index = Math.floor((luminance / 255) * (asciiChars.length - 1));
        return asciiChars[asciiChars.length - 1 - index];
      };

      // Divide image into three regions
      const skyHeight = Math.floor(targetHeight * 0.25); // Top 25% is sky
      const mountainHeight = Math.floor(targetHeight * 0.45); // Next 45% is mountains
      const landHeight = targetHeight - skyHeight - mountainHeight; // Bottom 30% is land

      let skyAscii = '';
      let mountainAscii = '';
      let landAscii = '';

      // Process pixels and build ASCII art for each layer
      for (let y = 0; y < targetHeight; y++) {
        let line = '';
        for (let x = 0; x < targetWidth; x++) {
          const idx = (y * targetWidth + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const luminance = getLuminance(r, g, b);
          
          line += getAsciiChar(luminance);
        }
        
        if (y < skyHeight) {
          skyAscii += line + '\n';
        } else if (y < skyHeight + mountainHeight) {
          mountainAscii += line + '\n';
        } else {
          landAscii += line + '\n';
        }
      }

      // Calculate average luminance for each layer to assign color
      const getAverageLuminance = (ascii: string, startY: number, height: number) => {
        let total = 0;
        let count = 0;
        for (let y = startY; y < startY + height; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            total += getLuminance(r, g, b);
            count++;
          }
        }
        return total / count;
      };

      const skyLuminance = getAverageLuminance('', 0, skyHeight);
      const mountainLuminance = getAverageLuminance('', skyHeight, mountainHeight);
      const landLuminance = getAverageLuminance('', skyHeight + mountainHeight, landHeight);

      setLayers({
        sky: {
          chars: skyAscii,
          color: getBlueShade(skyLuminance)
        },
        mountains: {
          chars: mountainAscii,
          color: getBlueShade(mountainLuminance)
        },
        land: {
          chars: landAscii,
          color: getBlueShade(landLuminance)
        }
      });
    };

    img.src = imageUrl;
  }, [imageUrl]);

  if (!layers) {
    return (
      <div ref={containerRef} className="relative w-[1308px] h-[1326px] mx-auto overflow-hidden">
        <div className="absolute bg-[#1a1f28] h-[1326px] left-0 top-0 w-[1308px]" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Processing ASCII art...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-[1308px] h-[1326px] mx-auto overflow-hidden">
      <div className="absolute bg-[#1a1f28] h-[1326px] left-0 top-0 w-[1308px]" />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Sky Layer - slowest parallax */}
      <motion.pre
        style={{ y: ySky }}
        className="absolute left-1/2 -translate-x-1/2 top-[100px] text-[5px] leading-[0.5] font-mono whitespace-pre pointer-events-none select-none z-[1]"
        dangerouslySetInnerHTML={{ __html: layers.sky.chars }}
        style={{
          y: ySky,
          color: layers.sky.color
        }}
      />

      {/* Mountains Layer - medium parallax */}
      <motion.pre
        style={{ y: yMountains }}
        className="absolute left-1/2 -translate-x-1/2 top-[400px] text-[5px] leading-[0.5] font-mono whitespace-pre pointer-events-none select-none z-[2]"
        dangerouslySetInnerHTML={{ __html: layers.mountains.chars }}
        style={{
          y: yMountains,
          color: layers.mountains.color
        }}
      />

      {/* Land Layer - fastest parallax */}
      <motion.pre
        style={{ y: yLand }}
        className="absolute left-1/2 -translate-x-1/2 top-[700px] text-[5px] leading-[0.5] font-mono whitespace-pre pointer-events-none select-none z-[3]"
        dangerouslySetInnerHTML={{ __html: layers.land.chars }}
        style={{
          y: yLand,
          color: layers.land.color
        }}
      />
    </div>
  );
}
