import Link from "next/link";

const productLinks = [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Try It Now", href: "/#try-it-now" },
];

const platformLinks = [
    { label: "Amazon", href: "/platforms/amazon" },
    { label: "Shopify", href: "/platforms/shopify" },
    { label: "Etsy", href: "/platforms/etsy" },
    { label: "WooCommerce", href: "/platforms/woocommerce" },
];

const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];

export function Footer() {
    return (
        <footer className="border-t border-black/[0.06] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16">
                <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-primary">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white">
                                    <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
                                    <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
                                    <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
                                    <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.25" />
                                </svg>
                            </div>
                            <span className="text-[15px] font-semibold tracking-[-0.01em]">StudioShot</span>
                        </Link>
                        <p className="mt-4 max-w-[240px] text-[14px] leading-[1.7] text-foreground/60">
                            AI-powered product photography
                            <br />
                            for e-commerce sellers.
                            <br />
                            No studio, no photographer needed.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-[12px] font-semibold tracking-[0.06em] uppercase text-foreground/40">
                            Product
                        </h4>
                        <ul className="mt-4 space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-[14px] text-foreground/60 transition-colors duration-200 hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-[12px] font-semibold tracking-[0.06em] uppercase text-foreground/40">
                            Platform
                        </h4>
                        <ul className="mt-4 space-y-3">
                            {platformLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-[14px] text-foreground/60 transition-colors duration-200 hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-[12px] font-semibold tracking-[0.06em] uppercase text-foreground/40">
                            Company
                        </h4>
                        <ul className="mt-4 space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-[14px] text-foreground/60 transition-colors duration-200 hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] pt-6 md:flex-row">
                    <p className="text-[13px] text-foreground/45">
                        &copy; 2026 StudioShot. All rights reserved.
                    </p>
                    <p className="text-[13px] text-foreground/35">
                        Built for Amazon, Shopify &amp; Etsy sellers who refuse to overpay for product photos.
                    </p>
                </div>
            </div>
        </footer>
    );
}
