import {
    Scissors,
    Sun,
    Monitor,
    CircleDot,
    Palette,
    Package,
} from "lucide-react";

const features = [
    {
        icon: Scissors,
        title: "Background Removal",
        description:
            "Precision edge detection removes backgrounds on any product — shoes, electronics, jewelry, food — with sub-pixel accuracy.",
    },
    {
        icon: Sun,
        title: "Studio Lighting",
        description:
            "AI reconstructs professional studio lighting conditions — eliminating harsh shadows, correcting color temperature, and boosting clarity.",
    },
    {
        icon: Monitor,
        title: "Platform-Ready Output",
        description:
            "Output meets every major marketplace spec: Amazon main image standards, Shopify square format, Etsy listing requirements.",
    },
    {
        icon: CircleDot,
        title: "Soft Shadow Generation",
        description:
            "Natural drop shadows are added automatically, grounding the product and giving it a premium, professionally photographed appearance.",
    },
    {
        icon: Palette,
        title: "Color Fidelity",
        description:
            "Product colors are preserved and enhanced, not altered. What you sell is exactly what the buyer sees — accurate hues at their truest.",
    },
    {
        icon: Package,
        title: "Any Product Category",
        description:
            "Trained on millions of e-commerce images across apparel, accessories, home goods, electronics, food, and more.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 md:py-32 bg-neutral-50/40">
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary mb-4">
                        Capabilities
                    </p>
                    <h2 className="text-[2.25rem] font-bold tracking-[-0.03em] md:text-[3rem] md:leading-[1.05]">
                        Features
                    </h2>
                    <p className="mt-5 text-[17px] leading-relaxed text-foreground">
                        Everything a studio does. Nothing you don&apos;t need.
                    </p>
                    <p className="mt-3 text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Every step of the professional product photography process — from
                        lighting to export — handled automatically.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group h-full rounded-2xl border border-black/[0.04] bg-white p-7 transition-all duration-500 hover:border-black/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-50/80 border border-black/[0.04] transition-colors duration-300 group-hover:bg-neutral-50">
                                <feature.icon
                                    className="size-[18px] text-foreground/80"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h3 className="mt-6 text-[16px] font-semibold tracking-[-0.01em]">
                                {feature.title}
                            </h3>
                            <p className="mt-3 text-[14px] leading-[1.7] text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
