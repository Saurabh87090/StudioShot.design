"use client";

import { Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/components/waitlist-modal";

export function TryItNow() {
    const { openModal } = useWaitlist();

    return (
        <section id="try-it-now" className="py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary/60 mb-4">
                        Demo
                    </p>
                    <h2 className="text-[2rem] font-bold tracking-[-0.03em] md:text-[2.75rem] md:leading-[1.05]">
                        Try It Now
                    </h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground/80">
                        Your studio is ready.
                    </p>
                    <p className="mt-1.5 text-[13px] text-muted-foreground/50 max-w-md mx-auto leading-relaxed">
                        Upload a product photo and see the transformation happen in real
                        time — no account required.
                    </p>
                </div>

                {/* Interactive area */}
                <div className="mx-auto mt-14 max-w-4xl">
                    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Upload area */}
                            <div className="border-b border-black/[0.04] md:border-b-0 md:border-r p-10 flex flex-col items-center justify-center min-h-[380px]">
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className="flex h-16 w-16 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-black/[0.1] bg-neutral-50/50 transition-colors duration-300 hover:border-black/[0.15] hover:bg-neutral-50 cursor-pointer"
                                        onClick={openModal}
                                    >
                                        <Upload className="size-5 text-muted-foreground/40" strokeWidth={1.5} />
                                    </div>
                                    <p className="mt-5 text-[13px] text-muted-foreground/60">
                                        Drag and drop or click to upload
                                    </p>
                                    <Button
                                        variant="default"
                                        className="mt-5 rounded-full px-6 h-10 text-[13px] font-semibold gap-2 shadow-[0_2px_8px_rgba(249,115,22,0.18)] hover:shadow-[0_4px_12px_rgba(249,115,22,0.25)]"
                                        onClick={openModal}
                                    >
                                        <Upload className="size-3.5" />
                                        Upload Image
                                    </Button>
                                    <p className="mt-3.5 text-[10px] text-muted-foreground/35 tracking-wide">
                                        Supported: JPG &middot; PNG &middot; WEBP
                                    </p>
                                </div>
                            </div>

                            {/* Result area */}
                            <div className="p-10 flex flex-col items-center justify-center min-h-[380px] bg-neutral-50/30">
                                <div className="flex flex-col items-center text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                        <ImageIcon className="size-5 text-muted-foreground/30" strokeWidth={1.5} />
                                    </div>
                                    <div className="mt-5">
                                        <p className="text-[14px] font-semibold tracking-[-0.01em]">StudioShot</p>
                                        <p className="mt-2 text-[12px] text-muted-foreground/60 leading-[1.6] max-w-[220px]">
                                            Transform any product photo into a clean, studio-quality
                                            image ready for Amazon, Shopify, or Etsy.
                                        </p>
                                    </div>
                                    <div className="mt-5 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-black/10 animate-pulse" />
                                        <span className="text-[11px] text-muted-foreground/40 tracking-wide">
                                            Awaiting input
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
