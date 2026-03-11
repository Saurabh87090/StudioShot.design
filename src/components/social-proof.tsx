import { Quote } from "lucide-react";

const testimonials = [
    {
        quote:
            "I was spending $40 per product photo and waiting weeks for delivery. StudioShot does the same thing from my phone in seconds. My Amazon listings have never looked better.",
        name: "Priya M.",
        role: "Amazon Seller, 200+ SKUs",
    },
    {
        quote:
            "My Etsy photos looked amateurish and I was totally lost with editing. StudioShot fixed my lighting and backgrounds in one click. Sales went up 30% the first month.",
        name: "Sarah K.",
        role: "Etsy Shop Owner",
    },
    {
        quote:
            "We have 1,200 products to list on Amazon. Doing background removal one-by-one was painful. The batch upload feature saved us weeks of work.",
        name: "Rajesh T.",
        role: "E-Commerce Business Owner",
    },
];

export function SocialProof() {
    return (
        <section className="py-24 md:py-32 bg-neutral-50/40">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary mb-4">
                        Trusted by Sellers
                    </p>
                    <h2 className="text-[2.25rem] font-bold tracking-[-0.03em] md:text-[3rem] md:leading-[1.05]">
                        Sellers Who Ditched the Photo Studio
                    </h2>
                    <p className="mt-5 text-[17px] leading-relaxed text-foreground">
                        Real results from real e-commerce sellers.
                    </p>
                </div>

                <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="flex flex-col rounded-2xl border border-black/[0.04] bg-white p-7 transition-all duration-500 hover:border-black/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                        >
                            <Quote
                                className="size-5 text-primary/20 mb-4"
                                strokeWidth={1.5}
                            />
                            <p className="flex-1 text-[14px] leading-[1.7] text-muted-foreground">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="mt-6 pt-5 border-t border-black/[0.04]">
                                <p className="text-[14px] font-semibold tracking-[-0.01em]">
                                    {t.name}
                                </p>
                                <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                                    {t.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
