import React from 'react';

export default function WIPSection() {
  return (
    <section id="about" className="w-full bg-[#ecf1f8] py-24 px-4 md:px-12 relative z-10">
      {/* ASCII Corner Decorations - Top ones remain absolute */}
      <div className="absolute top-12 left-4 md:left-12 font-mono text-[#4a5a6a] text-[12px] leading-none hidden md:block">
        ┌─────────────────────<br/>
        │ SYSTEM_STATUS<br/>
        │ X: 0000 Y: 1326
      </div>
      <div className="absolute top-12 right-4 md:right-12 font-mono text-[#4a5a6a] text-[12px] leading-none text-right hidden md:block">
        ─────────────────────┐<br/>
        WIP.tsx &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
        [PENDING] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
      </div>
      
      <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-4xl md:text-[64px] text-[#1a1f28] mb-4 relative mt-12 md:mt-0">
        <span className="font-mono text-[14px] text-[#4a5a6a] absolute -left-20 top-8 hidden md:block">404</span>
        WIP
      </h2>
      
      {/* Dimension line */}
      <div className="font-mono text-[10px] text-[#4a5a6a] mb-8 flex items-center gap-2">
        <span>├──────</span>
        <span className="bg-[#ccd3de] px-2 py-1">CONSTRUCTION_ZONE</span>
        <span>──────┤</span>
      </div>
      
      {/* Main Content - Removed timeline border and circles */}
      <div className="font-['Greycliff_CF:Regular',sans-serif] text-[#1a1f28] space-y-6">
        
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[#4a5a6a] font-mono">
                <span>STATUS</span>
                <span className="w-16 h-[1px] bg-[#ccd3de]"></span>
                <span className="text-[#1a1f28] bg-[#ccd3de] px-2 py-0.5">PENDING_IMPLEMENTATION</span>
            </div>
            
            <p className="text-xl md:text-2xl max-w-2xl leading-relaxed">
                This website is currently undergoing reconstruction. Content population is scheduled for the next deployment cycle.
            </p>
        </div>
        
        {/* Technical Progress Box */}
        <div className="p-6 bg-[#f4f6f8] border border-[#ccd3de] max-w-md font-mono text-sm mt-8">
            <div className="flex justify-between mb-2">
                <span className="font-bold">COMPLETION</span>
                <span className="font-bold">70%</span>
            </div>
            <div className="w-full h-2 bg-[#ccd3de] mb-4">
                <div className="h-full w-[70%] bg-[#1a1f28]"></div>
            </div>
            <div className="space-y-1 text-[#4a5a6a] text-xs">
                <div className="flex gap-2">
                    <span>[ ]</span> <span>Case_Studies</span>
                </div>
                <div className="flex gap-2">
                    <span>[X]</span> <span>Layout_Structure</span>
                </div>
                <div className="flex gap-2">
                    <span>[X]</span> <span>Navigation_Logic</span>
                </div>
                <div className="flex gap-2">
                    <span>[X]</span> <span>Shader</span>
                </div>
                <div className="flex gap-2">
                    <span>[ ]</span> <span>Asset_Optimization</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* Bottom Layout - Converted to Flexbox to sit naturally below content */}
      <div className="w-full flex justify-between items-end mt-16 hidden md:flex font-mono text-[#4a5a6a] text-[10px] md:text-[12px]">
          <div className="leading-none text-left">
            └─────────────────────<br/>
            &nbsp;&nbsp;WAITING_FOR_INPUT
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-right">
            <div>ERRORS: <span className="text-[#1a1f28]">0</span></div>
            <div>WARN: <span className="text-[#1a1f28]">1</span></div>
            <div>PING: <span className="text-[#1a1f28]">24ms</span></div>
          </div>
      </div>
    </section>
  );
}