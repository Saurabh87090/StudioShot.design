import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageShell({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 md:pt-40 md:pb-32">
            <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-10"
            >
                <ArrowLeft className="size-3.5" />
                Back to home
            </Link>
            <h1 className="text-[2rem] font-bold tracking-[-0.03em] md:text-[2.75rem] md:leading-[1.05]">
                {title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground/80">
                {description}
            </p>
            <div className="mt-12">{children}</div>
        </div>
    );
}
