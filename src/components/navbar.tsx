"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-white/85 backdrop-blur-2xl border-b border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                : "bg-transparent"
                }`}
        >
            <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-primary transition-transform duration-300 group-hover:scale-105">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white">
                            <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
                            <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
                            <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
                            <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.25" />
                        </svg>
                    </div>
                    <span className="text-[16px] font-bold tracking-[-0.02em]">
                        <span className="text-foreground">Studio</span>
                        <span className="text-primary">Shot</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {["How It Works", "Features", "Pricing"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                            className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground/80 transition-all duration-200 hover:text-foreground hover:bg-black/[0.03]"
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center md:flex">
                    <Button
                        variant="default"
                        className="rounded-full px-5 text-[13px] font-semibold h-[34px] shadow-none"
                    >
                        Try Free
                    </Button>
                </div>

                <button
                    className="md:hidden p-2 rounded-lg hover:bg-black/[0.03] transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-black/[0.04] px-6 pb-5 pt-1">
                    <nav className="flex flex-col gap-1">
                        {["How It Works", "Features", "Pricing"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:bg-black/[0.03] transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <Button
                            variant="default"
                            className="rounded-full text-[13px] font-semibold mt-2 w-full h-10"
                        >
                            Try Free
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}
