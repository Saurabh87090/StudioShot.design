"use client";

import { useState } from "react";
import {
  UploadCloud,
  Sparkles,
  Check,
  Download,
  Copy,
  Eye,
  RefreshCw,
  Sun,
  Layers,
  ArrowLeft,
  CheckCircle2,
  X,
  ShoppingBag,
  ShoppingCart,
  Store,
  Zap,
  Package,
  Ratio,
  Info,
  Globe,
} from "lucide-react";
import Link from "next/link";
import OutOfTokensModal from "@/components/OutOfTokensModal";
import { useGenerationTokenGuard } from "@/hooks/use-generation-token-guard";

interface ProcessedResult {
  url: string;
  platform: string;
  background: string;
  aspectRatio: string;
}

export default function ListingDashboardPage() {
  const {
    isOutOfTokensModalOpen,
    setIsOutOfTokensModalOpen,
    checkTokenBalance,
    handleOutOfTokensResponse,
  } = useGenerationTokenGuard();

  // Input States
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Amazon");
  const [customRatio, setCustomRatio] = useState<string>("1:1");
  const [isCustomRatioActive, setIsCustomRatioActive] = useState<boolean>(false);
  
  const [backgroundColor, setBackgroundColor] = useState<string>(
    "Pure White (#FFFFFF)"
  );
  const [enhanceLighting, setEnhanceLighting] = useState<boolean>(true);
  const [addShadow, setAddShadow] = useState<boolean>(true);

  // Processing & Progress States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generatedResult, setGeneratedResult] =
    useState<ProcessedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Expanded World-Famous E-Commerce Platforms Config with Aspect Ratios
  const platforms = [
    {
      id: "Amazon",
      label: "Amazon",
      icon: Package,
      defaultRatio: "1:1",
      rules: "1:1 Square (Pure White Background, min 1000px for zoom)",
    },
    {
      id: "Flipkart",
      label: "Flipkart",
      icon: ShoppingCart,
      defaultRatio: "1:1",
      rules: "1:1 Square (Clean Studio Background, min 1100x1100)",
    },
    {
      id: "Alibaba",
      label: "Alibaba",
      icon: Globe,
      defaultRatio: "1:1",
      rules: "1:1 Square (Optimized for wholesale catalog listing)",
    },
    {
      id: "eBay",
      label: "eBay",
      icon: Store,
      defaultRatio: "1:1",
      rules: "1:1 Square (High contrast background, centered subject)",
    },
    {
      id: "Walmart",
      label: "Walmart",
      icon: Zap,
      defaultRatio: "1:1",
      rules: "1:1 Square (Professional studio lighting compliance)",
    },
    {
      id: "Shopify",
      label: "Shopify",
      icon: ShoppingBag,
      defaultRatio: "1:1",
      rules: "1:1 or Custom Ratio (High Resolution D2C Storefront Banner)",
    },
    {
      id: "Etsy",
      label: "Etsy",
      icon: Package,
      defaultRatio: "4:3",
      rules: "4:3 Horizontal (Optimized for handmade & vintage aesthetics)",
    },
  ];

  // Preset aspect ratio quick chips
  const ratioPresets = ["1:1", "3:4", "4:3", "16:9", "9:16"];

  // Background Presets
  const backgroundOptions = [
    { label: "Pure White (#FFFFFF)", color: "#FFFFFF" },
    { label: "Light Studio Grey", color: "#F8FAFC" },
    { label: "Warm Beige", color: "#FDFBF7" },
    {
      label: "Soft Gradient",
      color: "linear-gradient(to right, #eff6ff, #f5f3ff)",
    },
    { label: "Dark Premium Studio", color: "#0F172A" },
  ];

  const currentPlatformConfig = platforms.find((p) => p.id === selectedPlatform);

  // Effective Ratio based on selection mode
  const targetAspectRatio = isCustomRatioActive
    ? customRatio
    : currentPlatformConfig?.defaultRatio || "1:1";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setGeneratedResult(null);
      setErrorMsg(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedResult(null);
    setErrorMsg(null);
    setDownloadError(null);
    setIsPreviewOpen(false);
  };

  const handleDownload = async () => {
    if (!generatedResult || isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(generatedResult.url);
      if (!response.ok) {
        throw new Error("The generated image could not be downloaded.");
      }

      const imageBlob = await response.blob();
      const blobUrl = URL.createObjectURL(imageBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `marketplace-${generatedResult.platform.toLowerCase()}-listing.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Listing image download failed:", error);
      setDownloadError("Image download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ================= AI IMAGE GENERATION WITH LIVE PROGRESS =================
  const handleGenerate = async () => {
    if (!selectedImage) {
      setErrorMsg("Please upload an image first.");
      return;
    }

    try {
      if (!(await checkTokenBalance())) return;
    } catch (error) {
      console.error("Could not verify generation token balance:", error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Could not check your token balance.",
      );
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10); // Start progress at 10%
    setGeneratedResult(null);
    setErrorMsg(null);

    // Smooth progress interval timer (simulates progress up to 90% while waiting for API response)
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 700);

    try {
      // Prepare the payload for the image generation route.
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("platform", selectedPlatform);
      formData.append("aspectRatio", targetAspectRatio);
      formData.append("platformRules", currentPlatformConfig?.rules || "");
      formData.append("background", backgroundColor);
      formData.append("enhanceLighting", String(enhanceLighting));
      formData.append("addShadow", String(addShadow));
      // Call the server-side image generation route.
      const response = await fetch("/api/generate-listing", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100); // Complete on success

      const data = await response.json();

      if (handleOutOfTokensResponse(response, data)) return;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to process image.");
      }

      // Update UI state with public URL
      setGeneratedResult({
        url: data.processedImageUrl,
        platform: selectedPlatform,
        background: backgroundColor,
        aspectRatio: targetAspectRatio,
      });
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error("Pipeline Error:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "An error occurred during AI image generation."
      );
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-slate-800 lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* ================= LEFT CONTROLS PANEL ================= */}
      <aside className="flex w-full shrink-0 flex-col justify-between border-b border-slate-200 bg-slate-50/60 p-4 sm:p-6 lg:w-[520px] lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <div className="space-y-6">
          {/* Header Nav */}
          <div className="flex items-center justify-between">
            <Link
              href="/desktop"
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#fe834d] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-[#fe834d]/10 text-[#fe834d] px-3 py-1 rounded-full border border-[#fe834d]/20">
              E-Com Listing AI
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              E-Com Listing AI
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create compliance-ready product listings for top global channels.
            </p>
          </div>

          {/* 1. Image Upload Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              1. Upload Product Photo
            </label>

            {imagePreview ? (
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow-xs group">
                <img
                  src={imagePreview ?? ""}
                  alt="Product Input"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-[#fe834d] text-white rounded-full transition-colors cursor-pointer shadow-md"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-[#fe834d] rounded-2xl bg-white cursor-pointer transition-all group shadow-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-[#fe834d]/10 text-[#fe834d] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click or drop image to upload
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, or WEBP (Max 10MB)
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* 2. Platform Selector & Compliance Specs */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>2. Select Target Marketplace</span>
              <span className="text-[10px] font-normal text-slate-400">
                Auto-applies listing rules
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => {
                const IconComponent = p.icon;
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      setIsCustomRatioActive(false);
                    }}
                    className={`flex min-h-11 items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer lg:min-h-0 ${
                      isSelected
                        ? "bg-[#fe834d] text-white border-[#fe834d] shadow-md shadow-[#fe834d]/20"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#fe834d] hover:text-[#fe834d]"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Platform Requirement Info Banner */}
            {currentPlatformConfig && (
              <div className="p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                <Info className="h-3.5 w-3.5 text-[#fe834d] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">
                    {currentPlatformConfig.label} Rule:
                  </span>{" "}
                  {currentPlatformConfig.rules}
                </div>
              </div>
            )}
          </div>

          {/* 3. Aspect Ratio Control (Auto vs Custom) */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Ratio className="h-3.5 w-3.5 text-[#fe834d]" />
                Image Aspect Ratio
              </label>
              <button
                type="button"
                onClick={() => setIsCustomRatioActive(!isCustomRatioActive)}
                className="text-[11px] font-semibold text-[#fe834d] hover:underline cursor-pointer"
              >
                {isCustomRatioActive ? "Use Platform Default" : "Set Custom Ratio"}
              </button>
            </div>

            {!isCustomRatioActive ? (
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between text-slate-600">
                <span>Selected Platform Ratio:</span>
                <span className="font-bold text-[#fe834d] px-2 py-0.5 bg-[#fe834d]/10 rounded-md">
                  {targetAspectRatio}
                </span>
              </div>
            ) : (
              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ratioPresets.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCustomRatio(r)}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        customRatio === r
                          ? "bg-[#fe834d] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Custom Value:</span>
                  <input
                    type="text"
                    value={customRatio}
                    onChange={(e) => setCustomRatio(e.target.value)}
                    placeholder="e.g. 1:1, 4:3, 16:9"
                    className="flex-1 p-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#fe834d]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Background Preset */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              4. Background Preset
            </label>
            <select
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full p-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#fe834d] cursor-pointer shadow-xs"
            >
              {backgroundOptions.map((bg, idx) => (
                <option key={idx} value={bg.label}>
                  {bg.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Enhancement Options */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="text-xs font-semibold text-slate-700">
              5. Studio Enhancement Settings
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-[#fe834d] transition-colors shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Sun className="h-4 w-4 text-[#fe834d]" />
                  <span className="text-xs font-medium text-slate-700">
                    Studio Lighting Optimization
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enhanceLighting}
                  onChange={(e) => setEnhanceLighting(e.target.checked)}
                  className="accent-[#fe834d] h-4 w-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-[#fe834d] transition-colors shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-[#fe834d]" />
                  <span className="text-xs font-medium text-slate-700">
                    Realistic Drop Contact Shadow
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={addShadow}
                  onChange={(e) => setAddShadow(e.target.checked)}
                  className="accent-[#fe834d] h-4 w-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Action Button with Live Progress Percentage */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={!selectedImage || isGenerating}
            onClick={handleGenerate}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              !selectedImage || isGenerating
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#fe834d] hover:bg-[#e06f3b] text-white cursor-pointer shadow-[#fe834d]/20 hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing Listing ({generationProgress}%)...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate & Save ({selectedPlatform} {targetAspectRatio})
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ================= RIGHT CANVAS AREA ================= */}
      <main className="flex min-w-0 flex-1 flex-col justify-between overflow-y-auto bg-slate-100/50 p-4 sm:p-6 lg:p-8">
        {generatedResult && (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-lg bg-[#fe834d] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download HD"}
            </button>
          </div>
        )}
        {downloadError && (
          <p role="alert" className="mt-2 text-right text-sm text-red-600">
            {downloadError}
          </p>
        )}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!imagePreview && !generatedResult ? (
            <div className="text-center space-y-3 max-w-sm">
              <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                <Store className="h-8 w-8 text-[#fe834d]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No Photo Selected
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload a product image on the left panel and click generate to
                create a studio background via StudioShot AI and save to Database.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="text-center space-y-4">
              <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[#fe834d]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#fe834d] border-t-transparent rounded-full animate-spin"></div>
                <Sparkles className="h-8 w-8 text-[#fe834d]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Processing Product AI Image ({targetAspectRatio}) - {generationProgress}%
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  StudioShot AI generating photo formatted for {selectedPlatform} and persisting in Database...
                </p>
              </div>
            </div>
          ) : generatedResult ? (
            <div className="w-full max-w-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Stored in Supabase ({generatedResult.platform} • {generatedResult.aspectRatio})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedResult.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy Supabase URL"}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
                    title="Clear Canvas"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-square max-h-[500px] mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white flex items-center justify-center p-8">
                <img
                  src={generatedResult.url}
                  alt="Stored Database of StudioShot Result"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-xl aspect-square max-h-[450px] mx-auto rounded-2xl overflow-hidden border border-dashed border-slate-300 bg-white shadow-xs flex items-center justify-center p-6">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-[#fe834d] text-slate-600 hover:text-white rounded-full transition-colors cursor-pointer shadow-xs z-10"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={imagePreview ?? ""}
                alt="Source Input Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>
        {isPreviewOpen && generatedResult && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Generated image preview"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 lg:p-6"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="relative flex max-h-full max-w-5xl items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2 text-slate-700 shadow-lg transition-colors hover:bg-slate-100"
                aria-label="Close image preview"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={generatedResult.url}
                alt="Generated product image preview"
                className="max-h-[85vh] max-w-full rounded-xl bg-white object-contain shadow-2xl"
              />
            </div>
          </div>
        )}
        <OutOfTokensModal
          isOpen={isOutOfTokensModalOpen}
          onClose={() => setIsOutOfTokensModalOpen(false)}
        />
      </main>
    </div>
  );
}