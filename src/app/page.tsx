import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Features } from "@/components/features";
import { SocialProof } from "@/components/social-proof";
import { Pricing } from "@/components/pricing";
import FaqSection from "@/components/faqSection";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <Features />
        <SectionDivider />
        <SocialProof />
        <SectionDivider />
        <Pricing />
        <SectionDivider />
        <FaqSection />
        <SectionDivider />
        <CTA />
      </main>
      <Footer />
    </>
  );
}