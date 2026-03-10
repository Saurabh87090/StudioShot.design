import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "StudioShot for Shopify Stores",
  description: "Create clean, professional product photos for your Shopify store. AI-powered background removal and studio lighting in seconds.",
};

const features = [
  "Square-format output optimized for Shopify themes",
  "Consistent white or custom-color backgrounds",
  "High-resolution PNG export (up to 4K)",
  "Uniform product centering and framing",
  "Natural shadow generation for depth",
  "Batch processing for large catalogs",
];

export default function ShopifyPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageShell
          title="StudioShot for Shopify"
          description="Consistent, professional product photos that make your Shopify store look premium — without a photographer."
        >
          <div className="space-y-10 text-[15px] leading-[1.8] text-foreground/80">
            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">Your Store Deserves Great Photos</h2>
              <p>
                Shoppers judge your store by its images. Inconsistent backgrounds, poor lighting, and amateur photos erode trust and hurt conversions. StudioShot transforms any phone photo into a clean, studio-quality product image that fits seamlessly into any Shopify theme.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-4">Optimized for Shopify</h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/8 border border-primary/10">
                      <Check className="size-2.5 text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-[14px] text-foreground/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">From Phone to Store in Seconds</h2>
              <p>
                Take a photo with your phone, upload it to StudioShot, and download a store-ready image. No editing skills, no expensive software. Just consistent, professional results every time.
              </p>
            </section>

            <div className="pt-4">
              <Button size="lg" className="rounded-full px-7 h-11 text-[14px] font-semibold gap-2">
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
