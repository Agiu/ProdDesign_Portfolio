import React from 'react';

export default function ExperimentsPage() {
  return (
    <div className="w-[1308px] mx-auto min-h-screen bg-white py-24 px-12 relative">
      {/* ASCII pattern decoration */}
      <div className="absolute top-12 left-0 font-mono text-[8px] text-[#ccd3de] leading-none whitespace-pre">
        {`::::::::::::::::::::::::::::::
..........................
::::::::::::::::::::::::::::::
..........................`}
      </div>
      
      {/* ASCII Corner Decorations */}
      <div className="absolute top-12 left-12 font-mono text-[#4a5a6a] text-[12px] leading-none">
        ┏━━━━━━━━━━━━━━━━━━━━━<br/>
        ┃ SECTION_03<br/>
        ┃ MODE: EXPERIMENTAL
      </div>
      <div className="absolute top-12 right-12 font-mono text-[#4a5a6a] text-[12px] leading-none text-right">
        ━━━━━━━━━━━━━━━━━━━━━┓<br/>
        EXPERIMENTS.tsx &nbsp;┃<br/>
        [VOLATILE] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┃
      </div>
      
      <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-[64px] text-[#1a1f28] mb-4 relative">
        <span className="font-mono text-[14px] text-[#4a5a6a] absolute -left-20 top-8">003</span>
        Experiments
      </h2>
      
      {/* Terminal-style prompt */}
      <div className="font-mono text-[12px] text-[#4a5a6a] mb-8 bg-[#1a1f28] text-[#ecf1f8] p-3 rounded">
        <span className="text-green-400">user@portfolio</span>
        <span>:</span>
        <span className="text-blue-400">~/experiments</span>
        <span>$ ls -la</span>
      </div>
      
      <div className="font-['Greycliff_CF:Regular',sans-serif] text-[24px] text-[#1a1f28] leading-relaxed space-y-6">
        <p className="relative pl-8">
          <span className="font-mono text-[14px] text-[#4a5a6a] absolute left-0 top-1">→</span>
          A collection of creative explorations, prototypes, and experimental projects 
          where I push the boundaries of what's possible.
        </p>
        
        <div className="grid grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((exp) => (
            <div key={exp} className="relative">
              {/* Measurement annotations */}
              <div className="font-mono text-[8px] text-[#4a5a6a] mb-1 flex justify-between">
                <span>├─ W: 100% ─┤</span>
                <span>#{exp}</span>
              </div>
              
              <div className="aspect-square bg-[#1a1f28] rounded-lg flex flex-col items-center justify-center relative overflow-hidden group">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'repeating-linear-gradient(0deg, #ecf1f8 0px, #ecf1f8 1px, transparent 1px, transparent 10px), repeating-linear-gradient(90deg, #ecf1f8 0px, #ecf1f8 1px, transparent 1px, transparent 10px)' }}>
                </div>
                
                {/* ASCII art decoration */}
                <div className="font-mono text-[10px] text-[#4a5a6a] absolute top-2 left-2 leading-none">
                  ┌──┐<br/>
                  │ &nbsp;│<br/>
                  └──┘
                </div>
                
                <span className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#ecf1f8] relative z-10">
                  {exp}
                </span>
                
                {/* Binary decoration */}
                <div className="font-mono text-[8px] text-[#4a5a6a] mt-2">
                  {exp.toString(2).padStart(8, '0')}
                </div>
              </div>
              
              {/* Height indicator */}
              <div className="font-mono text-[8px] text-[#4a5a6a] mt-1 flex items-center gap-1">
                <span className="rotate-90">├</span>
                <span>H: 1:1</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ASCII Bottom decoration */}
      <div className="absolute bottom-12 left-12 font-mono text-[#4a5a6a] text-[12px] leading-none">
        ┗━━━━━━━━━━━━━━━━━━━━━<br/>
        &nbsp;&nbsp;PROCESS.exit(0)
      </div>
      
      {/* System info */}
      <div className="absolute bottom-12 right-12 font-mono text-[#4a5a6a] text-[10px] leading-relaxed text-right">
        RUNTIME: 00:00:42.337<br/>
        MEMORY: 127.8MB<br/>
        CPU: 2.4%
      </div>
    </div>
  );
}