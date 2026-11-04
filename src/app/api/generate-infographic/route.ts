import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { getAuthenticatedUser } from "@/lib/supabase-auth";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { Jimp } from "jimp";
import {
  deductGenerationTokens,
  hasGenerationTokens,
  outOfTokensResponse,
} from "@/lib/generation-tokens";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface Feature {
  title: string;
  desc?: string;
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

    if (!(await hasGenerationTokens(supabase, user.id))) {
      return outOfTokensResponse();
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured on the server.",
        },
        { status: 500 },
      );
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    let logoBuffer: Buffer | null = null;
    if (brandLogoPath) {
      const { data: logoImage, error: logoError } = await supabase.storage
        .from("infographic-assets")
        .download(brandLogoPath);

      if (logoError || !logoImage) {
        throw new Error(
          `The uploaded brand logo could not be fetched from storage${logoError ? `: ${logoError.message}` : "."}`,
        );
      }

      logoBuffer = Buffer.from(await logoImage.arrayBuffer());
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
  `Create a premium, minimalistic product infographic for the "${category}" category. Design it like a world-class senior graphic designer, optimized specifically for a ${aspectRatio} canvas. Focus on a clean aesthetic, generous negative space, crisp layout, and zero clutter.`,
  
  `PRODUCT REFERENCE & PROFESSIONAL RETOUCHING: The first attached image is the primary product photo. Treat it as the absolute source of truth for its core identity, shape, proportions, colors, packaging, and visible branding. Thoroughly clean and restore the product surface: remove any dust, dirt, grime, smudges, stains, or minor surface scratches present in the source image, making the product look brand new, polished, and pristine. Present the product upright in its natural intended orientation, standing securely on a sleek pedestal or minimal surface. Do not distort, crop, cover, or alter its structural geometry.`,
  
  `MINIMALIST SCENE & CATEGORY-SPECIFIC PROPS: Set the product against ${bgDescription}. Intelligently incorporate subtle, highly relevant micro-elements tailored specifically to the "${category}" category (e.g., natural botanical shadows for skincare, soft satin textures for luxury items, clean water droplets, or minimal stone textures). Keep all decorative props secondary, highly refined, minimal, and completely out of the way of the product and text.`,
  
  `INFORMATION HIERARCHY: Reserve a clean, uncluttered header area. Set the exact title "${productTitle}" as the primary heading near the top using a modern typography style inspired by ${fontNameClean}. Ensure high contrast, perfect letter spacing, and crisp mobile readability without clipping or overlapping.`,
  
  logoBuffer
    ? `USER BRAND LOGO: The second attached image is the user's official brand logo. As a pro designer, integrate this exact logo artwork naturally into the composition at the most visually balanced and suitable location (e.g., top-left, top-right header, or subtly anchored near the bottom/pedestal). Preserve its exact shape, proportions, colors, and typography. Ensure it remains crisp, elegant, fully legible, and perfectly aligned.`
    : `USER BRAND LOGO: No logo image was supplied. Do not invent, insert, or generate any placeholder logos.`,
  
  `Do not include any third-party marketplace, retailer, or platform names, badges, or logos anywhere in the design.`,
  
  `FEATURE INFOGRAPHICS: Layout the feature copy below as clean, minimalist callout badges or sleek bullet points around the product. Use refined, modern icons and fine pointer lines only where necessary. Maintain visual harmony, equal margins, and absolute clarity.`,
  
  `Use only the supplied feature copy below. Do not fabricate extra claims or text:`,
  
  featureLines,
  
  `FINAL ART DIRECTION: Produce an ultra-sleek, professional graphic designer output with realistic soft studio lighting, crisp typography hierarchy, harmonious color palette, and zero visual clutter. Return only the finished image for the ${aspectRatio} canvas.`,
].join("\n\n");

    const inputImages = [
      await toFile(
        await (await Jimp.read(sourceBuffer)).getBuffer("image/png"),
        "product.png",
        { type: "image/png" },
      ),
    ];
    if (logoBuffer) {
      inputImages.push(
        await toFile(
          await (await Jimp.read(logoBuffer)).getBuffer("image/png"),
          "brand-logo.png",
          { type: "image/png" },
        ),
      );
    }

    let generationError: string | null = null;
    const generationResponse = await openai.images
      .edit(
        {
          model: "gpt-image-2.5-sunburst",
          image: inputImages,
          prompt,
          size: aspectRatio === "1:1" ? "1024x1024" : "1024x1536",
          output_format: "png",
        },
        { signal: AbortSignal.timeout(120_000) },
      )
      .catch((error: unknown) => {
        if (!(error instanceof OpenAI.APIError)) {
          throw error;
        }

        generationError = error.message || "OpenAI image generation failed.";
        console.error("OpenAI infographic generation request failed:", {
          status: error.status,
          message: generationError,
        });
        return null;
      });

    if (!generationResponse) {
      return NextResponse.json(
        {
          success: false,
          error: generationError || "OpenAI image generation failed.",
        },
        { status: 502 },
      );
    }

    const imageData = generationResponse.data?.[0]?.b64_json;
    if (!imageData) {
      console.error("OpenAI returned no infographic image.");
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI did not return an image. Please try again.",
        },
        { status: 422 },
      );
    }

    const generatedImage = await Jimp.read(Buffer.from(imageData, "base64"));
    generatedImage.cover({
      w: aspectRatio === "1:1" ? 1024 : 768,
      h: 1024,
    });
    const imageBuffer = await generatedImage.getBuffer("image/png");
    const outputMimeType = "image/png";
    const outputExtension = "png";

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

    if (!(await deductGenerationTokens(supabase, user.id))) {
      return outOfTokensResponse();
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