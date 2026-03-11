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
  title:
    "StudioShot — AI Product Photography for E-Commerce Sellers | Background Removal & Studio Lighting in Seconds",
  description:
    "Turn phone photos into professional product images instantly. StudioShot uses AI to remove backgrounds, fix lighting, and create marketplace-ready photos for Amazon, Shopify, and Etsy — starting free. No studio, no photographer, no Photoshop needed.",
  keywords: [
    "AI product photography",
    "product photo background removal",
    "e-commerce product photos",
    "Amazon product photography",
    "white background product photos",
    "product photo editor",
    "AI background remover",
    "Shopify product photos",
    "Etsy product photography",
    "professional product photos without studio",
    "product image editing tool",
    "marketplace ready photos",
    "bulk product photo editing",
    "product photography tool for sellers",
    "remove background from product photo",
    "studio quality product photos",
    "product listing images",
    "e-commerce image optimization",
  ],
  icons: {
    icon: "/logo-icon.svg",
  },
  openGraph: {
    title: "StudioShot — Turn Phone Photos Into Studio-Quality Product Images",
    description:
      "Professional product photography costs $25-$50 per image. StudioShot does it in seconds with AI — background removal, studio lighting, and platform-ready export for Amazon, Shopify & Etsy.",
    type: "website",
    locale: "en_US",
    siteName: "StudioShot",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudioShot — AI Product Photography for E-Commerce",
    description:
      "Stop losing sales to bad product photos. Turn any phone photo into a studio-quality, marketplace-ready image in under 3 seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://studioshot.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "StudioShot",
              applicationCategory: "PhotographyApplication",
              operatingSystem: "Web",
              description:
                "AI-powered product photography tool that turns phone photos into studio-quality, marketplace-ready e-commerce images in seconds.",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  name: "Starter",
                  description: "5 free images per month",
                },
                {
                  "@type": "Offer",
                  price: "19",
                  priceCurrency: "USD",
                  name: "Pro",
                  description: "150 images per month with batch processing",
                },
                {
                  "@type": "Offer",
                  price: "49",
                  priceCurrency: "USD",
                  name: "Business",
                  description:
                    "Unlimited images with API access and team seats",
                },
              ],
              featureList: [
                "AI Background Removal",
                "Studio Lighting Correction",
                "Amazon White Background Compliance",
                "Batch Product Photo Processing",
                "Soft Shadow Generation",
                "Platform-Ready Export for Amazon, Shopify, Etsy",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How much does professional product photography cost?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Professional product photography typically costs $25-$70 per image with turnaround times of 2-10 weeks. StudioShot offers the same quality starting free, with results in under 3 seconds.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does StudioShot create Amazon-compliant white background images?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. StudioShot generates pure white (RGB 255,255,255) backgrounds that meet Amazon's strict main image requirements, so your listings won't get rejected.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I use my phone to take product photos?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "StudioShot is specifically designed for phone photos. No DSLR, lightbox, or photo studio needed. Just snap a photo and upload it.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How is StudioShot different from remove.bg or Photoroom?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "StudioShot goes beyond background removal. It also corrects lighting, adjusts color temperature, generates natural shadows, and exports in platform-specific formats — all in one step.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <WaitlistProvider>{children}</WaitlistProvider>
      </body>
    </html>
  );
}
