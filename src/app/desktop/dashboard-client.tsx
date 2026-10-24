"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import ImageUploadModal from "../../components/image-upload-modal";
import {
  Home,
  Wand2,
  Layers,
  Activity,
  CheckCircle2,
  Layout,
  Palette,
  FileText,
  UploadCloud,
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
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
  const dynamicTools = [
    {
      label: "AI Virtual Model Studio",
      icon: ImageIcon,
      route: "/desktop/virtual-model-studio",
    },
    {
      label: "Infographic Studio",
      icon: FileText,
      route: "/desktop/infographic-dashboard",
    },
    {
      label: "Marketplace Studio",
      icon: Layers,
      route: "/desktop/listing-dashboard",
    },
  ];

  // Background Remover API ka result aur loading state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy link state
  const [copied, setCopied] = useState(false);

  // User ki uploaded images array
  const [userUploads, setUserUploads] = useState<UploadedFile[]>([]);

  // Bucket processed images array & state
  const [bucketImages, setBucketImages] = useState<ProcessedBucketImage[]>([]);
  const [isLoadingBucket, setIsLoadingBucket] = useState(true);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const [bucketWarnings, setBucketWarnings] = useState<string[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [uploadsError, setUploadsError] = useState<string | null>(null);
  const [uploadsWarnings, setUploadsWarnings] = useState<string[]>([]);

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
    <div className="flex h-screen w-full bg-white text-slate-800 font-sans overflow-hidden">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* User Profile Header */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-100/60 transition-colors">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover border border-slate-200"
            />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-bold text-slate-800 truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { name: "Home", icon: Home },
              { name: "Processed Images", icon: CheckCircle2 },
              { name: "Batch", icon: Layers },
              { name: "Activity", icon: Activity },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setActiveTool(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === item.name
                    ? "bg-[#fe834d]/10 text-[#fe834d] font-semibold"
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
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
                { name: "Designs", icon: Layout },
                { name: "Brand Kit", icon: Palette },
                { name: "Templates", icon: FileText },
                {
                  name: "Uploads",
                  icon: UploadCloud,
                  tag: String(userUploads.length),
                },
              ].map(
                (item: { name: string; icon: typeof Home; tag?: string }) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setActiveTool(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === item.name
                        ? "bg-[#fe834d]/10 text-[#fe834d] font-semibold"
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
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
            <button className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200/50">
              <Settings className="h-4 w-4" />
              Preferences
            </button>
          </nav>

          <button className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-md shadow-[#fe834d]/20 hover:opacity-90 transition-opacity bg-[#fe834d]">
            Upgrade Space to Pro
          </button>
        </div>
      </aside>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Top Bar Search & Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{activeTab}</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search a template"
              className="w-full pl-9 pr-4 py-2 bg-slate-100 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-[#fe834d] text-slate-800"
            />
          </div>
        </div>

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
                    className="group relative h-40 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm hover:border-[#fe834d] transition-all cursor-pointer"
                  >
                    <img
                      src={file.url}
                      alt={file.name || `Upload ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
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
                    className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col group shadow-sm"
                  >
                    <div className="h-44 bg-slate-100 flex items-center justify-center p-3 relative overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
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
        ) : (
          /* ================= HOME / DEFAULT TAB VIEW ================= */
          <>
            {/* Quick Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
             
              
              {/* Background Remover Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveSelectedTool("Background Remover");
                  handleOpenBgRemover();
                }}
                className={`flex items-center gap-3 p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  activeSelectedTool === "Background Remover"
                    ? "bg-[#fe834d] text-white border-[#fe834d]"
                    : "bg-slate-100/80 text-slate-700 border-slate-200/60 hover:border-[#fe834d]"
                }`}
              >
                <Wand2
                  className={`h-4 w-4 shrink-0 ${
                    activeSelectedTool === "Background Remover"
                      ? "text-white"
                      : "text-slate-600"
                  }`}
                />
                <span className="text-xs font-medium leading-tight">
                  Background Remover
                </span>
              </button>

              {/* Other Dynamic Tools */}
              {dynamicTools.map((tool, idx) => {
                const isSelected = activeSelectedTool === tool.label;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveSelectedTool(tool.label);

                      if (tool.route) {
                        router.push(tool.route);
                      }
                    }}
                    className={`flex items-center gap-3 p-4.5  text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#fe834d] text-white border-[#fe834d]"
                        : "bg-slate-100/80 text-slate-700 border-slate-200/60 hover:border-[#fe834d]"
                    }`}
                  >
                    <tool.icon
                      className={`h-4 w-4 shrink-0 ${
                        isSelected ? "text-white" : "text-slate-600"
                      }`}
                    />
                    <span
                      className={`text-xs leading-tight ${
                        isSelected
                          ? "font-semibold text-white"
                          : "font-medium text-slate-700"
                      }`}
                    >
                      {tool.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Get Started Section */}
            <div className="space-y-4 mt-18">
              <h2 className="text-base font-bold text-slate-900">
                Get started
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Remove a background",
                    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
                    action: handleOpenBgRemover,
                  },
                  {
                    title: "Generate AI backgrounds",
                    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
                    action: () => {},
                  },
                  {
                    title: "Edit hundreds of images",
                    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
                    action: () => {},
                  },
                  {
                    title: "Retouch an image",
                    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
                    action: () => {},
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    onClick={card.action}
                    className="group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="h-40 bg-slate-200 overflow-hidden relative">
                      <img
                        src={card.img}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-800">
                        {card.title}
                      </span>
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#fe834d] group-hover:text-white transition-colors">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* ================= 2. BOTTOM PROCESSED BUCKET GALLERY ================= */}
            <div className="space-y-4 pt-8 border-t border-slate-200/80">
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
                        <img
                          src={imgItem.url}
                          alt={imgItem.name}
                          className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Hover Dark Overlay */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[1px]">
                          {/* Quick Download Button on Hover */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(imgItem.url, imgItem.name)
                            }
                            className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                            title="Download Image"
                          >
                            <Download className="h-4 w-4 text-[#fe834d]" />
                          </button>
                        </div>

                        {/* Top Right Delete Button (Shows on Hover) */}
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
            </div>
          </>
        )}
      </main>
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userId={user.id}
        onUploadSuccess={handleUploadSuccess}
      />
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
