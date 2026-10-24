import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

export const runtime = "nodejs";

interface DashboardImage {
  id: string;
  bucket: string;
  path: string;
  name: string;
  url: string;
  createdAt: string | null;
}

type ImageScope = {
  bucket: string;
  path: string;
  include: (imagePath: string, name: string) => boolean;
};

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage is not configured.");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

async function listImages(
  supabase: ReturnType<typeof createAdminClient>,
  scope: ImageScope,
): Promise<DashboardImage[]> {
  const images: DashboardImage[] = [];

  const listFolder = async (folder: string, depth: number): Promise<void> => {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase.storage.from(scope.bucket).list(
        folder,
        {
          limit: 100,
          offset,
          sortBy: { column: "created_at", order: "desc" },
        },
      );
      if (error) {
        throw new Error(`Unable to list ${scope.bucket} images: ${error.message}`);
      }

      for (const file of data ?? []) {
        if (file.name === ".emptyFolderPlaceholder") continue;
        const filePath = `${folder}/${file.name}`;

        if (file.id === null && file.metadata === null) {
          if (depth < 3) await listFolder(filePath, depth + 1);
          continue;
        }
        if (!file.metadata || !scope.include(filePath, file.name)) continue;

        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from(scope.bucket)
            .createSignedUrl(filePath, 60 * 60);
        if (signedUrlError || !signedUrlData?.signedUrl) {
          throw new Error(
            `Unable to create image URL for ${scope.bucket}/${filePath}: ${
              signedUrlError?.message ?? "No signed URL returned"
            }`,
          );
        }

        images.push({
          id: `${scope.bucket}:${filePath}`,
          bucket: scope.bucket,
          path: filePath,
          name: file.name,
          url: signedUrlData.signedUrl,
          createdAt: file.created_at,
        });
      }

      if (!data || data.length < 100) break;
      offset += data.length;
    }
  };

  await listFolder(scope.path, 0);
  return images;
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to view your images." }, { status: 401 });
    }

    const type = new URL(request.url).searchParams.get("type");
    if (type !== "uploads" && type !== "processed") {
      return NextResponse.json(
        { error: "Choose either uploads or processed images." },
        { status: 400 },
      );
    }

    const userId = user.id;
    const scopes: ImageScope[] =
      type === "uploads"
        ? [
            {
              bucket: "user-uploads",
              path: userId,
              include: () => true,
            },
            {
              bucket: "virtual-studio-assets",
              path: `${userId}/garments`,
              include: () => true,
            },
            {
              bucket: "infographic-assets",
              path: `${userId}/inputs`,
              include: () => true,
            },
            {
              bucket: "marketplace-listings",
              path: userId,
              include: (_path, name) => name.startsWith("original-"),
            },
          ]
        : [
            {
              bucket: "processed-image",
              path: userId,
              include: () => true,
            },
            {
              bucket: "virtual-studio-assets",
              path: `${userId}/generated`,
              include: () => true,
            },
            {
              bucket: "processed-infographic-image",
              path: `${userId}/generated`,
              include: () => true,
            },
            {
              bucket: "processed-images",
              path: `${userId}/generated`,
              include: () => true,
            },
            {
              bucket: "processed-image",
              path: `${userId}/generated`,
              include: () => true,
            },
            {
              bucket: "marketplace-listings",
              path: userId,
              include: (_path, name) => !name.startsWith("original-"),
            },
          ];

    const supabase = createAdminClient();
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();
    if (bucketsError) {
      throw new Error(`Unable to inspect image storage: ${bucketsError.message}`);
    }
    const availableBuckets = new Set((buckets ?? []).map((bucket) => bucket.name));
    const requestedBuckets = new Set(scopes.map((scope) => scope.bucket));
    const warnings = [...requestedBuckets]
      .filter((bucket) => !availableBuckets.has(bucket))
      .map((bucket) => `Storage bucket "${bucket}" is not configured.`);
    const availableScopes = scopes.filter((scope) =>
      availableBuckets.has(scope.bucket),
    );
    const results = await Promise.allSettled(
      availableScopes.map((scope) => listImages(supabase, scope)),
    );
    const failed = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failed) throw failed.reason;

    const images = results
      .flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      )
      .filter(
        (image, index, allImages) =>
          allImages.findIndex(
            (candidate) =>
              candidate.bucket === image.bucket && candidate.path === image.path,
          ) === index,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );

    return NextResponse.json({ images, warnings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load your images.";
    console.error("Dashboard images API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to delete an image." }, { status: 401 });
    }

    const body = await request.json();
    const bucket = typeof body?.bucket === "string" ? body.bucket : "";
    const path = typeof body?.path === "string" ? body.path : "";
    const allowedBuckets = new Set([
      "processed-image",
      "processed-images",
      "processed-infographic-image",
      "virtual-studio-assets",
      "marketplace-listings",
    ]);
    if (
      !allowedBuckets.has(bucket) ||
      !path.startsWith(`${user.id}/`) ||
      path.split("/").includes("..")
    ) {
      return NextResponse.json(
        { error: "A valid image belonging to your account is required." },
        { status: 400 },
      );
    }

    const { error } = await createAdminClient().storage
      .from(bucket)
      .remove([path]);
    if (error) {
      console.error("Dashboard image delete failed:", error.message);
      return NextResponse.json(
        { error: "The image could not be deleted." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete the image.";
    console.error("Dashboard image delete API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
