import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import sharp from "sharp";
import {
  deductGenerationTokens,
  hasGenerationTokens,
  outOfTokensResponse,
} from "@/lib/generation-tokens";

export const runtime = "nodejs";

const BUCKET_NAME = "virtual-studio-assets";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const TARGET_GENDERS = ["Male", "Female", "Child"] as const;
const SKIN_TONES = [
  "Fair / Ivory",
  "Medium / Wheatish",
  "Warm Tan",
  "Deep / Dark Tan",
] as const;
const STUDIO_VIBES = [
  "Clean Minimalist White Studio",
  "Traditional & Authentic Ethnic Backdrop",
  "Urban Streetwear Concrete Vibe",
  "Warm Aesthetic Wooden Studio",
  "Luxury Editorial Dark Moody",
] as const;

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("Virtual model generation is missing Supabase configuration.");
      return NextResponse.json(
        { error: "Image generation is temporarily unavailable." },
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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    if (!(await hasGenerationTokens(supabaseAdmin, user.id))) {
      return outOfTokensResponse();
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const targetGender = TARGET_GENDERS.find(
      (gender) => gender === body?.targetGender,
    ) ?? "Male";
    const skinTone = SKIN_TONES.find(
      (tone) => tone === body?.skinTone,
    ) ?? "Medium / Wheatish";
    const poseStyle = STUDIO_VIBES.find(
      (vibe) => vibe === body?.poseStyle,
    ) ?? STUDIO_VIBES[0];

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

    const modelDescription =
      targetGender === "Child"
        ? "an age-appropriate child model"
        : `a fully clothed adult ${targetGender.toLowerCase()} model`;
    const prompt = [
  "Create a professional e-commerce apparel catalog product photograph from the supplied garment image.",
  "STRICT GARMENT FOCUS: Analyze the supplied image to determine if it is an upper-body garment, lower-body garment, or base-layer apparel. Render ONLY the specific garment category provided. Do not add unauthorized extra clothing items (such as adding jeans when a t-shirt is uploaded, or vice versa) that obscure or confuse the product being sold. Keep the focus entirely on showcasing the exact item uploaded.",
  `Showcase the garment cleanly using ${modelDescription} or a professional studio display form in a neutral, standard e-commerce presentation.`,
  "COMMERCIAL CATALOG STANDARD: For base-layer, intimate, or snug apparel items, treat them strictly as professional retail products displayed with complete modesty, using clean commercial catalog styling, neutral studio lighting, and standard apparel presentation guidelines.",
  `Use a ${skinTone.toLowerCase()} complexion styling (where applicable) and understated professional studio lighting.`,
  `Use a ${poseStyle.toLowerCase()} background style.`,
  "Keep the garment fully visible and strictly preserve its original color, print, pattern, fabric texture, and structural details without alteration.",
  "Use natural proportions and professional, family-friendly, age-appropriate styling.",
  "Return only the final commercial image without text, watermarks, or overlays.",
].join(" ");

    const sourceBuffer = Buffer.from(await garmentBlob.arrayBuffer());
const sourceJpeg = await sharp(sourceBuffer)
  .rotate()
  .resize({
    width: 2048,
    height: 2048,
    fit: "inside",
    withoutEnlargement: true,
  })
  .flatten({ background: "#ffffff" })
  .jpeg({ quality: 85, mozjpeg: true })
  .toBuffer();
const generationResponse = await openai.images.edit(
  {
    model: "gpt-image-2.5-sunburst",
    image: await toFile(sourceJpeg, "garment.jpg", { type: "image/jpeg" }),
        prompt,
        size: "1024x1536",
        output_format: "png",
      },
      { signal: AbortSignal.timeout(120_000) },
    );

    const imageData = generationResponse.data?.[0]?.b64_json;
    if (!imageData) {
      throw new Error("OpenAI did not return a generated model image.");
    }

    const imageMimeType = "image/png";
    const imageBuffer = Buffer.from(imageData, "base64");
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

    if (!(await deductGenerationTokens(supabaseAdmin, user.id))) {
      return outOfTokensResponse();
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
    if (
      error instanceof OpenAI.APIError &&
      (error.code === "content_policy_violation" ||
        error.code === "image_content_policy_violation" ||
        error.message.includes("request was rejected by the safety system"))
    ) {
      return NextResponse.json(
        {
          error:
            "The AI provider blocked this image during its safety check. Virtual try-on currently supports regular apparel; try a non-intimate garment such as a shirt or trousers.",
        },
        { status: 422 },
      );
    }

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
