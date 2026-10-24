import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "StudioShot for Etsy Sellers",
  description:
    "Create beautiful, listing-ready product photos for Etsy. Stand out in search results with professional AI-enhanced images.",
};

const features = [
  "Clean backgrounds that meet Etsy listing standards",
  "True-to-life color preservation for handmade goods",
  "Soft shadow generation for a professional look",
  "Optimized aspect ratios for Etsy search thumbnails",
  "High-resolution export for zoom-enabled listings",
  "Works with any product — jewelry, ceramics, apparel, and more",
];

export default function EtsyPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageShell
          title="StudioShot for Etsy"
          description="Stand out in Etsy search results with clean, professional product photos — no studio needed."
        >
          <div className="space-y-10 text-[15px] leading-[1.8] text-foreground/80">
            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                First Impressions Matter on Etsy
              </h2>
              <p>
                Etsy shoppers scroll through hundreds of listings. The ones that
                stop them? Clean, well-lit product photos with consistent
                styling. StudioShot helps your handmade and vintage items look
                their best — preserving the character of your product while
                giving it a professional presentation.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-4">
                Made for Etsy Sellers
              </h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/8 border border-primary/10">
                      <Check
                        className="size-2.5 text-primary"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-[14px] text-foreground/70">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                Preserve What Makes It Handmade
              </h2>
              <p>
                Unlike generic editors, StudioShot&apos;s color fidelity engine
                ensures your product&apos;s true colors come through. The
                texture of your pottery, the warmth of your knitted scarf, the
                shine of your jewelry — all preserved and enhanced, never
                distorted.
              </p>
            </section>

            <div className="pt-4">
              <Button
                size="lg"
                className="rounded-full px-7 h-11 text-[14px] font-semibold gap-2"
              >
                Try Free with Your Product
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </PageShell>
      </main>
      <Footer />
    </>
  );
}
