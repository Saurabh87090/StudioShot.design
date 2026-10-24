import { NextResponse } from "next/server";
import { saveListingToSupabase, supabaseAdmin } from "@/lib/supabase-listing";
import { randomUUID } from "node:crypto";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

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

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured on the server.",
        },
        { status: 500 },
      );
    }

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
      "Create a photorealistic e-commerce studio product photograph using the attached image.",
      "Keep the product itself faithful to the source: preserve its identity, geometry, colors, branding, labels, and details; do not add text or extra objects.",
      `Use a strict ${aspectRatio} aspect ratio layout and a ${background} background style.`,
      `Optimize the composition for ${platform}. ${platformRules}`,
      `Studio lighting enhancement: ${enhanceLighting ? "enabled" : "disabled"}.`,
      `Realistic contact shadow: ${addShadow ? "enabled" : "disabled"}.`,
      "Return only the finished image.",
    ].join(" ");

    const generationResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: file.type,
                    data: sourceBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: aspectRatio, // <-- Yeh line ab marketplace ke selected aspect ratio ko strictly enforce karegi!
            },
          },
        }),
      },
    );

    const responseText = await generationResponse.text();
    let generationData: {
      error?: { message?: string };
      candidates?: Array<{
        content?: {
          parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }>;
        };
      }>;
    };
    try {
      generationData = JSON.parse(responseText);
    } catch {
      throw new Error("Gemini returned an unreadable response.");
    }

    if (!generationResponse.ok) {
      throw new Error(
        generationData.error?.message || "Gemini image generation failed.",
      );
    }

    const imagePart = generationData.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData?.data,
    )?.inlineData;
    if (!imagePart?.data) {
      throw new Error("Gemini did not return a generated image.");
    }

    const imageBuffer = Buffer.from(imagePart.data, "base64");
    const contentType = imagePart.mimeType || "image/png";

    const { processedImageUrl } = await saveListingToSupabase({
      userId: user.id,
      imageBuffer,
      mimeType: contentType,
      platform,
      backgroundStyle: background,
      originalImageUrl: originalUrlData.publicUrl,
    });

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