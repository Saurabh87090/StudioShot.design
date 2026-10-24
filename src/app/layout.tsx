import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
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
  // AEO JSON-LD Structured Data for AI Search & Answer Engines
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "StudioShot AI",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web Browser",
    "description":
      "StudioShot AI transforms phone photos into high-converting e-commerce product infographics, listing banners, and virtual model lookbooks.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "E-commerce Infographic Generation",
      "AI Virtual Model Studio",
      "Custom Brand Logo Overlay",
      "21 Curated Fonts Selection",
      "Strict 3:4 Portrait Aspect Ratio Enforcement",
    ],
  };

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Cinzel:wght@600&family=Dancing+Script:wght@700&family=Fira+Code&family=Inter:wght@400;600;700&family=Lobster&family=Merriweather:wght@700&family=Montserrat:wght@600;700&family=Oswald:wght@600&family=Pacifico&family=Playfair+Display:wght@700&family=Poppins:wght@600;700&family=Quicksand:wght@600&family=Raleway:wght@600&family=Ubuntu:wght@700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        <link rel="agent-manifest" href="/api/agent/manifest" />
      </head>
      <body className={`${spaceGrotesk.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}