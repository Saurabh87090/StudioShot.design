import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Blog — StudioShot",
  description: "Tips, guides, and updates from the StudioShot team on product photography and e-commerce.",
};

const posts = [
  {
    title: "5 Product Photo Mistakes That Kill Your Conversion Rate",
    date: "Mar 4, 2026",
    summary:
      "Bad lighting, cluttered backgrounds, and inconsistent sizing cost sellers thousands in lost sales. Here's how to fix each one — with or without a studio.",
    tag: "Guide",
  },
  {
    title: "Amazon Main Image Requirements: The Complete 2026 Checklist",
    date: "Feb 18, 2026",
    summary:
      "Amazon's image standards are strict and constantly evolving. This post covers every requirement for main listing images, including resolution, background color, and fill ratio.",
    tag: "Platform",
  },
  {
    title: "How AI Background Removal Actually Works",
    date: "Feb 3, 2026",
    summary:
      "A non-technical explainer of the machine learning models behind modern background removal — and why some tools produce cleaner edges than others.",
    tag: "Technology",
  },
  {
    title: "Etsy vs. Shopify: Image Specs Compared",
    date: "Jan 20, 2026",
    summary:
      "Each platform has different image requirements. We break down the specs, aspect ratios, and best practices for both Etsy and Shopify product listings.",
    tag: "Platform",
  },
  {
    title: "Why Phone Photos Are Good Enough (With the Right Post-Processing)",
    date: "Jan 8, 2026",
    summary:
      "Modern phone cameras capture more detail than you think. The real bottleneck is post-processing — and AI is closing that gap fast.",
    tag: "Insight",
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageShell
          title="Blog"
          description="Tips, guides, and updates on product photography and selling online."
        >
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.title}
                className="group rounded-2xl border border-black/[0.05] bg-white p-6 transition-all duration-300 hover:border-black/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[11px] font-semibold text-primary tracking-wide">
                    {post.tag}
                  </span>
                  <span className="text-[12px] text-muted-foreground/50">{post.date}</span>
                </div>
                <h2 className="text-[16px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                  {post.title}
                </h2>
                <p className="mt-2 text-[14px] leading-[1.7] text-muted-foreground/70">
                  {post.summary}
                </p>
              </article>
            ))}
          </div>
        </PageShell>
      </main>
      <Footer />
    </>
  );
}
