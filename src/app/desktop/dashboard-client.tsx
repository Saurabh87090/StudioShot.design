"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import ImageUploadModal from "../../components/image-upload-modal";
import {
  Home,
  Wand2,
  Layers,
  CheckCircle2,
  FileText,
  UploadCloud,
  Star,
  Clock3,
  Palette,
  Search,
  ArrowRight,
  Image as ImageIcon,
  Settings,
  Check,
  Copy,
  X,
  Download,
  RefreshCw,
  Trash2,
  LogOut,
  Zap,
} from "lucide-react";

interface UploadedFile {
  id?: string;
  bucket?: string;
  path?: string;
  url: string;
  name?: string;
  createdAt?: string | null;
}

interface ProcessedBucketImage {
  id: string;
  bucket: string;
  path: string;
  name: string;
  url: string;
  createdAt?: string | null;
}

interface BrandAsset {
  id: string;
  name: string;
  dataUrl: string;
}

interface BrandPreset {
  brandName: string;
  primaryColor: string;
  accentColor: string;
}

interface UserProps {
  user: {
    id?: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export function DashboardClient({ user }: UserProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [brandAssetsLoaded, setBrandAssetsLoaded] = useState(false);
  const [brandPreset, setBrandPreset] = useState<BrandPreset>({
    brandName: "",
    primaryColor: "#fe834d",
    accentColor: "#1e293b",
  });
  const [brandPresetDraft, setBrandPresetDraft] = useState<BrandPreset>({
    brandName: "",
    primaryColor: "#fe834d",
    accentColor: "#1e293b",
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user.name);
  const [profileNameDraft, setProfileNameDraft] = useState(user.name);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenBalanceError, setTokenBalanceError] = useState<string | null>(
    null,
  );
  const [isLoadingTokenBalance, setIsLoadingTokenBalance] = useState(true);
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  // Selects the image processing action for the next upload.
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeSelectedTool, setActiveSelectedTool] = useState<string | null>(
    null,
  );
  const featureTools = [
    {
      label: "Remove BG",
      subtitle: "Instantly remove background & make transparent (100% Free)",
      icon: Wand2,
      route: null,
      searchTerms: ["background", "remove", "cutout"],
    },
    {
      label: "Quick Listing AI",
      subtitle: "Generate marketplace-ready 1:1 listing banners instantly",
      icon: Layers,
      route: "/desktop/listing-dashboard",
      searchTerms: ["listing", "studio", "e-commerce", "product"],
    },
    {
      label: "Infographic Image",
      subtitle: "Create 3:4 portrait product infographics with callout badges",
      icon: FileText,
      route: "/desktop/infographic-dashboard",
      searchTerms: ["infographic", "banner", "text", "design"],
    },
    {
      label: "Virtual Model AI Studio",
      subtitle: "Turn flat clothing photos into realistic model lookbooks",
      icon: ImageIcon,
      route: "/desktop/virtual-model-studio",
      searchTerms: ["model", "garment", "clothing", "apparel", "catalog"],
    },
  ];
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchTokens = normalizedSearchQuery.split(/\s+/).filter(Boolean);
  const matchingFeatureTools = featureTools.filter((tool) =>
    searchTokens.every((token) =>
      tool.searchTerms.join(" ").toLowerCase().includes(token),
    ),
  );
  const accountStorageKey = user.id || user.email || "account";
  const favoritesStorageKey = `studioshot:${accountStorageKey}:favorites`;
  const brandAssetsStorageKey = `studioshot:${accountStorageKey}:brand-assets`;
  const brandPresetStorageKey = `studioshot:${accountStorageKey}:brand-preset`;

  useEffect(() => {
    try {
      const savedDisplayName = window.localStorage.getItem(
        `studioshot:${accountStorageKey}:display-name`,
      );
      if (savedDisplayName) {
        setDisplayName(savedDisplayName);
        setProfileNameDraft(savedDisplayName);
      }

      const savedFavorites = window.localStorage.getItem(favoritesStorageKey);
      const parsedFavorites: unknown = savedFavorites
        ? JSON.parse(savedFavorites)
        : [];
      setFavoriteIds(
        Array.isArray(parsedFavorites)
          ? parsedFavorites.filter(
              (imageId): imageId is string => typeof imageId === "string",
            )
          : [],
      );
    } catch (error) {
      console.error("Could not load starred images:", error);
      setFavoriteIds([]);
      setDashboardNotice("Starred images could not be loaded from this browser.");
    } finally {
      setFavoritesLoaded(true);
    }

    try {
      const savedAssets = window.localStorage.getItem(brandAssetsStorageKey);
      const parsedAssets: unknown = savedAssets ? JSON.parse(savedAssets) : [];
      setBrandAssets(
        Array.isArray(parsedAssets)
          ? parsedAssets.filter(
              (asset): asset is BrandAsset =>
                typeof asset?.id === "string" &&
                typeof asset?.name === "string" &&
                typeof asset?.dataUrl === "string",
            )
          : [],
      );
    } catch (error) {
      console.error("Could not load brand assets:", error);
      setBrandAssets([]);
      setDashboardNotice("Brand assets could not be loaded from this browser.");
    } finally {
      setBrandAssetsLoaded(true);
    }

    try {
      const savedPreset = window.localStorage.getItem(brandPresetStorageKey);
      if (savedPreset) {
        const parsedPreset: unknown = JSON.parse(savedPreset);
        if (
          typeof parsedPreset === "object" &&
          parsedPreset !== null &&
          "brandName" in parsedPreset &&
          "primaryColor" in parsedPreset &&
          "accentColor" in parsedPreset &&
          typeof parsedPreset.brandName === "string" &&
          typeof parsedPreset.primaryColor === "string" &&
          typeof parsedPreset.accentColor === "string"
        ) {
          const validatedPreset = {
            brandName: parsedPreset.brandName,
            primaryColor: parsedPreset.primaryColor,
            accentColor: parsedPreset.accentColor,
          };
          setBrandPreset(validatedPreset);
          setBrandPresetDraft(validatedPreset);
        }
      }
    } catch (error) {
      console.error("Could not load brand preset:", error);
      setDashboardNotice("The saved brand preset could not be loaded.");
    }
  }, [
    accountStorageKey,
    brandAssetsStorageKey,
    brandPresetStorageKey,
    favoritesStorageKey,
  ]);

  useEffect(() => {
    if (!favoritesLoaded) return;
    try {
      window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Could not save starred images:", error);
      setDashboardNotice("Starred images could not be saved in this browser.");
    }
  }, [favoriteIds, favoritesLoaded, favoritesStorageKey]);

  useEffect(() => {
    if (!brandAssetsLoaded) return;
    try {
      window.localStorage.setItem(brandAssetsStorageKey, JSON.stringify(brandAssets));
    } catch (error) {
      console.error("Could not save brand assets:", error);
      setDashboardNotice("Brand assets could not be saved in this browser.");
    }
  }, [brandAssets, brandAssetsLoaded, brandAssetsStorageKey]);

  useEffect(() => {
    if (!brandAssetsLoaded) return;
    try {
      window.localStorage.setItem(
        brandPresetStorageKey,
        JSON.stringify(brandPreset),
      );
    } catch (error) {
      console.error("Could not save brand preset:", error);
      setDashboardNotice("The brand preset could not be saved in this browser.");
    }
  }, [brandAssetsLoaded, brandPreset, brandPresetStorageKey]);

  // Background Remover API ka result aur loading state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
    id?: string;
  } | null>(null);

