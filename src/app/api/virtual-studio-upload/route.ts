import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const BUCKET_NAME = "virtual-studio-assets";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("Virtual studio upload is missing Supabase server configuration.");
      return NextResponse.json(
        { error: "Image uploads are temporarily unavailable." },
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
        { error: "Sign in before uploading an image." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose an image file to upload." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files can be uploaded." },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Choose an image smaller than 10 MB." },
        { status: 400 },
      );
    }

    const extension =
      file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ||
      "image";
    const storagePath = `${user.id}/garments/${crypto.randomUUID()}.${extension}`;
    const storage = createClient(supabaseUrl, serviceRoleKey).storage;
    const { error: uploadError } = await storage
      .from(BUCKET_NAME)
      .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Virtual studio Supabase upload failed:", uploadError.message);
      return NextResponse.json(
        { error: "Supabase could not save the image. Please try again." },
        { status: 502 },
      );
    }

    const { data, error: urlError } = await storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 60 * 60);

    if (urlError || !data?.signedUrl) {
      console.error(
        "Virtual studio signed URL creation failed:",
        urlError?.message ?? "No signed URL returned",
      );
      return NextResponse.json(
        { error: "The image uploaded, but its preview could not be created." },
        { status: 502 },
      );
    }

    return NextResponse.json({ imageUrl: data.signedUrl, storagePath });
  } catch (error) {
    console.error("Virtual studio upload route failed:", error);
    return NextResponse.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 },
    );
  }
}
