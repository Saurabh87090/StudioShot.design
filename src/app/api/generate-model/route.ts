import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const BUCKET_NAME = "virtual-studio-assets";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

type GeminiResponse = {
  error?: { message?: string };
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { mimeType?: string; data?: string };
      }>;
    };
  }>;
};

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const geminiApiKey =
      process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("Virtual model generation is missing Supabase configuration.");
      return NextResponse.json(
        { error: "Image generation is temporarily unavailable." },
        { status: 500 },
      );
    }

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    });
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sign in before generating a model image." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const storagePath =
      typeof body?.storagePath === "string" ? body.storagePath : "";
    if (
      !storagePath.startsWith(`${user.id}/garments/`) ||
      storagePath.slice(`${user.id}/garments/`.length).includes("/")
    ) {
      return NextResponse.json(
        { error: "A valid uploaded garment image is required." },
        { status: 400 },
      );
    }

    const targetGender =
      typeof body?.targetGender === "string" ? body.targetGender : "Male";
    const skinTone =
      typeof body?.skinTone === "string" ? body.skinTone : "Medium / Wheatish";
    const poseStyle =
      typeof body?.poseStyle === "string"
        ? body.poseStyle
        : "Clean Minimalist White Studio";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: garmentBlob, error: downloadError } =
      await supabaseAdmin.storage.from(BUCKET_NAME).download(storagePath);

    if (downloadError || !garmentBlob) {
      console.error(
        "Virtual model source image download failed:",
        downloadError?.message ?? "No image returned from storage",
      );
      return NextResponse.json(
        { error: "The uploaded garment image could not be loaded." },
        { status: 502 },
      );
    }

    if (garmentBlob.size === 0 || garmentBlob.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Choose an image smaller than 10 MB." },
        { status: 400 },
      );
    }

    const mimeType = garmentBlob.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "The uploaded file must be an image." },
        { status: 400 },
      );
    }

    const prompt = [
  "Create a photorealistic, high-end e-commerce fashion photograph using the attached garment image.",
  `Digitally fit and drape the garment naturally onto a real, realistic ${targetGender.toLowerCase()} human model torso (headless/cropped to focus on apparel).`,
  `Apply a natural ${skinTone.toLowerCase()} skin tone with realistic skin texture and subtle studio lighting highlights.`,
  `Set the scene against a professional, realistic ${poseStyle.toLowerCase()} background with depth and realistic soft shadows on the floor/wall.`,
  "Enhance and clean up the garment image: remove accidental wrinkles, creases, lint, and distortion while strictly preserving the original fabric color, print, pattern, material texture, and overall design integrity.",
  "Ensure a tailored, flawless fit that looks like a high-fashion brand catalog shoot.",
  "Return only the final high-resolution rendered image without text, watermarks, or extra accessories.",
].join(" ");

    const generationResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
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
                {
                  inlineData: {
                    mimeType,
                    data: Buffer.from(await garmentBlob.arrayBuffer()).toString(
                      "base64",
                    ),
                  },
                },
              ],
            },
          ],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
        signal: AbortSignal.timeout(120_000),
      },
    );

    const responseText = await generationResponse.text();
    let generationData: GeminiResponse;
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

    const imageMimeType = imagePart.mimeType || "image/png";
    if (!imageMimeType.startsWith("image/")) {
      throw new Error("Gemini returned an unsupported image format.");
    }

    const imageBuffer = Buffer.from(imagePart.data, "base64");
    const extension =
      imageMimeType.split("/")[1]?.replace(/[^a-zA-Z0-9]/g, "") || "png";
    const generatedStoragePath = `${user.id}/generated/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(generatedStoragePath, imageBuffer, {
        contentType: imageMimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Virtual model result upload failed:", uploadError.message);
      throw new Error("The generated image could not be saved. Please try again.");
    }

    const [{ data: generatedUrlData, error: generatedUrlError }, { data: sourceUrlData }] =
      await Promise.all([
        supabaseAdmin.storage
          .from(BUCKET_NAME)
          .createSignedUrl(generatedStoragePath, 24 * 60 * 60),
        supabaseAdmin.storage
          .from(BUCKET_NAME)
          .createSignedUrl(storagePath, 24 * 60 * 60),
      ]);

    if (generatedUrlError || !generatedUrlData?.signedUrl) {
      console.error(
        "Virtual model result URL creation failed:",
        generatedUrlError?.message ?? "No signed URL returned",
      );
      throw new Error("The generated image was saved, but its preview could not be created.");
    }

    const { error: databaseError } = await supabaseAdmin
      .from("virtual_model_generations")
      .insert({
        target_gender: targetGender,
        skin_tone: skinTone,
        pose_style: poseStyle,
        original_garment_url: sourceUrlData?.signedUrl ?? storagePath,
        processed_image_url: generatedUrlData.signedUrl,
        status: "completed",
      });

    if (databaseError) {
      console.error("Virtual model generation database log failed:", databaseError.message);
    }

    return NextResponse.json({
      success: true,
      generatedImageUrl: generatedUrlData.signedUrl,
      generatedStoragePath,
    });
  } catch (error) {
    console.error("Virtual model generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Image generation failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
