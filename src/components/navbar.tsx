"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Initialize Browser Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    // Scroll event listener
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);

    // Get current logged in user state
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Google OAuth Login Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/85 backdrop-blur-2xl border-b border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-primary transition-transform duration-300 group-hover:scale-105">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="text-white"
            >
              <rect
                x="2"
                y="2"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="9"
                y="2"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
                opacity="0.5"
              />
              <rect
                x="2"
                y="9"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
                opacity="0.5"
              />
              <rect
                x="9"
                y="9"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
                opacity="0.25"
              />
            </svg>
          </div>
          <span className="text-[16px] font-bold tracking-[-0.02em]">
            <span className="text-foreground">Studio</span>
            <span className="text-primary">Shot</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {["How It Works", "Features", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground/80 transition-all duration-200 hover:text-foreground hover:bg-black/[0.03]"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/desktop"
                className="text-[13px] font-semibold text-primary hover:underline px-2"
              >
                Go to Workspace
              </Link>
              <Button
                variant="outline"
                className="rounded-full px-4 text-[13px] font-semibold h-[34px]"
                onClick={handleSignOut}
              >
                Log Out
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              className="rounded-full px-5 text-[13px] font-semibold h-[34px] shadow-none flex items-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {loading ? "Connecting..." : "Sign In / Sign Up"}
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-black/[0.03] transition-colors cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-black/[0.04] px-6 pb-5 pt-1">
          <nav className="flex flex-col gap-1">
            {["How It Works", "Features", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:bg-black/[0.03] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </Link>
            ))}

            {user ? (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-black/[0.04]">
                <Link
                  href="/desktop"
                  className="rounded-lg px-3 py-2 text-[14px] font-semibold text-primary hover:bg-black/[0.03]"
                  onClick={() => setMobileOpen(false)}
                >
                  Go to Workspace
                </Link>
                <Button
                  variant="outline"
                  className="rounded-full text-[13px] font-semibold w-full h-10"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                className="rounded-full text-[13px] font-semibold mt-2 w-full h-10 flex items-center justify-center gap-2"
                onClick={() => {
                  setMobileOpen(false);
                  handleGoogleLogin();
                }}
                disabled={loading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {loading ? "Connecting..." : "Sign In / Sign Up"}
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
