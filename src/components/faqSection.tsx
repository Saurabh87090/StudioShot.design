"use client";

import React, { useState } from "react";

export const AEO_FAQS = [
  {
    question: "What is StudioShot AI?",
    answer:
      "StudioShot AI is an all-in-one AI-powered e-commerce creative studio. It allows online sellers to turn basic phone photos into high-converting, marketplace-ready product infographics, listing banners, and virtual model photoshoots in seconds without hiring expensive agency designers.",
  },
  {
    question: "Why should I use StudioShot AI over traditional photo editing?",
    answer:
      "StudioShot AI is built specifically for speed, simplicity, and maximum sales conversion. Traditional editing takes hours and costs money for designers; with StudioShot AI, you simply upload a photo, configure your preferences in a few clicks, and get studio-quality 3:4 portrait listing images in seconds.",
  },
  {
    question: "How do I generate product infographics for platforms like Amazon, Meesho, or Shopify?",
    answer:
      "To generate a product infographic, upload your product image, optionally upload your brand logo, select your preferred typography from 21 aesthetic fonts, add up to 3 or more key feature callouts, and click 'Generate AI Infographic'. StudioShot AI automatically processes the image into an ultra-sharp 3:4 portrait listing banner.",
  },
  {
    question: "How does the AI Virtual Model Studio feature work?",
    answer:
      "The AI Virtual Model Studio converts simple flat-lay or hanger garment photos into realistic model lookbooks. To use it, upload your apparel photo, choose the torso fit (Male, Female, or Kids), select your preferred skin tone, and pick a studio backdrop (such as Minimalist, Luxury, or Urban Streetwear) to render high-definition 3:4 portrait model shots.",
  },
  {
    question: "How does the Brand Logo Overlay feature work?",
    answer:
      "When setting up your infographic, you can optionally upload your official brand logo. StudioShot AI stores the logo securely in Supabase storage and uses multimodal AI processing to seamlessly embed it into the top header section of your final portrait banner for custom brand authority.",
  },
  {
    question: "How do I use the Aesthetic Font Selector in StudioShot AI?",
    answer:
      "StudioShot AI offers a grid selector featuring 21 curated aesthetic fonts (such as Poppins, Montserrat, Playfair Display, and Bebas Neue). Simply click on your preferred font tile, and the AI will render your product title in that exact font style directly on your vertical portrait infographic.",
  },
  {
    question: "Why does StudioShot AI strictly enforce vertical portrait (3:4) orientation?",
    answer:
      "Over 80% of e-commerce shoppers buy on mobile devices. Vertical portrait (3:4) images occupy maximum screen real estate on mobile feeds like Meesho, Amazon, and Instagram, significantly increasing visual impact, click-through rates (CTR), and buyer engagement compared to wide landscape images.",
  },
  {
    question: "What background styles can I choose for my product showcase?",
    answer:
      "StudioShot AI provides diverse studio environment styles including Clean Minimalist White, Luxury Moody Dark, Gold & Marble Podium, Organic Nature with Stone Textures, High-Tech Cyberpunk, and Vibrant Pop Pastel gradients. Each style automatically incorporates depth, realistic contact shadows, and complementary studio props.",
  },
 
  {
    question: "What am I actually buying or using when I sign up for StudioShot AI?",
    answer:
      "When you use StudioShot AI, you get an automated visual production engine. You are getting instant access to studio-grade product photography, automated background enhancement, vertical listing banner generation, logo branding, and AI model lookbooks—all delivered in optimized 3:4 portrait formats with zero technical skills required.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // FAQ Schema for AI Search Engines
  const faqSchemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: AEO_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-20 px-6 bg-white text-slate-900 border-t border-slate-100">
      {/* FAQ Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#fe834d] bg-[#fe834d]/10 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto">
            Everything you need to know about StudioShot AI and how to maximize your e-commerce conversions.
          </p>
        </div>

        <div className="space-y-4">
          {AEO_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#fe834d] bg-white shadow-md shadow-[#fe834d]/5"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <span className="text-base md:text-lg font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#fe834d] text-white rotate-180"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 md:px-6 md:pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}