import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface Feature {
  title: string;
  desc?: string;
}

interface GeminiGenerateContentResponse {
  error?: { message?: string };
  promptFeedback?: { blockReason?: string };
  candidates?: Array<{
    finishReason?: string;
    finishMessage?: string;
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType?: string; data?: string };
      }>;
    };
    safetyRatings?: Array<{
      category?: string;
      probability?: string;
      blocked?: boolean;
    }>;
  }>;
}

const GEMINI_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/bmp",
  "image/tiff",
] as const;

type GeminiImageMimeType = (typeof GEMINI_IMAGE_MIME_TYPES)[number];

function isGeminiImageMimeType(
  mimeType: string,
): mimeType is GeminiImageMimeType {
  return (GEMINI_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

function getGeminiImageMimeType(mimeType: string): GeminiImageMimeType {
  if (!isGeminiImageMimeType(mimeType)) {
    throw new Error(`Unsupported image format for Gemini: ${mimeType}`);
  }

  return mimeType;
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sign in before generating an infographic." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const storagePath =
      typeof body?.storagePath === "string" ? body.storagePath : "";
    const brandLogoPath =
      typeof body?.brandLogoPath === "string" ? body.brandLogoPath.trim() : "";
    const selectedFont =
      typeof body?.selectedFont === "string" ? body.selectedFont : "'Poppins', sans-serif";
    const productTitle =
      typeof body?.productTitle === "string" ? body.productTitle.trim() : "";
    const backgroundStyle =
      typeof body?.backgroundStyle === "string"
        ? body.backgroundStyle
        : "white";
    const platform =
      typeof body?.platform === "string" ? body.platform : "meesho";
    const category =
      typeof body?.category === "string" ? body.category : "General";

    const features: Feature[] = Array.isArray(body?.features)
      ? body.features.filter(
          (feature: unknown): feature is Feature =>
            typeof feature === "object" &&
            feature !== null &&
            "title" in feature &&
            typeof feature.title === "string" &&
            feature.title.trim().length > 0 &&
            (!("desc" in feature) || typeof feature.desc === "string"),
        )
      : [];

    if (
      !storagePath.startsWith(`${user.id}/inputs/`) ||
      (brandLogoPath && !brandLogoPath.startsWith(`${user.id}/inputs/`)) ||
      !productTitle
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid uploaded image and product title are required.",
        },
        { status: 400 },
      );
    }

    if (!geminiApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured on the server.",
        },
        { status: 500 },
      );
    }

    // 1. Fetch the signed-in user's product image from Supabase.
    const { data: sourceImage, error: sourceError } = await supabase.storage
      .from("infographic-assets")
      .download(storagePath);
    if (sourceError || !sourceImage) {
      throw new Error(
        "The uploaded source image could not be fetched from storage.",
      );
    }

    const sourceBuffer = Buffer.from(await sourceImage.arrayBuffer());
    const mimeType = sourceImage.type || "image/png";

    // Fetch the user's logo when supplied; never silently generate without it.
    let logoInlineData: { mimeType: GeminiImageMimeType; data: string } | null =
      null;
    if (brandLogoPath) {
      const { data: logoImage, error: logoError } = await supabase.storage
        .from("infographic-assets")
        .download(brandLogoPath);

      if (logoError || !logoImage) {
        throw new Error(
          `The uploaded brand logo could not be fetched from storage${logoError ? `: ${logoError.message}` : "."}`,
        );
      }

      const logoBuffer = Buffer.from(await logoImage.arrayBuffer());
      const logoMime = getGeminiImageMimeType(logoImage.type || "image/png");
      logoInlineData = {
        mimeType: logoMime,
        data: logoBuffer.toString("base64"),
      };
    }

    const featureLines =
      features.length > 0
        ? features
            .map(
              (feature, index) =>
                `${index + 1}. ${feature.title}${feature.desc ? ` — ${feature.desc}` : ""}`,
            )
            .join("\n")
        : "No feature copy provided.";

    // Clean font family string for prompt instruction
    const fontNameClean = selectedFont.replace(/['",]/g, "").trim();

    let bgDescription = "clean minimalist professional studio background with soft natural daylight, subtle surface reflections, and realistic contact shadows";
    if (backgroundStyle === "dark") {
      bgDescription = "luxury dark moody cinematic studio background with dramatic rim lighting, deep shadows, glossy dark podium, and premium high-end atmospheric haze";
    } else if (backgroundStyle === "luxury") {
      bgDescription = "luxurious gold and marble premium podium setup with warm spotlight, glossy reflections, and elite commercial aesthetics";
    } else if (backgroundStyle === "nature") {
      bgDescription = "organic natural environment with raw stone textures, polished wood elements, green leaves, and soft sun rays";
    } else if (backgroundStyle === "tech") {
      bgDescription = "futuristic high-tech cyberpunk laboratory setup with glowing neon blue and purple ambient lighting, sleek metallic grid floor";
    } else if (backgroundStyle === "vibrant") {
      bgDescription = "vibrant e-commerce pop background with bright pastel color gradients, studio softboxes, and dynamic commercial depth";
    }

    const aspectRatio = ["amazon", "flipkart", "blinkit"].includes(
      platform.toLowerCase(),
    )
      ? "1:1"
      : "3:4";
    const prompt = [
      `Create a premium, high-end product infographic for the ${category} category. Compose the design specifically for a ${aspectRatio} canvas with balanced, polished commercial art direction.`,
      `PRODUCT REFERENCE: The first attached image is the user's product photo. Use it as the source of truth. Preserve the product's identity, shape, proportions, colors, packaging, and visible product branding. Present the product upright in its natural intended orientation, standing securely on a suitable surface or tasteful pedestal; do not show it lying down, floating, or at an impossible angle. Do not redesign, distort, crop, or cover it.`,
      `SCENE AND BACKGROUND: Set the product against ${bgDescription}. Add a small number of tasteful, category-relevant visual elements that make the scene feel connected to the product and add depth. Keep these props and decorative details secondary, realistic, and clear of the product and all text.`,
      `INFORMATION HIERARCHY: Reserve a clean header area. Set the exact product or brand name "${productTitle}" as the most prominent text, near the top center. Use a font style inspired by ${fontNameClean}; choose a font size readable at mobile scale, with clear contrast and comfortable spacing. Keep all text inside the canvas without clipping or overlap. Add a subtle divider only if it improves the layout.`,
      logoInlineData
        ? `USER BRAND LOGO: The second attached image is the logo uploaded by the user. Use this exact supplied logo artwork as the brand logo. Place it neatly in the header at the top-left or top-right, choosing the side opposite the product-name text when that gives the cleanest balance. Keep it smaller than the product name, fully visible, sharp, and inside the canvas with safe margins. Preserve its original shape, proportions, colors, and lettering; do not substitute, redraw, reinterpret, duplicate, or omit it.`
        : `USER BRAND LOGO: No logo image was supplied. Do not invent a logo.`,
      `Do not include marketplace, retailer, or platform names, logos, badges, or branding anywhere in the image. The selected marketplace only determines the output canvas shape; it is not the brand and must not appear as image text.`,
      `FEATURE INFOGRAPHICS: Present the supplied feature copy as a small set of concise, legible callouts around the product, aligned to the left and right where space allows. Use simple relevant icons and fine pointer lines only when they improve clarity. Keep callouts visually consistent, avoid crowding, and never obscure the product.`,
      `Use only the feature titles and descriptions below. Include each once, preserve their meaning, and do not invent specifications, benefits, slogans, or other claims:`,
      featureLines,
      `FINAL ART DIRECTION: Make the result feel cohesive, refined, and high quality, with deliberate spacing, clear text hierarchy, suitable font sizing, realistic product lighting, and harmonious colors. Return one finished image composed for the ${aspectRatio} canvas.`,
    ].join("\n\n");

    const generationResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { text: "Product photo reference:" },
                {
                  inlineData: {
                    mimeType: getGeminiImageMimeType(mimeType),
                    data: sourceBuffer.toString("base64"),
                  },
                },
                ...(logoInlineData
                  ? [
                      { text: "User-uploaded brand logo reference. Use this logo in the final image as instructed:" },
                      {
                        inlineData: {
                          mimeType: logoInlineData.mimeType,
                          data: logoInlineData.data,
                        },
                      },
                    ]
                  : []),
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio },
          },
        }),
        signal: AbortSignal.timeout(120_000),
      },
    );

    const responseText = await generationResponse.text();
    let generationData: GeminiGenerateContentResponse;
    try {
      generationData = JSON.parse(responseText);
    } catch {
      console.error(
        "Gemini returned an unreadable infographic response:",
        generationResponse.status,
      );
      return NextResponse.json(
        { success: false, error: "Gemini returned an unreadable response. Please try again." },
        { status: 502 },
      );
    }

    if (!generationResponse.ok) {
      const message =
        generationData.error?.message || "Gemini image generation failed.";
      console.error("Gemini infographic generation request failed:", {
        status: generationResponse.status,
        message,
      });
      return NextResponse.json(
        { success: false, error: message },
        { status: 502 },
      );
    }

    const imageOutput = generationData.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .find((part) => part.inlineData?.data)?.inlineData;

    if (!imageOutput?.data) {
      const finishReason = generationData.candidates?.[0]?.finishReason;
      const finishMessage = generationData.candidates?.[0]?.finishMessage;
      const blockReason = generationData.promptFeedback?.blockReason;
      const textResponse = generationData.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter((text): text is string => Boolean(text))
        .join("\n");
      const reason = finishMessage || blockReason || finishReason || textResponse;
      const message = reason
        ? `Gemini did not return an image: ${reason}`
        : "Gemini did not return an image. Please try again.";
      console.error("Gemini returned no infographic image:", {
        blockReason,
        finishReason,
        finishMessage,
        textResponse,
        safetyRatings: generationData.candidates?.[0]?.safetyRatings,
      });
      return NextResponse.json(
        { success: false, error: message },
        { status: 422 },
      );
    }

    const imageBuffer = Buffer.from(imageOutput.data, "base64");
    const outputMimeType = imageOutput.mimeType || "image/jpeg";
    const outputExtension =
      outputMimeType === "image/png"
        ? "png"
        : outputMimeType === "image/jpeg"
          ? "jpg"
          : null;

    if (!outputExtension) {
      throw new Error(
        `Gemini returned an unsupported image format: ${outputMimeType}`,
      );
    }

    const outputFileName = `${user.id}/generated/infographic-${randomUUID()}.${outputExtension}`;
    const bucketNames = [
      "processed-infographic-image",
      "processed-image",
      "processed-images",
    ];
    let publicUrl = "";
    let lastUploadError: Error | null = null;

    for (const bucketName of bucketNames) {
      try {
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(outputFileName, imageBuffer, {
            contentType: outputMimeType,
            upsert: true,
          });

        if (uploadError) {
          lastUploadError = new Error(uploadError.message);
          continue;
        }

        const { data: finalUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(outputFileName);

        publicUrl = finalUrlData.publicUrl;
        break;
      } catch (storageError) {
        lastUploadError =
          storageError instanceof Error
            ? storageError
            : new Error("Storage upload failed.");
      }
    }

    if (!publicUrl) {
      throw (
        lastUploadError ||
        new Error(
          "No compatible storage bucket was available for the generated infographic.",
        )
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (error: unknown) {
    console.error("Infographic generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate infographic",
      },
      { status: 500 },
    );
  }
}