import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BUCKET_NAME = "virtual-studio-assets";

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    console.error("Virtual model download is missing Supabase configuration.");
    return NextResponse.json(
      { error: "Image download is temporarily unavailable." },
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
      { error: "Sign in before downloading a model image." },
      { status: 401 },
    );
  }

  const storagePath = new URL(request.url).searchParams.get("path") ?? "";
  const userGeneratedPrefix = `${user.id}/generated/`;
  const filename = storagePath.slice(userGeneratedPrefix.length);
  if (
    !storagePath.startsWith(userGeneratedPrefix) ||
    !/^[0-9a-f-]{36}\.[a-zA-Z0-9]{1,10}$/.test(filename)
  ) {
    return NextResponse.json(
      { error: "A valid generated image is required." },
      { status: 400 },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { data: image, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error || !image) {
    console.error(
      "Virtual model image download failed:",
      error?.message ?? "No image returned from storage",
    );
    return NextResponse.json(
      { error: "The generated image could not be downloaded." },
      { status: 502 },
    );
  }

  return new NextResponse(await image.arrayBuffer(), {
    headers: {
      "Content-Type": image.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="studio-shot-model.${filename.split(".").pop()}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
