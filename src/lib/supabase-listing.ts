import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS checks completely
);

export async function saveListingToSupabase({
  userId,
  imageBuffer,
  mimeType,
  platform,
  backgroundStyle,
  originalImageUrl,
}: {
  userId: string;
  imageBuffer: Buffer;
  mimeType: string;
  platform: string;
  backgroundStyle: string;
  originalImageUrl: string;
}) {
  const extension =
    mimeType.split("/")[1]?.replace(/[^a-zA-Z0-9]/g, "") || "png";
  const fileName = `${userId}/generated/${randomUUID()}.${extension}`;

  // 1. Upload Buffer to Supabase Storage using admin client
  const { error: uploadError } = await supabaseAdmin.storage
    .from("marketplace-listings")
    .upload(fileName, imageBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase Upload Error: ${uploadError.message}`);
  }

  // 2. Get the PUBLIC accessible URL using admin client
  const { data: urlData } = supabaseAdmin.storage
    .from("marketplace-listings")
    .getPublicUrl(fileName);

  const processedImageUrl = urlData.publicUrl;

  // 3. Save Record in PostgreSQL Database Table using admin client
  const { error: dbError } = await supabaseAdmin.from("listings").insert({
    user_id: userId,
    platform,
    background_style: backgroundStyle,
    original_image_url: originalImageUrl,
    processed_image_url: processedImageUrl,
  });

  if (dbError) {
    console.error("Database Insert Warning:", dbError.message);
  }

  return { processedImageUrl };
}