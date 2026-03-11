"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "How much does professional product photography cost compared to StudioShot?",
        answer:
            "Professional product photographers charge $25\u2013$70 per image, with turnaround times of 2\u201310 weeks. A seller with 50 products can easily spend $1,500\u2013$3,500 on a single shoot. StudioShot starts free (5 images/month) and the Pro plan processes 150 images for just $19/month \u2014 saving you over 95% compared to traditional photography.",
    },
    {
        question: "Will my images pass Amazon\u2019s white background requirements?",
        answer:
            "Yes. StudioShot generates pure white backgrounds (RGB 255,255,255) that meet Amazon\u2019s strict main image standards. Many sellers get listings rejected because their backgrounds aren\u2019t truly white \u2014 even off-white or light gray can trigger a rejection. Our AI ensures pixel-perfect compliance every time.",
    },
    {
        question: "Can I really use my phone to take product photos?",
        answer:
            "StudioShot is specifically designed for phone photos. No DSLR camera, lightbox, or photo studio required. Snap a photo of your product in any lighting condition \u2014 our AI handles background removal, lighting correction, color balancing, and shadow generation automatically.",
    },
    {
        question: "How is StudioShot different from remove.bg or Canva?",
        answer:
            "Tools like remove.bg only remove the background. Canva requires manual editing skills. StudioShot does everything in one step: removes the background, corrects lighting and color temperature, generates natural drop shadows, and exports in the exact format your marketplace requires. It\u2019s a complete product photography pipeline, not just a background remover.",
    },
    {
        question: "Do better product photos actually increase sales?",
        answer:
            "Research consistently shows that professional product images can double conversion rates and increase revenue by 24% or more. On Reddit, e-commerce sellers frequently report that upgrading their product photos was the single biggest factor in improving their sales \u2014 especially on competitive marketplaces like Amazon and Etsy.",
    },
    {
        question: "Can I process product photos in bulk?",
        answer:
            "Yes. The Pro plan supports batch uploads of up to 10 images at once, and the Business plan handles batches of up to 100. This is ideal for sellers managing large catalogs who need to process hundreds or thousands of product SKUs without spending hours on manual editing.",
    },
    {
        question: "What image formats and marketplaces are supported?",
        answer:
            "StudioShot exports high-resolution PNG and JPG files optimized for Amazon, Shopify, Etsy, eBay, Flipkart, Meesho, WooCommerce, and more. Each export meets the specific dimension, background, and file size requirements of the target platform.",
    },
    {
        question: "Is there a free plan?",
        answer:
            "Yes. The Starter plan is completely free forever \u2014 no credit card required. You get 5 images per month with standard resolution export and pure white backgrounds. It\u2019s the perfect way to test StudioShot before upgrading.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary mb-4">
                        FAQ
                    </p>
                    <h2 className="text-[2.25rem] font-bold tracking-[-0.03em] md:text-[3rem] md:leading-[1.05]">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-5 text-[17px] leading-relaxed text-foreground">
                        Everything sellers ask before switching to StudioShot.
                    </p>
                </div>

                <div className="mx-auto mt-14 max-w-3xl divide-y divide-black/[0.06]">
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <button
                                type="button"
                                className="flex w-full items-center justify-between py-5 text-left cursor-pointer group"
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <span className="text-[15px] font-semibold tracking-[-0.01em] pr-4 group-hover:text-primary transition-colors duration-200">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`size-4 shrink-0 text-muted-foreground/50 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""
                                        }`}
                                    strokeWidth={2}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === i
                                        ? "max-h-96 pb-5 opacity-100"
                                        : "max-h-0 pb-0 opacity-0"
                                    }`}
                            >
                                <p className="text-[14px] leading-[1.7] text-muted-foreground pr-8">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
