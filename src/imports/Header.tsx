import svgPaths from "./svg-9sjrqepq8i";
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
    activePage: string;
    onPageChange: (page: string) => void;
}

function Group() {
    return (
        <div className="absolute inset-[18.75%_16.67%]" data-name="Group">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.6667 21.25">
                <g id="Group">
                    <path clipRule="evenodd" d={svgPaths.p2bcd1400} fill="var(--fill-0, #1A1F28)" fillRule="evenodd" id="Vector" />
                    <path d={svgPaths.p3e194600} fill="var(--fill-0, #1A1F28)" id="Vector_2" />
                </g>
            </svg>
        </div>
    );
}

function FlowbiteLinkedinSolid({ className }: { className?: string }) {
    return (
        <div
            className={`${className} cursor-pointer hover:opacity-70 transition-opacity`}
            data-name="flowbite:linkedin-solid"
            onClick={() => window.open('https://www.linkedin.com/in/kaelub/', '_blank')}
        >
            <Group />
        </div>
    );
}

export default function Header({ activePage, onPageChange }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const pages = [
        { name: 'About', href: '#about' }
    ];

    return (
        <div className="relative w-full max-w-[1308px] mx-auto h-[62px]" data-name="Header">
            {/* Background */}
            <div className="absolute bg-[#ecf1f8] h-[62px] left-0 top-0 w-full" />

            <motion.div
                className="relative h-full flex items-center justify-between px-4 md:px-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
            >
                {/* Logo */}
                <div
                    className="relative z-10 md:w-[94px] h-full flex justify-center items-center cursor-pointer group"
                    onClick={() => {
                        onPageChange('Home');
                        setIsMobileMenuOpen(false);
                    }}
                >
                    <p className="font-['Greycliff_CF:Bold',sans-serif] text-[#1a1f28] text-[36px] leading-[1.32] group-hover:opacity-70 transition-opacity">
                        CA
                    </p>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex absolute left-[111px] items-center gap-[33px] h-full">
                    {pages.map((page) => (
                        <div
                            key={page.name}
                            className="relative h-full flex items-center justify-center min-w-[94px] cursor-pointer group"
                            onClick={() => onPageChange(page.name)}
                        >
                            <p className="relative z-10 font-['Greycliff_CF:Regular',sans-serif] text-[#1a1f28] text-[20px] group-hover:opacity-70 transition-opacity px-2">
                                {page.name}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Desktop LinkedIn */}
                <div className="hidden md:block absolute right-[20px] top-[14px]">
                    <FlowbiteLinkedinSolid className="h-[34px] w-[34px]" />
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-[#1a1f28] z-20"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </motion.div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-[62px] left-0 w-full bg-[#ecf1f8] border-b border-[#ccd3de] shadow-lg z-50 md:hidden flex flex-col p-4 gap-4"
                    >
                        {pages.map((page) => (
                            <div
                                key={page.name}
                                className={`py-3 px-4 text-center font-['Greycliff_CF:Regular',sans-serif] text-lg ${activePage === page.name ? 'bg-[#ccd3de] font-bold' : ''
                                    }`}
                                onClick={() => {
                                    onPageChange(page.name);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {page.name}
                            </div>
                        ))}
                        <div className="flex justify-center pt-2 border-t border-[#ccd3de] mt-2">
                            <FlowbiteLinkedinSolid className="h-[34px] w-[34px] relative" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}