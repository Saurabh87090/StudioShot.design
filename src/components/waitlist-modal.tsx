"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type WaitlistContextType = {
    open: boolean;
    openModal: () => void;
    closeModal: () => void;
};

const WaitlistContext = createContext<WaitlistContextType>({
    open: false,
    openModal: () => { },
    closeModal: () => { },
});

export function useWaitlist() {
    return useContext(WaitlistContext);
}

export function WaitlistProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const openModal = useCallback(() => setOpen(true), []);
    const closeModal = useCallback(() => setOpen(false), []);

    return (
        <WaitlistContext.Provider value={{ open, openModal, closeModal }}>
            {children}
            {open && <WaitlistModal onClose={closeModal} />}
        </WaitlistContext.Provider>
    );
}

function WaitlistModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] animate-modal-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-foreground/40 hover:bg-black/[0.04] hover:text-foreground/70 transition-all cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                </button>

                {/* Status indicator */}
                <div className="flex items-center gap-2 mb-5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                    </span>
                    <span className="text-[12px] font-semibold text-primary tracking-wide">High Demand</span>
                </div>

                {/* Content */}
                <h3 className="text-[20px] font-bold tracking-[-0.02em] leading-snug">
                    We&apos;re at capacity right now
                </h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-foreground/60">
                    StudioShot is experiencing incredible demand. To ensure the best experience for every user, we&apos;re onboarding new accounts in batches.
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-foreground/60">
                    Join our WhatsApp waitlist and we&apos;ll notify you the moment your spot opens up — usually within 24-48 hours.
                </p>

                {/* WA Button */}
                <a
                    href="https://wa.me/919288052626?text=Hi%2C%20I%27d%20like%20to%20join%20the%20StudioShot%20waitlist!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 h-12 text-[14px] font-semibold text-white cursor-pointer transition-all duration-200 hover:bg-[#20BD5A] hover:shadow-[0_4px_16px_rgba(37,211,102,0.3)] active:scale-[0.98]"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Join Waitlist on WhatsApp
                </a>

                <p className="mt-4 text-center text-[12px] text-foreground/35">
                    You&apos;ll get early access + 10 free credits when we let you in.
                </p>
            </div>
        </div>
    );
}
