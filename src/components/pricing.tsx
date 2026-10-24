"use client";

import { Button } from "@/components/ui/button";

import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "forever",
        description: "Perfect for testing before you commit. No credit card needed.",
        features: [
            "5 images per month",
            "Standard resolution export",
            "Pure white background",
            "JPG download",
        ],
        cta: "Start Free",
        variant: "outline" as const,
        popular: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "per month",
        description: "For active sellers — replaces $600+/mo in photography costs.",
        features: [
            "150 images per month",
            "High resolution PNG export",
            "Custom background colors",
            "Batch upload (up to 10)",
            "Priority processing",
        ],
        cta: "Start 7-Day Free Trial",
        variant: "default" as const,
        popular: true,
    },
    {
        name: "Business",
        price: "$49",
        period: "per month",
        description: "For teams with large catalogs — process thousands of SKUs.",
        features: [
            "Unlimited images",
            "4K resolution export",
            "API access for automation",
            "Batch upload (up to 100)",
            "Team seats (3 included)",
            "Dedicated support",
        ],
        cta: "Contact Sales",
        variant: "outline" as const,
        popular: false,
    },
];

export function Pricing() {
   

    return (
        <section id="pricing" className="py-24 md:py-32 bg-neutral-50/40">
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary mb-4">
                        Pricing
                    </p>
                    <h2 className="text-[2.25rem] font-bold tracking-[-0.03em] md:text-[3rem] md:leading-[1.05]">
                        One Photo Costs $25&ndash;$50 at a Studio.
                        <br />
                        <span className="text-muted-foreground/40">We Do It for Pennies.</span>
                    </h2>
                    <p className="mt-5 text-[17px] leading-relaxed text-foreground">
                        Simple pricing. Cancel anytime.
                    </p>
                    <p className="mt-3 text-[15px] text-muted-foreground">
                        Start free. No credit card required. Upgrade only when you need more.
                    </p>
                </div>

                {/* Plans */}
                <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-2xl border bg-white p-7 transition-all duration-500 ${plan.popular
                                    ? "border-primary/70 shadow-[0_8px_30px_rgba(249,115,22,0.1)] md:scale-[1.03] md:-my-2"
                                    : "border-black/[0.05] hover:border-black/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-primary px-3.5 py-1 text-[10px] font-semibold text-white tracking-[0.04em] shadow-sm">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div>
                                <h3 className="text-[14px] font-semibold tracking-[-0.01em]">
                                    {plan.name}
                                </h3>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-[2.25rem] font-bold tracking-[-0.04em] leading-none">
                                        {plan.price}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground/50 ml-0.5">
                                        {plan.period}
                                    </span>
                                </div>
                                <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="my-6 h-px bg-black/[0.04]" />

                            <ul className="flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2.5">
                                        <div className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/5 border border-primary/10">
                                            <Check className="size-2.5 text-primary" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[14px] text-muted-foreground leading-snug">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.variant}
                                className={`mt-7 w-full rounded-full h-10 text-[13px] font-semibold ${plan.popular
                                        ? "shadow-[0_2px_8px_rgba(249,115,22,0.18)] hover:shadow-[0_4px_12px_rgba(249,115,22,0.25)]"
                                        : "border-black/[0.08] hover:bg-neutral-50"
                                    }`}
                                
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
