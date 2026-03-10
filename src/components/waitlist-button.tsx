"use client";

import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/components/waitlist-modal";
import { ArrowRight } from "lucide-react";

export function WaitlistButton({
    children,
    className,
    variant = "default",
    size = "lg",
}: {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "xs";
}) {
    const { openModal } = useWaitlist();

    return (
        <Button variant={variant} size={size} className={className} onClick={openModal}>
            {children}
        </Button>
    );
}

export function WaitlistCTAButton() {
    const { openModal } = useWaitlist();

    return (
        <Button
            size="lg"
            className="rounded-full px-7 h-11 text-[14px] font-semibold gap-2"
            onClick={openModal}
        >
            Try Free with Your Product
            <ArrowRight className="size-4" />
        </Button>
    );
}
