import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const agentManifest = {
    schema_version: "v1.0",
    name: "StudioShot AI Agentic Commerce Interface",
    description:
      "Machine-readable API capabilities specification for AI agents seeking e-commerce product image enhancement, infographic generation, and virtual model styling.",
    vendor: "StudioShot AI",
    homepage: "https://studioshot.ai",
    capabilities: [
      {
        id: "generate_infographic",
        name: "E-commerce Infographic Generation",
        description:
          "Generates 3:4 portrait listing infographics with custom typography, background studio environments, brand logo overlays, and feature callout badges.",
        endpoint: "/api/generate-infographic",
        method: "POST",
        parameters: {
          storagePath: {
            type: "string",
            required: true,
            description: "Supabase storage path of the uploaded product photo.",
          },
          productTitle: {
            type: "string",
            required: true,
            description: "Product or brand title to display on top header.",
          },
          brandLogoPath: {
            type: "string",
            required: false,
            description: "Optional storage path for brand logo overlay.",
          },
          selectedFont: {
            type: "string",
            required: false,
            default: "Poppins",
            description: "Font style for typography title.",
          },
          backgroundStyle: {
            type: "string",
            enum: ["white", "dark", "luxury", "nature", "tech", "vibrant"],
            default: "white",
            description: "Studio background environment style.",
          },
          features: {
            type: "array",
            items: {
              title: "string",
              desc: "string (optional)",
            },
            description: "List of unique product feature callout badges.",
          },
        },
        output_format: {
          aspect_ratio: "3:4",
          orientation: "portrait",
          mime_type: "image/jpeg",
        },
      },
    ],
  };

  return NextResponse.json(agentManifest, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}