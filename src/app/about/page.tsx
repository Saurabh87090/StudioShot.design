import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "About — StudioShot",
  description: "Learn about StudioShot and our mission to make professional product photography accessible to everyone.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageShell
          title="About StudioShot"
          description="Making professional product photography accessible to every seller, everywhere."
        >
          <div className="space-y-8 text-[15px] leading-[1.8] text-foreground/80">
            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">Our Mission</h2>
              <p>
                StudioShot was built with a simple belief: great product photos shouldn&apos;t require a studio, expensive equipment, or professional photography skills. Every seller — from a first-time Etsy creator to a growing Amazon brand — deserves images that convert.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">The Problem We Solve</h2>
              <p>
                Product photography is one of the biggest barriers to selling online. Hiring a photographer costs hundreds per session. Learning Photoshop takes months. And phone photos with messy backgrounds simply don&apos;t convert. StudioShot eliminates all of that — upload a photo, and our AI delivers a studio-quality result in seconds.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">How It Works</h2>
              <p>
                Our AI model was trained on millions of professional e-commerce images. It understands lighting, shadows, color balance, and marketplace standards. When you upload a photo, it removes the background with sub-pixel precision, reconstructs studio-grade lighting, adds natural shadows, and outputs an image ready for any platform.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">Built for Sellers</h2>
              <p>
                We&apos;re a small team of engineers and designers who&apos;ve spent years in e-commerce. We&apos;ve seen firsthand how a single great product image can double a listing&apos;s conversion rate. StudioShot is the tool we wish we&apos;d had — fast, affordable, and built specifically for the platforms sellers actually use.
              </p>
            </section>
          </div>
        </PageShell>
      </main>
      <Footer />
    </>
  );
}
