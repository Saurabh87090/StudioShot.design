import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";
import { WaitlistCTAButton } from "@/components/waitlist-button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
    title: "StudioShot for Amazon Sellers",
    description: "Create Amazon-compliant product images instantly. Meet main image standards with AI-powered background removal and studio lighting.",
};

const requirements = [
    "Pure white background (RGB 255, 255, 255)",
    "Product fills 85% or more of the image frame",
    "Minimum 1000px on the longest side (recommended 2000px+)",
    "No text, logos, watermarks, or borders",
    "JPEG, TIFF, PNG, or GIF format",
    "Accurate color representation",
];

export default function AmazonPage() {
    return (
        <>
            <Navbar />
            <main>
                <PageShell
                    title="StudioShot for Amazon"
                    description="Create Amazon-compliant main images in seconds. No studio, no Photoshop, no rejected listings."
                >
                    <div className="space-y-10 text-[15px] leading-[1.8] text-foreground/80">
                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">Amazon Image Standards, Handled Automatically</h2>
                            <p>
                                Amazon&apos;s main image requirements are strict — and a rejected image means a delayed listing. StudioShot automatically processes your product photos to meet every Amazon standard, so your listings go live the first time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-4">What StudioShot Handles</h2>
                            <ul className="space-y-3">
                                {requirements.map((req) => (
                                    <li key={req} className="flex items-start gap-2.5">
                                        <div className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/8 border border-primary/10">
                                            <Check className="size-2.5 text-primary" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[14px] text-foreground/70">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">Built for Amazon Seller Central</h2>
                            <p>
                                Output images are sized and formatted to upload directly to Seller Central without additional editing. Whether you sell in one category or twenty, StudioShot produces consistent, professional results across every product type.
                            </p>
                        </section>

                        <div className="pt-4">
                            <WaitlistCTAButton />
                        </div>
                    </div>
                </PageShell>
            </main>
            <Footer />
        </>
    );
}
