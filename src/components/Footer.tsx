import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    // Initial set
    setTime(new Date().toLocaleTimeString());

    // Update every second
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-[#1a1f28] border-[#4a5a6a] relative z-20 text-[#ecf1f8]">
      <div className="w-full max-w-[1308px] mx-auto p-8 md:p-12 relative">
        {/* Background grid */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #ecf1f8 0px, #ecf1f8 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #ecf1f8 0px, #ecf1f8 1px, transparent 1px, transparent 19px)",
          }}
        />

        {/* ASCII decorations */}
        <div className="absolute top-6 left-6 font-mono text-[#4a5a6a] text-[10px] leading-none hidden md:block">
          ┌─ CONTACT_PROTOCOL ─┐
        </div>
        <div className="absolute top-6 right-6 font-mono text-[#4a5a6a] text-[10px] leading-none text-right hidden md:block">
          SECURE_CONNECTION: ESTABLISHED
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
          {/* Left Column: Bio & Status */}
          <div className="space-y-8">
            <div>
              <h3 className="font-['Greycliff_CF:Bold',sans-serif] text-3xl md:text-4xl mb-4">
                Come back someday to see more content
              </h3>
              <p className="text-[#ccd3de] font-['Greycliff_CF:Regular',sans-serif] text-lg max-w-md leading-relaxed">
                Don't hesitate to contact me if you have a
                project that needs re-working or a 0 to 1
                design.
              </p>
            </div>

            {/* Current Job Status */}
            <div className="inline-flex flex-col gap-2">
              <div className="border border-[#4a5a6a] bg-[#151921] p-4 min-w-[280px]">
                <div className="font-mono text-[10px] text-[#4a5a6a] mb-2">
                  WHAT I'M DOING RN:
                </div>
                <div className="font-['Greycliff_CF:Bold',sans-serif] text-lg text-white mb-1">
                  Masters Student
                </div>
                <div className="font-['Greycliff_CF:Regular',sans-serif] text-[#ccd3de] text-sm">
                  @ UW MHCI+D
                </div>

                <div className="w-full h-[1px] bg-[#2a3340] my-3"></div>

                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-[#4a5a6a]">
                    AVAILABILITY:
                  </span>
                  <div className="text-green-400 font-mono text-[10px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Available for Freelance
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Links */}
          <div className="flex flex-col md:items-end justify-between gap-8">
            <div className="grid grid-cols-2 gap-12 md:text-right">
              {/* Socials */}
              <div className="flex flex-col gap-4">
                <div className="font-mono text-[#4a5a6a] text-[10px] mb-2">
                  [NETWORKS]
                </div>
                <a
                  className="group flex cursor-pointer items-center md:justify-end gap-2 text-[#ccd3de] hover:text-white transition-colors"
                  onClick={() => window.open('https://www.linkedin.com/in/kaelub/', '_blank')}
                >
                  <span className="font-['Greycliff_CF:Regular',sans-serif]">
                    LinkedIn
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-[#4a5a6a] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-[#2a3340] flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] text-[#4a5a6a]">
          <div className="flex items-center gap-2">
            <span>© 2026 CALEB AGUIAR</span>
            <span className="text-[#2a3340]">|</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              BUILD_VER: v2.4.0-rc
            </div>
            <div className="flex items-center gap-2">
              <span>
                SYS_TIME:{" "}
                <span className="text-[#ccd3de]">{time}</span>
              </span>
              <span className="text-green-500 animate-pulse">
                █
              </span>
            </div>
          </div>
        </div>

        {/* Corner ASCII */}
        <div className="absolute bottom-6 right-6 font-mono text-[#4a5a6a] text-[10px] leading-none text-right hidden md:block">
          └─ END_OF_FILE ─┘
        </div>
      </div>
    </footer>
  );
}