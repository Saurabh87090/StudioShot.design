import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { WaitlistProvider } from "@/components/waitlist-modal";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StudioShot — Phone Photo. Studio Result.",
  description:
    "Upload any product photo taken with your phone. StudioShot removes the background, perfects the lighting, and delivers a clean, professional image ready for any e-commerce platform — in seconds.",
  icons: {
    icon: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <WaitlistProvider>{children}</WaitlistProvider>
      </body>
    </html>
  );
}
