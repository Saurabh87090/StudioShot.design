import { NextResponse } from "next/server";
import { saveListingToSupabase, supabaseAdmin } from "@/lib/supabase-listing";
import { randomUUID } from "node:crypto";
import { getAuthenticatedUser } from "@/lib/supabase-auth";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import sharp from "sharp";
import {
  deductGenerationTokens,
  hasGenerationTokens,
  outOfTokensResponse,
} from "@/lib/generation-tokens";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sign in before generating a listing image." },
        { status: 401 },
      );
    }

    if (!(await hasGenerationTokens(supabaseAdmin, user.id))) {
      return outOfTokensResponse();
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "A product image is required." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "The uploaded file must be an image." },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Choose an image smaller than 15 MB." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured on the server.",
        },
        { status: 500 },
      );
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const platform = String(formData.get("platform") || "Amazon");
    const aspectRatio = String(formData.get("aspectRatio") || "1:1");
    const platformRules = String(formData.get("platformRules") || "");
    const background = String(formData.get("background") || "Pure White");
    const enhanceLighting = formData.get("enhanceLighting") !== "false";
    const addShadow = formData.get("addShadow") !== "false";
    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const sourceExtension =
      file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "image";
    const originalFileName = `${user.id}/original-${randomUUID()}.${sourceExtension}`;
    const { error: originalUploadError } = await supabaseAdmin.storage
      .from("marketplace-listings")
      .upload(originalFileName, sourceBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (originalUploadError) {
      throw new Error(
        `Could not save the original image: ${originalUploadError.message}`,
      );
    }

    const { data: originalUrlData } = supabaseAdmin.storage
      .from("marketplace-listings")
      .getPublicUrl(originalFileName);

   const prompt = [
  "Create a flawless, studio-grade photorealistic e-commerce product photograph using the attached image as the base.",
  "Professional Product Retouching & Cleaning: Thoroughly clean and restore the product surface. Remove any dirt, grime, dust, smudges, stains, or minor surface scratches present in the source image. Make the product look brand new, polished, and pristine while strictly preserving its original identity, geometry, colors, branding, labels, and unique details. Do not add unwanted text or extra objects.",
  `Use a strict ${aspectRatio} aspect ratio layout and a ${background} background style.`,
  `Optimize the composition for ${platform}. ${platformRules}`,
  `Studio lighting enhancement: ${enhanceLighting ? "enabled" : "disabled"}.`,
  `Realistic contact shadow: ${addShadow ? "enabled" : "disabled"}.`,
  "Return only the finished image.",
].join(" ");

    const sourcePng = await sharp(sourceBuffer).png().toBuffer();
    const aspectRatioSizes: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "3:4": { width: 768, height: 1024 },
      "4:3": { width: 1024, height: 768 },
      "16:9": { width: 1536, height: 864 },
      "9:16": { width: 576, height: 1024 },
    };
    const targetSize = aspectRatioSizes[aspectRatio] ?? aspectRatioSizes["1:1"];
    const outputSize =
      aspectRatio === "1:1"
        ? "1024x1024"
        : aspectRatio === "4:3" || aspectRatio === "16:9"
          ? "1536x1024"
          : "1024x1536";
    const generationResponse = await openai.images.edit(
      {
        model: "gpt-image-2.5-sunburst",
        image: await toFile(sourcePng, "product.png", { type: "image/png" }),
        prompt,
        size: outputSize,
        output_format: "png",
      },
      { signal: AbortSignal.timeout(120_000) },
    );

    const imageData = generationResponse.data?.[0]?.b64_json;
    if (!imageData) {
      throw new Error("OpenAI did not return a generated image.");
    }

    const imageBuffer = await sharp(Buffer.from(imageData, "base64"))
      .resize({ ...targetSize, fit: "cover" })
      .png()
      .toBuffer();
    const contentType = "image/png";

    const { processedImageUrl } = await saveListingToSupabase({
      userId: user.id,
      imageBuffer,
      mimeType: contentType,
      platform,
      backgroundStyle: background,
      originalImageUrl: originalUrlData.publicUrl,
    });

    if (!(await deductGenerationTokens(supabaseAdmin, user.id))) {
      return outOfTokensResponse();
    }

    return NextResponse.json({
      success: true,
      processedImageUrl,
    });
  } catch (error: unknown) {
    console.error("Listing generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 },
    );
  }
}