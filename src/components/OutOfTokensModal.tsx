"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface OutOfTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OutOfTokensModal({
  isOpen,
  onClose,
}: OutOfTokensModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const closeModal = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="out-of-tokens-title"
        aria-describedby="out-of-tokens-description"
        className={`max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#fe834d]/30 bg-white p-4 shadow-2xl shadow-slate-950/25 transition-all duration-200 sm:p-6 lg:p-8 ${isClosing ? "translate-y-2 scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"}`}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fe834d]/10 text-[#fe834d]">
          <Zap className="h-6 w-6 fill-current" />
        </div>
        <h2
          id="out-of-tokens-title"
          className="text-center text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
        >
          ⚡ Out of Free Tokens!
        </h2>
        <p
          id="out-of-tokens-description"
          className="mt-3 text-center text-sm leading-6 text-slate-600"
        >
          You have used all your free generations. To get 100 FREE tokens
          instantly and unlock unlimited access, join our exclusive WhatsApp
          community group!
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={closeModal}
            className="min-h-11 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:w-auto"
          >
            Cancel
          </button>
          <a
            href="https://chat.whatsapp.com/FwdMLuf4mtJLh7rJrU9xqx?s=cl&p=a&iam=2"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 rounded-xl bg-emerald-600 px-4 py-3 text-center text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:px-5 sm:text-sm"
          >
            💬 Join WhatsApp Group (Get Free Tokens)
          </a>
        </div>
      </section>
    </div>
  );
}
