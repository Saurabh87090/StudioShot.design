import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "StudioShot for WooCommerce",
  description:
    "Create professional product images for your WooCommerce store. AI-powered photo enhancement optimized for WordPress e-commerce.",
};

const features = [
  "Clean, consistent product backgrounds across your catalog",
  "High-resolution output compatible with all WooCommerce themes",
  "Batch processing via API for large inventories",
  "Automatic product centering and shadow generation",
  "PNG and JPG export in any dimension",
  "Works with variable products and multiple angles",
];

export default function WooCommercePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageShell
          title="StudioShot for WooCommerce"
          description="Professional product photos for your WooCommerce store — no plugins, no Photoshop, no hassle."
        >
          <div className="space-y-10 text-[15px] leading-[1.8] text-foreground/80">
            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                Your WooCommerce Store, Elevated
              </h2>
              <p>
                WooCommerce gives you full control over your store — but that
                means image quality is on you. StudioShot bridges the gap
                between phone photos and professional product imagery, giving
                your WordPress-powered store the visual polish it deserves.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-4">
                Built for WooCommerce Workflows
              </h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="mt-0.75 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/8 border border-primary/10">
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
                API Access for Automation
              </h2>
              <p>
                On our Business plan, integrate StudioShot directly into your
                WooCommerce workflow via our REST API. Automatically process
                product images on upload, ensuring every new listing meets your
                quality standards without manual intervention.
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
