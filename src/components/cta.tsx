"use client";

import { Button } from "@/components/ui/button";

import { ArrowRight } from "lucide-react";

export function CTA() {
    

    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.015)_0%,transparent_70%)]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-[2rem] font-bold tracking-[-0.03em] md:text-[2.75rem] md:leading-[1.05]">
                        Your Competitors Have
                        <br />
                        <span className="text-primary/25">Better Product Photos. Fix That.</span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.7] text-muted-foreground/80">
                        Thousands of Amazon, Shopify, and Etsy sellers already switched from
                        expensive studios to StudioShot. Start free — see results in seconds.
                    </p>
                    <Button
                        size="lg"
                        className="mt-8 rounded-full px-8 h-12 text-[14px] font-semibold gap-2 shadow-[0_2px_8px_rgba(249,115,22,0.2)] hover:shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
                        
                    >
                        Try It Free — No Signup Required
                        <ArrowRight className="size-4" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
