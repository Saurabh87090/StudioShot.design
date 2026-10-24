// app/api/remove-bg/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

// Ensure environment variables exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase admin client with SERVICE ROLE KEY to bypass RLS on backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in before processing an image." },
        { status: 401 },
      );
    }

    const { imageUrl, fileName } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Image URL is required and must be a valid string URL" },
        { status: 400 },
      );
    }

    if (!/^https?:\/\//.test(imageUrl)) {
      return NextResponse.json(
        { error: "Invalid image_url: Please provide a valid URL." },
        { status: 400 },
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      console.error("Missing REMOVE_BG_API_KEY environment variable");
      return NextResponse.json(
        { error: "Remove.bg API key is not configured on server" },
        { status: 500 },
      );
    }

    // 1. Send image URL to Remove.bg API
    const removeBgResponse = await fetch(
      "https://api.remove.bg/v1.0/removebg",
      {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          size: "auto",
          format: "png",
        }),
      },
    );

    if (!removeBgResponse.ok) {
      const errorData = await removeBgResponse.json();
      console.error("Remove.bg API Error Response:", errorData);
      return NextResponse.json(
        {
          error: errorData.errors?.[0]?.title || "Failed to remove background",
        },
        { status: removeBgResponse.status },
      );
    }

    // 2. Convert response to Buffer (Binary PNG data)
    const arrayBuffer = await removeBgResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Sanitize filename to prevent path errors
    const sanitizedFileName = (fileName || "image.png").replace(
      /[^a-zA-Z0-9.-]/g,
      "_",
    );
    const processedFileName = `${user.id}/no-bg-${Date.now()}-${sanitizedFileName}`;

    // 3. Upload transparent image to Supabase "processed-image" bucket
    const { error: uploadError } = await supabase.storage
      .from("processed-image") // Fixed bucket name (singular)
      .upload(processedFileName, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      return NextResponse.json(
        { error: `Supabase Upload Failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // 4. Get Public URL for the processed image
    const { data: publicUrlData } = supabase.storage
      .from("processed-image") // Fixed bucket name (singular)
      .getPublicUrl(processedFileName);

    return NextResponse.json({
      success: true,
      processedImageUrl: publicUrlData.publicUrl,
      fileName: processedFileName,
    });
  } catch (error: unknown) {
    console.error("Remove BG route handler error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
