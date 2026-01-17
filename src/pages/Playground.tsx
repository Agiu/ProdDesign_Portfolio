'use client';

import { motion } from 'motion/react';

export default function Playground() {
    return (
        <div className="relative w-full max-w-[1308px] h-screen min-h-[600px] mx-auto overflow-hidden bg-[#1a1f28]" data-name="Playground">

            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f28] via-[#252b36] to-[#1a1f28]" />

            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(74, 90, 106, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(74, 90, 106, 0.3) 1px, transparent 1px)
            `,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 md:px-12">

                {/* Title */}
                <motion.h1
                    className="font-['Greycliff_CF:Bold',sans-serif] text-[#ecf1f8] text-4xl md:text-6xl lg:text-7xl text-center mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    Playground
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="font-['Greycliff_CF:Regular',sans-serif] text-[#4a5a6a] text-lg md:text-xl lg:text-2xl text-center max-w-2xl mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                >
                    Experiments, prototypes, and creative explorations
                </motion.p>

                {/* Placeholder cards grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                >
                    {[1, 2, 3].map((item) => (
                        <motion.div
                            key={item}
                            className="relative group cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="aspect-video rounded-xl bg-gradient-to-br from-[#2a3140] to-[#1f2530] border border-[#3a4555] overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-['Greycliff_CF:Regular',sans-serif] text-[#4a5a6a] text-sm">
                                        Coming Soon
                                    </span>
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f28]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <p className="mt-3 font-['Greycliff_CF:Regular',sans-serif] text-[#ecf1f8] text-sm text-center">
                                Experiment {item}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[#3a4555] opacity-50" />
            <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[#3a4555] opacity-50" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[#3a4555] opacity-50" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[#3a4555] opacity-50" />

        </div>
    );
}
