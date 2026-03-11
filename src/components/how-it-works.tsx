import { Upload, Cpu, Download } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Upload,
        title: "Snap With Your Phone",
        description:
            "No lightbox, no DSLR, no photo studio. Just take a quick shot of your product with your phone camera — any angle, any lighting condition works.",
    },
    {
        number: "02",
        icon: Cpu,
        title: "AI Does the Heavy Lifting",
        description:
            "In under 3 seconds, StudioShot removes the background, fixes lighting and color balance, adds professional shadows, and outputs a clean, marketplace-ready image.",
    },
    {
        number: "03",
        icon: Download,
        title: "List & Start Selling",
        description:
            "Download your high-res PNG and upload it directly to Amazon, Shopify, Etsy, or any marketplace. Pure white backgrounds that pass Amazon compliance — guaranteed.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary mb-4">
                        How It Works
                    </p>
                    <h2 className="text-[2.25rem] font-bold tracking-[-0.03em] md:text-[3rem] md:leading-[1.05]">
                        From Phone Snap to Listing-Ready in Seconds
                    </h2>
                    <p className="mt-5 text-[17px] leading-relaxed text-foreground">
                        Three steps. Zero editing skills required.
                    </p>
                    <p className="mt-3 text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                        No Photoshop, no expensive photographers, no 10-week turnaround.
                        Just upload and go.
                    </p>
                </div>

                {/* Steps */}
                <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className="group relative h-full rounded-2xl border border-black/[0.05] bg-white p-8 transition-all duration-500 hover:border-black/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                        >
                            {/* Connector line on desktop */}
                            {i < steps.length - 1 && (
                                <div className="absolute top-12 -right-1.5 hidden h-px w-3 bg-black/[0.06] md:block" />
                            )}

                            {/* Step number */}
                            <span className="text-[11px] font-bold tracking-[0.15em] text-black/15 uppercase">
                                {step.number}
                            </span>

                            {/* Icon */}
                            <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-50/80 border border-black/[0.04] transition-colors duration-300 group-hover:bg-neutral-50">
                                <step.icon className="size-[18px] text-foreground/80" strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <h3 className="mt-6 text-[16px] font-semibold tracking-[-0.01em]">
                                {step.title}
                            </h3>
                            <p className="mt-3 text-[14px] leading-[1.7] text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