  // Copy link state
  const [copied, setCopied] = useState(false);

  // User ki uploaded images array
  const [userUploads, setUserUploads] = useState<UploadedFile[]>([]);

  // Bucket processed images array & state
  const [bucketImages, setBucketImages] = useState<ProcessedBucketImage[]>([]);
  const favoriteImages = bucketImages.filter((image) =>
    favoriteIds.includes(image.id),
  );
  const [isLoadingBucket, setIsLoadingBucket] = useState(true);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const [bucketWarnings, setBucketWarnings] = useState<string[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [uploadsError, setUploadsError] = useState<string | null>(null);
  const [uploadsWarnings, setUploadsWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!dashboardNotice) return;

    const timeoutId = window.setTimeout(() => setDashboardNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [dashboardNotice]);

  const toggleFavorite = (imageId: string) => {
    const isFavorite = favoriteIds.includes(imageId);
    setFavoriteIds((current) =>
      isFavorite
        ? current.filter((favoriteId) => favoriteId !== imageId)
        : [...current, imageId],
    );
    setDashboardNotice(isFavorite ? "Removed from Starred Images." : "Added to Starred Images.");
  };

  const handleBrandAssetUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setDashboardNotice("Choose an image file for your brand logo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setDashboardNotice("Brand logo files must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setDashboardNotice("The selected logo could not be read.");
        return;
      }
      const currentAssetSize = brandAssets.reduce(
        (total, asset) => total + asset.dataUrl.length,
        0,
      );
      if (currentAssetSize + dataUrl.length > 4_000_000) {
        setDashboardNotice("Your Brand Kit is full. Remove an asset before adding another.");
        return;
      }
      setBrandAssets((assets) => [
        ...assets,
        {
          id: crypto.randomUUID(),
          name: file.name,
          dataUrl,
        },
      ]);
      setDashboardNotice(`${file.name} added to Brand Assets.`);
    };
    reader.onerror = () => {
      console.error("Could not read the selected brand asset.", reader.error);
      setDashboardNotice("The selected logo could not be read.");
    };
    reader.readAsDataURL(file);
  };

  const saveProfileName = () => {
    const nextName = profileNameDraft.trim();
    if (!nextName) {
      setDashboardNotice("Your display name cannot be empty.");
      return;
    }
    try {
      window.localStorage.setItem(
        `studioshot:${accountStorageKey}:display-name`,
        nextName,
      );
      setDisplayName(nextName);
      setIsSettingsOpen(false);
      setDashboardNotice("Profile settings saved.");
    } catch (error) {
      console.error("Could not save profile settings:", error);
      setDashboardNotice("Profile settings could not be saved in this browser.");
    }
  };

  // Load only the signed-in user's processed images from all studio buckets.
  const fetchProcessedImagesFromBucket = useCallback(async () => {
    try {
      setIsLoadingBucket(true);
      setBucketError(null);

      const response = await fetch("/api/processed-images?type=processed");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch processed images");
      }

      setBucketImages(result.images ?? []);
      setBucketWarnings(result.warnings ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load processed gallery";
      console.error("Failed to load processed gallery:", err);
      setBucketError(message);
      setBucketImages([]);
      setBucketWarnings([]);
    } finally {
      setIsLoadingBucket(false);
    }
  }, []);

  const fetchUploadedImages = useCallback(async () => {
    if (!user.id) {
      setUploadsError("Unable to identify the signed-in user.");
      setUploadsWarnings([]);
      setIsLoadingUploads(false);
      return;
    }

    try {
      setIsLoadingUploads(true);
      setUploadsError(null);
      const response = await fetch("/api/processed-images?type=uploads");
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load uploaded images.");
      }
      setUserUploads(result.images ?? []);
      setUploadsWarnings(result.warnings ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load uploaded images.";
      console.error("Failed to load uploaded images:", error);
      setUploadsError(message);
      setUserUploads([]);
      setUploadsWarnings([]);
    } finally {
      setIsLoadingUploads(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchProcessedImagesFromBucket();
    fetchUploadedImages();
  }, [fetchProcessedImagesFromBucket, fetchUploadedImages]);

  const fetchTokenBalance = useCallback(async () => {
    if (!user.id) {
      setTokenBalanceError("Unable to identify the signed-in user.");
      setIsLoadingTokenBalance(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("tokens")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setTokenBalanceError(null);
      setTokenBalance(
        typeof data?.tokens === "number" && Number.isFinite(data.tokens)
          ? data.tokens
          : 0,
      );
    } catch (error) {
      console.error("Failed to load token balance:", error);
      setTokenBalanceError("Token balance unavailable");
    } finally {
      setIsLoadingTokenBalance(false);
    }
  }, [supabase, user.id]);

  useEffect(() => {
    void fetchTokenBalance();

    if (!user.id) {
      return;
    }

    const channel = supabase
      .channel(`profile-token-balance-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updatedProfile = payload.new as
            | { tokens?: unknown }
            | null
            | undefined;
          const updatedTokens = updatedProfile?.tokens;
          if (
            typeof updatedTokens === "number" &&
            Number.isFinite(updatedTokens)
          ) {
            setTokenBalance(updatedTokens);
            setTokenBalanceError(null);
            setIsLoadingTokenBalance(false);
          } else {
            void fetchTokenBalance();
          }
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Live token balance subscription failed:", status);
        }
      });

    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        void fetchTokenBalance();
      }
    };
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      void supabase.removeChannel(channel);
    };
  }, [fetchTokenBalance, supabase, user.id]);

  // Helper function to trigger single image system download
  const handleDownload = async (
    url: string,
    filename: string = "processed-image.png",
  ) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  const handleOpenBgRemover = () => {
    setActiveTool("background-remover");
    setProcessedImage(null);
    setErrorMsg(null);
    setIsUploadModalOpen(true);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to sign out:", error);
      setSignOutError("Unable to log out. Please try again.");
      setIsSigningOut(false);
    }
  };

  // Upload handler & BG Remover API call
  const handleUploadSuccess = async (newFile: unknown) => {
    const uploadedFile =
      typeof newFile === "object" && newFile !== null
        ? (newFile as Record<string, unknown>)
        : {};
    const formattedFile: UploadedFile = {
      id:
        typeof uploadedFile.id === "string"
          ? uploadedFile.id
          : Date.now().toString(),
      url:
        (typeof uploadedFile.file_url === "string" && uploadedFile.file_url) ||
        (typeof uploadedFile.url === "string" && uploadedFile.url) ||
        (typeof uploadedFile.preview === "string" && uploadedFile.preview) ||
        "",
      name:
        (typeof uploadedFile.file_name === "string" &&
          uploadedFile.file_name) ||
        (typeof uploadedFile.name === "string" && uploadedFile.name) ||
        "Uploaded Image",
      createdAt: new Date().toISOString(),
    };

    setUserUploads((prev) => [
      formattedFile,
      ...prev.filter((file) => file.id !== formattedFile.id),
    ]);
    fetchUploadedImages();
    setIsUploadModalOpen(false);

    if (activeTool === "background-remover") {
      setActiveTab("Uploads");
      setIsProcessing(true);
      setErrorMsg(null);

      try {
        const response = await fetch("/api/remove-bg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: formattedFile.url,
            fileName: formattedFile.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to remove background");
        }

        setProcessedImage(data.processedImageUrl);
        setActiveTab("Uploads");

        // Refresh bucket list so newly processed image appears at the bottom list automatically
        fetchProcessedImagesFromBucket();
      } catch (err: unknown) {
        console.error("BG Remove Error:", err);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Something went wrong processing image.",
        );
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteImage = async (imgItem: ProcessedBucketImage) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/processed-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: imgItem.bucket, path: imgItem.path }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete image.");
      }

      // Refresh bucket images state after deletion
      fetchProcessedImagesFromBucket();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="flex h-dvh w-full min-w-0 overflow-hidden bg-white font-sans text-slate-800 lg:h-screen">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-slate-50/70 p-4 lg:flex">
        <div className="space-y-6">
          {/* User Profile Header */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <img
              src={user.avatar}
            alt={displayName}
              className="h-8 w-8 rounded-full object-cover border border-slate-200"
            />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-bold text-slate-800 truncate">
              {displayName}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div
            aria-live="polite"
            title={tokenBalanceError ?? undefined}
            className="flex items-center gap-2 rounded-xl border border-[#fe834d]/20 bg-white/75 px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm shadow-[#fe834d]/5 backdrop-blur-xl"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fe834d]/10 text-[#fe834d]">
              <Zap className="h-4 w-4 fill-current" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Token balance
              </span>
              <span className="block truncate">
                {isLoadingTokenBalance
                  ? "Loading tokens..."
                  : tokenBalanceError
                    ? tokenBalanceError
                    : `${tokenBalance ?? 0} Tokens Left`}
              </span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { name: "Home", icon: Home },
              { name: "Processed Images", icon: CheckCircle2 },
              { name: "Starred Images", icon: Star, tag: String(favoriteImages.length) },
              { name: "Recent Activity", icon: Clock3 },
              { name: "Brand Assets / Kit", icon: Palette },
            ].map((item) => (
              <button
                key={item.name}
                type="button"
                aria-current={activeTab === item.name ? "page" : undefined}
                onClick={() => {
                  setActiveTab(item.name);
                  setActiveTool(null);
                  setSearchQuery("");
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 hover:bg-orange-50/50 ${
                  activeTab === item.name
                    ? "bg-[#fe834d]/10 text-[#fe834d] font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
                {item.tag !== undefined && (
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                    {item.tag}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Content Sub-Section */}
          <div className="pt-2">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Content
            </span>
            <nav className="space-y-1 mt-2">
              {[
                {
                  name: "Uploads",
                  icon: UploadCloud,
                  tag: String(userUploads.length),
                },
              ].map(
                (item: { name: string; icon: typeof Home; tag?: string }) => (
                  <button
                    key={item.name}
                    type="button"
                    aria-current={activeTab === item.name ? "page" : undefined}
                    onClick={() => {
                      setActiveTab(item.name);
                      setActiveTool(null);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 hover:bg-orange-50/50 ${
                      activeTab === item.name
                        ? "bg-[#fe834d]/10 text-[#fe834d] font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    {item.tag && (
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        {item.tag}
                      </span>
                    )}
                  </button>
                ),
              )}
            </nav>
          </div>
        </div>

        {/* Sidebar Bottom Actions Section */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setSignOutError(null);
                setIsSignOutDialogOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200/50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
            <button
              type="button"
              onClick={() => {
                setProfileNameDraft(displayName);
                setIsSettingsOpen(true);
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-600 transition-all duration-200 hover:bg-orange-50/50 hover:text-slate-900"
            >
              <Settings className="h-4 w-4" />
              Preferences / Settings
            </button>
          </nav>

          <button
            type="button"
            onClick={() =>
              setDashboardNotice("Pro plan options are not available yet.")
            }
            className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-md shadow-[#fe834d]/20 hover:opacity-90 transition-opacity bg-[#fe834d]"
          >
            Upgrade Space to Pro
          </button>
        </div>
      </aside>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <main className="min-w-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-3 sm:space-y-8 sm:p-6 lg:space-y-8 lg:p-8">
        {/* Top Bar Search & Title */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{activeTab}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fe834d]/20 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm md:hidden">
              <Zap className="h-3.5 w-3.5 fill-current text-[#fe834d]" />
              {isLoadingTokenBalance
                ? "Loading"
                : tokenBalanceError
                  ? "Tokens unavailable"
                  : `${tokenBalance ?? 0} left`}
            </span>
          </div>
          <div className="relative w-full sm:max-w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                const query = event.target.value;
                setSearchQuery(query);
                if (query.trim()) {
                  setActiveTab("Home");
                  setActiveTool(null);
                }
              }}
              aria-label="Search features and templates"
              placeholder="Search features or templates"
              className="w-full rounded-full border border-slate-200 bg-slate-100 py-2 pl-9 pr-4 text-xs text-slate-800 focus:border-[#fe834d] focus:outline-none focus:ring-2 focus:ring-[#fe834d]/20"
            />
          </div>
        </div>
        {dashboardNotice && (
          <p
            role="status"
            className="rounded-xl border border-[#fe834d]/20 bg-[#fe834d]/5 px-4 py-3 text-sm text-slate-700"
          >
            {dashboardNotice}
          </p>
        )}
        <nav
          aria-label="Dashboard navigation"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden"
        >
          {[
            { name: "Home", icon: Home },
            { name: "Uploads", icon: UploadCloud },
            { name: "Processed Images", icon: ImageIcon },
            { name: "Starred Images", icon: Star },
            { name: "Recent Activity", icon: Clock3 },
            { name: "Brand Assets / Kit", icon: Palette },
            { name: "Preferences / Settings", icon: Settings },
          ].map(({ name: tab, icon: Icon }) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (tab === "Preferences / Settings") {
                  setProfileNameDraft(displayName);
                  setIsSettingsOpen(true);
                } else {
                  setActiveTab(tab);
                  setActiveTool(null);
                  setSearchQuery("");
                }
              }}
              aria-current={activeTab === tab ? "page" : undefined}
              className={`group flex min-h-14 items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all duration-200 active:scale-95 ${
                activeTab === tab
                  ? "border-[#fe834d]/40 bg-[#fe834d]/10 text-[#fe834d] shadow-sm shadow-[#fe834d]/10"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#fe834d]/25 hover:bg-orange-50/50 hover:text-slate-800"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                  activeTab === tab
                    ? "bg-[#fe834d]/15 text-[#fe834d]"
                    : "bg-slate-100 text-slate-500 group-hover:bg-[#fe834d]/10 group-hover:text-[#fe834d]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 leading-tight">{tab}</span>
            </button>
          ))}
        </nav>

        {/* ================= RESULT VIEW AFTER BG REMOVAL ================= */}
        {activeTab === "Uploads" && isProcessing && (
          <div className="p-8 border border-slate-200 rounded-2xl bg-orange-50/50 text-center space-y-3">
            <div className="animate-spin h-8 w-8 border-4 border-[#fe834d] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-xs font-semibold text-slate-700">
              Removing background & saving to storage... Please wait.
            </p>
          </div>
        )}

        {/* PROCESSED IMAGE PREVIEW CONTAINER */}
        {activeTab === "Uploads" && processedImage && !isProcessing && (
          <div className="overflow-hidden border border-slate-200 bg-white rounded-2xl p-6 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Background Removed Successfully!
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Your transparent image is ready to download
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(processedImage)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setProcessedImage(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-xl mx-auto h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center bg-slate-100">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  opacity: 0.4,
                }}
              />
              <img
                src={processedImage}
                alt="Background Removed Result"
                className="relative z-10 max-h-full max-w-full object-contain p-4"
              />
              <span className="absolute bottom-3 right-3 bg-emerald-600/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-xs z-20">
                Transparent PNG
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() =>
                  handleDownload(processedImage, "background-removed.png")
                }
                className="flex items-center gap-2 px-6 py-2.5 bg-[#fe834d] hover:bg-[#e06f3b] text-white text-xs font-bold rounded-xl shadow-md shadow-[#fe834d]/20 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Download className="h-4 w-4" /> Download to Computer
              </button>

              <button
                type="button"
                onClick={handleOpenBgRemover}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Wand2 className="h-3.5 w-3.5" /> Process Another Image
              </button>
            </div>
          </div>
        )}

        {activeTab === "Uploads" && errorMsg && (
          <div className="p-4 border border-red-200 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Dynamic View based on Active Tab */}
        {activeTab === "Uploads" ? (
          /* ================= UPLOADS TAB VIEW ================= */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Uploaded Images
                </h2>
                <p className="text-xs text-slate-500">
                  Manage and view all your uploaded product photos and images.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchUploadedImages}
                  disabled={isLoadingUploads}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#fe834d] border border-slate-200 px-3 py-2 rounded-lg bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isLoadingUploads ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#fe834d] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload New Image
                </button>
              </div>
            </div>

            {uploadsWarnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Some studio uploads may be unavailable: {uploadsWarnings.join(" ")}
              </div>
            )}

            {uploadsError ? (
              <div className="p-8 border border-red-200 rounded-2xl bg-red-50 text-center text-xs text-red-600">
                {uploadsError}
              </div>
            ) : isLoadingUploads ? (
              <div className="p-10 border border-slate-200/80 rounded-2xl bg-slate-50 text-center text-xs text-slate-500 font-medium">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-400" />
                Loading your uploads...
              </div>
            ) : userUploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-orange-100 text-[#fe834d] flex items-center justify-center">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  No uploaded images yet
                </h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Upload product photos to start editing, removing backgrounds,
                  or generating AI models.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="mt-2 bg-[#fe834d] text-[#ffffff] px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
                >
                  Start Uploading
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {userUploads.map((file, idx) => (
                  <div
                    key={file.id || idx}
                    className="group relative h-40 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm hover:border-[#fe834d] transition-all"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({
                          url: file.url,
                          name: file.name || `Upload ${idx + 1}`,
                        })
                      }
                      aria-label={`Preview ${file.name || `upload ${idx + 1}`}`}
                      className="absolute inset-0 h-full w-full cursor-zoom-in"
                    >
                      <img
                        src={file.url}
                        alt={file.name || `Upload ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-[10px] text-white font-medium truncate">
                        {file.name || "Uploaded Image"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "Processed Images" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Processed Images
                </h2>
                <p className="text-xs text-slate-500">
                  Processed images generated across your StudioShot studios.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchProcessedImagesFromBucket}
                disabled={isLoadingBucket}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#fe834d] border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoadingBucket ? "animate-spin" : ""}`}
                />
                Refresh List
              </button>
            </div>
            {bucketWarnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Some studio images may be unavailable: {bucketWarnings.join(" ")}
              </div>
            )}
            {isLoadingBucket ? (
              <div className="p-16 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                Loading processed images...
              </div>
            ) : bucketError ? (
              <div className="p-8 border border-red-200 rounded-2xl bg-red-50 text-center text-xs text-red-600">
                {bucketError}
              </div>
            ) : bucketImages.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                No processed images found.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {bucketImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm"
                  >
                    <div className="h-44 bg-slate-100 flex items-center justify-center p-3 relative overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({ id: image.id, url: image.url, name: image.name })
                        }
                        aria-label={`Preview ${image.name}`}
                        className="absolute inset-0 flex cursor-zoom-in items-center justify-center p-3"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(image.id)}
                        aria-label={favoriteIds.includes(image.id) ? `Unstar ${image.name}` : `Star ${image.name}`}
                        title={favoriteIds.includes(image.id) ? "Remove from Starred Images" : "Add to Starred Images"}
                        className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d] ${
                          favoriteIds.includes(image.id)
                            ? "text-[#fe834d]"
                            : "text-slate-500 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${favoriteIds.includes(image.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 truncate">
                        {image.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownload(image.url, image.name)}
                        className="p-1.5 bg-[#fe834d] text-white rounded-lg hover:opacity-90 transition-opacity shrink-0"
                        title="Download image"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "Starred Images" ? (
          <section className="space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Starred Images</h2>
                <p className="text-xs text-slate-500">
                  Your saved favorites, available on this account in this browser.
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#fe834d]">
                {favoriteImages.length} {favoriteImages.length === 1 ? "image" : "images"}
              </span>
            </header>
            {isLoadingBucket ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
                Loading your starred images...
              </div>
            ) : bucketError ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
                {bucketError}
              </div>
            ) : favoriteImages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <Star className="mx-auto h-8 w-8 text-[#fe834d]" />
                <h3 className="mt-3 text-sm font-semibold text-slate-800">No starred images yet</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Star an image from Processed Images to save it here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("Processed Images")}
                  className="mt-4 rounded-lg bg-[#fe834d] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#e06f3b]"
                >
                  Browse processed images
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {favoriteImages.map((image) => (
                  <article
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#fe834d]/50 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ id: image.id, url: image.url, name: image.name })}
                      aria-label={`Preview ${image.name}`}
                      className="flex h-40 w-full items-center justify-center bg-slate-100 p-3 sm:h-48"
                    >
                      <img src={image.url} alt={image.name} className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(image.id)}
                      aria-label={`Unstar ${image.name}`}
                      title="Remove from Starred Images"
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#fe834d] shadow transition-all duration-200 hover:scale-105 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d]"
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                    <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                      <span className="truncate text-xs text-slate-600">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => void handleDownload(image.url, image.name)}
                        aria-label={`Download ${image.name}`}
                        className="shrink-0 rounded-lg bg-[#fe834d] p-2 text-white transition-colors hover:bg-[#e06f3b]"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : activeTab === "Recent Activity" ? (
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-500">Your latest generated images, newest first.</p>
            </div>
            {isLoadingBucket ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
                Loading your activity...
              </div>
            ) : bucketError ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{bucketError}</div>
            ) : bucketImages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
                Generated images will appear here as activity.
              </div>
            ) : (
              <ol className="relative ml-3 space-y-3 border-l border-orange-200 pl-6">
                {bucketImages.map((image) => (
                  <li key={image.id} className="relative">
                    <span className="absolute -left-[1.93rem] top-4 h-3 w-3 rounded-full border-2 border-white bg-[#fe834d] shadow" />
                    <article className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ id: image.id, url: image.url, name: image.name })}
                        aria-label={`Preview ${image.name}`}
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 p-2"
                      >
                        <img src={image.url} alt="" className="max-h-full max-w-full object-contain" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{image.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {image.createdAt ? new Date(image.createdAt).toLocaleString() : "Date unavailable"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(image.id)}
                        aria-label={favoriteIds.includes(image.id) ? `Unstar ${image.name}` : `Star ${image.name}`}
                        className={`rounded-lg p-2 transition-colors hover:bg-orange-50 ${favoriteIds.includes(image.id) ? "text-[#fe834d]" : "text-slate-400"}`}
                      >
                        <Star className={`h-4 w-4 ${favoriteIds.includes(image.id) ? "fill-current" : ""}`} />
                      </button>
                    </article>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ) : activeTab === "Brand Assets / Kit" ? (
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Brand Assets / Kit</h2>
                <p className="text-xs text-slate-500">Keep logos and brand images handy in this browser.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#fe834d] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#e06f3b]">
                <UploadCloud className="h-4 w-4" />
                Add brand logo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    handleBrandAssetUpload(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="rounded-xl border border-orange-100 bg-orange-50/60 p-3 text-xs text-slate-600">
              Brand assets are stored locally in this browser and are not automatically attached to generated images.
            </p>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Brand preset</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Save your brand name and colors for quick reference.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end">
                <label className="block text-xs font-medium text-slate-600">
                  Brand name
                  <input
                    type="text"
                    value={brandPresetDraft.brandName}
                    maxLength={80}
                    onChange={(event) =>
                      setBrandPresetDraft((preset) => ({
                        ...preset,
                        brandName: event.target.value,
                      }))
                    }
                    placeholder="Your brand"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#fe834d] focus:ring-2 focus:ring-[#fe834d]/20"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Primary
                  <input
                    type="color"
                    value={brandPresetDraft.primaryColor}
                    onChange={(event) =>
                      setBrandPresetDraft((preset) => ({
                        ...preset,
                        primaryColor: event.target.value,
                      }))
                    }
                    className="mt-1.5 block h-10 w-full min-w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Accent
                  <input
                    type="color"
                    value={brandPresetDraft.accentColor}
                    onChange={(event) =>
                      setBrandPresetDraft((preset) => ({
                        ...preset,
                        accentColor: event.target.value,
                      }))
                    }
                    className="mt-1.5 block h-10 w-full min-w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!brandPresetDraft.brandName.trim()) {
                      setDashboardNotice("Enter a brand name before saving the preset.");
                      return;
                    }
                    setBrandPreset({
                      ...brandPresetDraft,
                      brandName: brandPresetDraft.brandName.trim(),
                    });
                    setDashboardNotice("Brand preset saved.");
                  }}
                  className="h-10 rounded-lg bg-[#fe834d] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#e06f3b]"
                >
                  Save preset
                </button>
              </div>
              {brandPreset.brandName && (
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  Saved: <strong>{brandPreset.brandName}</strong>
                  <span
                    aria-label={`Primary color ${brandPreset.primaryColor}`}
                    className="h-4 w-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: brandPreset.primaryColor }}
                  />
                  <span
                    aria-label={`Accent color ${brandPreset.accentColor}`}
                    className="h-4 w-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: brandPreset.accentColor }}
                  />
                </p>
              )}
            </section>
            {!brandAssetsLoaded ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">Loading brand assets...</div>
            ) : brandAssets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <Palette className="mx-auto h-8 w-8 text-[#fe834d]" />
                <h3 className="mt-3 text-sm font-semibold text-slate-800">Your brand kit is empty</h3>
                <p className="mt-1 text-xs text-slate-500">Add a logo or image to keep your brand assets organized.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {brandAssets.map((asset) => (
                  <article key={asset.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex h-36 items-center justify-center rounded-lg bg-slate-50 p-3">
                      <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="mt-2 truncate text-xs font-medium text-slate-700" title={asset.name}>{asset.name}</p>
                    <button
                      type="button"
                      onClick={() => setBrandAssets((assets) => assets.filter((saved) => saved.id !== asset.id))}
                      aria-label={`Remove ${asset.name}`}
                      className="absolute right-4 top-4 rounded-lg bg-white/95 p-2 text-slate-500 shadow transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ================= HOME / DEFAULT TAB VIEW ================= */
          <>
            {/* Quick Tools Grid */}
            {normalizedSearchQuery && matchingFeatureTools.length === 0 ? (
              <div
                role="status"
                className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600"
              >
                Oops! No matching feature or template found. Try searching for
                background, model, infographic, or listing.
              </div>
            ) : (
              <div
                aria-live="polite"
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
              {(normalizedSearchQuery ? matchingFeatureTools : featureTools).map((tool) => {
                const isSelected = activeSelectedTool === tool.label;

                return (
                  <button
                    key={tool.label}
                    type="button"
                    onClick={() => {
                      setActiveSelectedTool(tool.label);

                      if (tool.route) {
                        router.push(tool.route);
                      } else {
                        handleOpenBgRemover();
                      }
                    }}
                    className={`group relative flex min-h-36 items-start gap-4 overflow-hidden rounded-2xl border p-5 text-left shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#fe834d]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d] focus-visible:ring-offset-2 ${
                      isSelected
                        ? "border-[#fe834d]/50 bg-[#fe834d]/10 shadow-md shadow-[#fe834d]/10"
                        : "border-white/80 bg-white/70 hover:border-[#fe834d]/50 hover:bg-white/90"
                    }`}
                  >
                    <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#fe834d]/10 blur-2xl transition-opacity group-hover:opacity-100" />
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fe834d]/15 bg-linear-to-br from-[#fe834d]/15 to-[#fe834d]/5 text-[#fe834d] shadow-inner shadow-white/80 transition-all group-hover:border-[#fe834d]/35 group-hover:bg-[#fe834d] group-hover:text-white">
                      <tool.icon className="h-5 w-5" />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold tracking-tight text-slate-900">
                          {tool.label}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#fe834d]" />
                      </span>
                      <span className="mt-2 block text-xs leading-relaxed text-slate-500">
                        {tool.subtitle}
                      </span>
                      {tool.label === "Remove BG" && (
                        <span className="mt-3 inline-flex rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Free
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
              </div>
            )}

            {/* Get Started Section */}
            {!normalizedSearchQuery && <div className="space-y-4 mt-18">
              <h2 className="text-base font-bold text-slate-900">
                Get started
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {[
                  {
                    title: "Remove Background",
                    img: "/removebg.png",
                    alt: "Clean studio product photo of a cricket shoe",
                    action: handleOpenBgRemover,
                  },
                  {
                    title: "AI Backgrounds",
                    img: "ball-aibg.png",
                    alt: "Sports bag photographed in an outdoor setting",
                    action: () => router.push("/desktop/listing-dashboard"),
                  },
                  {
                    title: "Infographics",
                    img: "coke-infogrphic.png",
                    alt: "Studio product photo of cricket protective gear",
                    action: () => router.push("/desktop/infographic-dashboard"),
                  },
                  {
                    title: "Virtual AI Model",
                    img: "returned-aimodel.jpeg",
                    alt: "Illustrated apparel catalog model wearing a shirt",
                    action: () => router.push("/desktop/virtual-model-studio"),
                  },
                ].map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={card.action}
                    className="group min-w-0  overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#fe834d]/40 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d] focus-visible:ring-offset-2"
                  >
                    <div className="relative h-32 overflow-hidden bg-slate-100 sm:h-40">
                      <img
                        src={card.img}
                        alt={card.alt}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {card.title === "Infographics" && (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-slate-950/45 via-transparent to-slate-950/55 p-2.5 sm:p-3"
                        >
                          <span className="w-fit rounded-full border border-white/40 bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-800 sm:text-[10px]">
                            Pro protection
                          </span>
                          <span className="self-end rounded-lg bg-white/95 px-2 py-1 text-[9px] font-semibold text-slate-800 shadow-sm sm:text-[10px]">
                            Lightweight · Secure fit
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex min-h-12 items-center justify-between gap-1 border-t border-slate-100 bg-white px-2.5 py-2 sm:px-3">
                      <span className="min-w-0 text-[11px] font-semibold leading-tight text-slate-800 sm:text-xs">
                        {card.title}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#fe834d]" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </div>}


            {/* ================= 2. BOTTOM PROCESSED BUCKET GALLERY ================= */}
            {!normalizedSearchQuery && <div className="space-y-4 pt-8 border-t border-slate-200/80">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recent Processed Images
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing your 6 most recent outputs across StudioShot studios
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("Processed Images")}
                    className="text-xs font-semibold text-[#fe834d] hover:underline"
                  >
                    View all
                  </button>
                  <button
                    type="button"
                    onClick={fetchProcessedImagesFromBucket}
                    disabled={isLoadingBucket}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                    title="Refresh Bucket"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isLoadingBucket ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Content Area */}
              {bucketWarnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Some studio images may be unavailable: {bucketWarnings.join(" ")}
                </div>
              )}
              {isLoadingBucket ? (
                <div className="p-10 border border-slate-200/80 rounded-2xl bg-slate-50 text-center text-xs text-slate-500 font-medium">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading your processed images from Supabase...
                </div>
              ) : bucketError ? (
                <div className="p-8 border border-red-200 rounded-2xl bg-red-50 text-center text-xs text-red-600 font-medium">
                  {bucketError}
                </div>
              ) : bucketImages.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    No processed images found in Supabase storage yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Remove background from a photo to see it saved here
                    automatically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {bucketImages.slice(0, 6).map((imgItem) => (
                    <div
                      key={imgItem.id}
                      className="group relative h-52 rounded-xl border border-slate-200/80 overflow-hidden bg-white shadow-2xs hover:shadow-md hover:border-[#fe834d] transition-all duration-300 flex flex-col justify-between p-2"
                    >
                      {/* Image Container with Transparent Grid Background */}
                      <div className="relative h-36 w-full rounded-lg overflow-hidden flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[12px_12px] bg-slate-50">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              id: imgItem.id,
                              url: imgItem.url,
                              name: imgItem.name,
                            })
                          }
                          aria-label={`Preview ${imgItem.name}`}
                          className="absolute inset-0 flex cursor-zoom-in items-center justify-center"
                        >
                          <img
                            src={imgItem.url}
                            alt={imgItem.name}
                            className="max-h-full max-w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                          />
                        </button>

                        {/* Hover Dark Overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                          {/* Quick Download Button on Hover */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(imgItem.url, imgItem.name)
                            }
                            className="pointer-events-auto p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                            title="Download Image"
                          >
                            <Download className="h-4 w-4 text-[#fe834d]" />
                          </button>
                        </div>

                        {/* Top Right Delete Button (Shows on Hover) */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(imgItem.id)}
                          aria-label={
                            favoriteIds.includes(imgItem.id)
                              ? `Unstar ${imgItem.name}`
                              : `Star ${imgItem.name}`
                          }
                          title={
                            favoriteIds.includes(imgItem.id)
                              ? "Remove from Starred Images"
                              : "Add to Starred Images"
                          }
                          className={`absolute right-10 top-1.5 z-10 rounded-lg bg-white/95 p-1.5 shadow transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d] ${
                            favoriteIds.includes(imgItem.id)
                              ? "text-[#fe834d]"
                              : "text-slate-500 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          }`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              favoriteIds.includes(imgItem.id)
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(imgItem)}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105 cursor-pointer z-10"
                          title="Delete Image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Bottom Card Footer */}
                      <div className="mt-2 flex items-center justify-between gap-1.5 pt-1">
                        <span
                          className="text-[11px] font-medium text-slate-600 truncate flex-1 px-0.5"
                          title={imgItem.name}
                        >
                          {imgItem.name}
                        </span>

                        {/* Main Download Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(imgItem.url, imgItem.name)
                          }
                          className="px-2.5 py-1.5 bg-[#fe834d] hover:bg-[#e06f3b] text-white rounded-md text-[11px] font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          title="Download Image"
                        >
                          <Download className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>}
          </>
        )}
      </main>
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userId={user.id}
        onUploadSuccess={handleUploadSuccess}
      />
      {previewImage && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 p-2 backdrop-blur-sm sm:p-4"
          onClick={() => setPreviewImage(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Image preview: ${previewImage.name}`}
            className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] lg:max-h-[92vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
              <p className="min-w-0 truncate text-sm font-medium text-slate-900">
                {previewImage.name}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void handleDownload(previewImage.url, previewImage.name)
                  }
                  aria-label="Download image"
                  title="Download image"
                  className="min-h-11 min-w-11 rounded-lg bg-[#fe834d] p-2 text-white transition-colors hover:bg-[#e06f3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d] focus-visible:ring-offset-2 lg:min-h-0 lg:min-w-0"
                >
                  <Download className="h-4 w-4" />
                </button>
                {previewImage.id && (
                  <button
                    type="button"
                    onClick={() => {
                      if (previewImage.id) toggleFavorite(previewImage.id);
                    }}
                    aria-label={
                      favoriteIds.includes(previewImage.id)
                        ? "Remove from Starred Images"
                        : "Add to Starred Images"
                    }
                    title={
                      favoriteIds.includes(previewImage.id)
                        ? "Unstar image"
                        : "Star image"
                    }
                    className="min-h-11 min-w-11 rounded-lg border border-slate-200 bg-white p-2 text-[#fe834d] transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d] focus-visible:ring-offset-2 lg:min-h-0 lg:min-w-0"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        favoriteIds.includes(previewImage.id)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  aria-label="Close image preview"
                  title="Close preview"
                  className="min-h-11 min-w-11 rounded-lg bg-[#fe834d] p-2 text-white transition-colors hover:bg-[#e06f3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe834d] focus-visible:ring-offset-2 lg:min-h-0 lg:min-w-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-white p-4">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[calc(100dvh-6rem)] max-w-full object-contain lg:max-h-[calc(92vh-5rem)]"
              />
            </div>
          </section>
        </div>
      )}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setIsSettingsOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-settings-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="profile-settings-title" className="text-lg font-bold text-slate-900">
                  Profile settings
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Update the display name shown in your dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                Display name
                <input
                  type="text"
                  value={profileNameDraft}
                  onChange={(event) => setProfileNameDraft(event.target.value)}
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-[#fe834d] focus:ring-2 focus:ring-[#fe834d]/20"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Email
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-500"
                />
              </label>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Display name changes are saved in this browser and do not change your sign-in account details.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfileName}
                className="rounded-lg bg-[#fe834d] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#e06f3b]"
              >
                Save settings
              </button>
            </div>
          </section>
        </div>
      )}
      {isSignOutDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => {
            if (!isSigningOut) setIsSignOutDialogOpen(false);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            aria-describedby="sign-out-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="sign-out-title"
              className="text-base font-semibold text-slate-900"
            >
              Log out?
            </h2>
            <p id="sign-out-description" className="mt-2 text-sm text-slate-600">
              Are you sure you want to log out of your account?
            </p>
            {signOutError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {signOutError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSignOutDialogOpen(false)}
                disabled={isSigningOut}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-lg bg-[#fe834d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e06f3b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
