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
        title: "One-Click Background Removal",
        description:
            "No more hours in Photoshop or paying per image on remove.bg. Get pixel-perfect cutouts on any product — shoes, jewelry, electronics, food — instantly.",
    },
    {
        icon: Sun,
        title: "AI Studio Lighting Fix",
        description:
            "Harsh phone flash? Dim kitchen lighting? Our AI corrects exposure, color temperature, and shadows to replicate a professional studio setup automatically.",
    },
    {
        icon: Monitor,
        title: "Amazon, Shopify & Etsy Ready",
        description:
            "Exports meet strict marketplace image requirements out of the box — Amazon pure-white main images, Shopify square format, Etsy listing dimensions. No more rejected listings.",
    },
    {
        icon: CircleDot,
        title: "Natural Shadow Generation",
        description:
            "Automatically adds realistic drop shadows that ground your product and give it that premium, professionally photographed look buyers trust.",
    },
    {
        icon: Palette,
        title: "True-to-Life Colors",
        description:
            "Colors stay accurate — no washed-out whites or shifted hues. What you sell is exactly what the buyer sees. Reduce returns caused by color mismatches.",
    },
    {
        icon: Package,
        title: "Works for Every Product Category",
        description:
            "Apparel, accessories, home goods, electronics, food, handmade crafts — trained on millions of e-commerce images so it handles whatever you sell.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 md:py-32 bg-neutral-50/40">
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary mb-4">
                        Why Sellers Switch to StudioShot
                    </p>
                    <h2 className="text-[2.25rem] font-bold tracking-[-0.03em] md:text-[3rem] md:leading-[1.05]">
                        Everything a Photo Studio Does.
                        <br />
                        <span className="text-muted-foreground/40">At a Fraction of the Cost.</span>
                    </h2>
                    <p className="mt-5 text-[17px] leading-relaxed text-foreground">
                        Skip the $40&ndash;$70 per photo studio fees and 10-week wait times.
                    </p>
                    <p className="mt-3 text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Background removal, lighting correction, shadow generation, and
                        platform-compliant export — all handled in one click.
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
