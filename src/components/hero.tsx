"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

import { ArrowRight, ArrowLeft, TrendingUp } from "lucide-react";

const platforms = [
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    name: "Shopify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg",
  },
  {
    name: "Zepto",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Zepto_Logo.svg",
  },
  {
    name: "Etsy",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg",
  },
  {
    name: "eBay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg",
  },
  {
    name: "Flipkart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Flipkart_Logo_as_of_2025.png",
  },
  {
    name: "Meesho",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Meesho_Logo_Full.png",
  },
];

const stats = [
  { value: "2.4s", label: "Avg. processing" },
  { value: "98%", label: "Background accuracy" },
  { value: "40k+", label: "Photos processed" },
];

export function Hero() {
  const scrollRef = useRef<HTMLDivElement>(null);


  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      {/* Subtle radial gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Revenue insight */}
        <div className="mb-6 flex items-center justify-center gap-2 animate-fade-in-up delay-350">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/5 px-4 py-2 shadow-sm">
            <TrendingUp className="size-4 text-primary" />
            <span className="text-[12px] font-medium text-foreground">
              Professional images increase sales by{" "}
              <span className="text-primary font-bold">38%</span> and revenue by{" "}
              <span className="text-primary font-bold">24%</span>
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up delay-100">
          <h1 className="text-[clamp(2.75rem,6.5vw,5rem)] font-bold leading-[0.92] tracking-[-0.035em]">
            Phone Photo.
            <br />
            <span className="text-primary/25">Studio Result.</span>
          </h1>
        </div>

        <div className="mx-auto max-w-2xl text-center animate-fade-in-up delay-200">
          <p className="mt-7 text-[17px] leading-[1.7] text-muted-foreground">
            Upload any product photo taken with your phone. StudioShot removes
            the background, perfects the lighting, and delivers a clean,
            professional image ready for any e-commerce platform — in seconds.
          </p>
        </div>

        {/* Platform logos */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-300">
          <span className="text-[12px] text-muted-foreground/60 mr-2 tracking-wide">
            Works with
          </span>
          {platforms.map((p) => (
            <img
              key={p.name}
              src={p.logo}
              alt={p.name}
              className="h-5 w-auto opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-in-up delay-400">
          <Button
            size="lg"
            className="rounded-full px-7 h-11 text-[14px] font-semibold gap-2 shadow-[0_2px_8px_rgba(249,115,22,0.2)] hover:shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
            
          >
            Transform a Photo Free
            <ArrowRight className="size-4" />
          </Button>
          <span className="text-[13px] text-muted-foreground/70 tracking-wide">
            No account required
          </span>
        </div>

        {/* Before / After infinite scroll showcase */}
        <div className="relative mt-20 animate-fade-in-up delay-500">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-black/[0.06] hover:bg-neutral-50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 group"
            aria-label="Scroll left"
          >
            <ArrowLeft className="size-4 text-neutral-600 group-hover:text-neutral-800" />
          </button>
          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-black/[0.06] hover:bg-neutral-50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 group"
            aria-label="Scroll right"
          >
            <ArrowRight className="size-4 text-neutral-600 group-hover:text-neutral-800" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-16"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Generate 4 sets for a truly seamless scroll */}
            {[1, 2, 3, 4].map((setNum) =>
              [1, 2, 3, 4, 5].map((imgNum) => (
                <div
                  key={`set${setNum}-img${imgNum}`}
                  className="flex-shrink-0 flex gap-4 h-[280px]"
                >
                  {/* Before */}
                  <div className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-neutral-100/80 h-full">
                    <img
                      src={`/results/before_${imgNum}.jpeg`}
                      alt={`Before transformation ${imgNum}`}
                      className="h-full w-auto object-contain"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-neutral-500 shadow-sm tracking-wide">
                        Before
                      </span>
                    </div>
                  </div>
                  {/* After */}
                  <div className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] h-full">
                    <img
                      src={`/results/after_${imgNum}.jpeg`}
                      alt={`After transformation ${imgNum}`}
                      className="h-full w-auto object-contain"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-white shadow-sm tracking-wide">
                        After
                      </span>
                    </div>
                  </div>
                </div>
              )),
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 flex max-w-xl items-center justify-center animate-fade-in-up delay-600">
          <div className="flex w-full items-center justify-center divide-x divide-black/[0.06]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 flex-col items-center py-2"
              >
                <span className="text-[1.75rem] font-bold tracking-[-0.03em] md:text-[2rem]">
                  {stat.value}
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground/50 tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
