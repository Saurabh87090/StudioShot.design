"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Upload,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Download,
  CheckCircle,
  AlertCircle,
  Edit3,
  Type,
  ImageIcon,
} from "lucide-react";
import InfographicEditorModal from "@/components/InfographicEditorModal";
import OutOfTokensModal from "@/components/OutOfTokensModal";
import { useGenerationTokenGuard } from "@/hooks/use-generation-token-guard";

// 21 Aesthetic E-commerce & Design Fonts
export const CURATED_FONTS = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Poppins", value: "'Poppins', sans-serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { name: "Cinzel", value: "'Cinzel', serif" },
  { name: "Oswald", value: "'Oswald', sans-serif" },
  { name: "Raleway", value: "'Raleway', sans-serif" },
  { name: "Quicksand", value: "'Quicksand', sans-serif" },
  { name: "Merriweather", value: "'Merriweather', serif" },
  { name: "Ubuntu", value: "'Ubuntu', sans-serif" },
  { name: "Pacifico", value: "'Pacifico', cursive" },
  { name: "Dancing Script", value: "'Dancing Script', cursive" },
  { name: "Lobster", value: "'Lobster', cursive" },
  { name: "Anton", value: "'Anton', sans-serif" },
  { name: "Fira Code", value: "'Fira Code', monospace" },
  { name: "Lora", value: "'Lora', serif" },
  { name: "Josefin Sans", value: "'Josefin Sans', sans-serif" },
  { name: "Abril Fatface", value: "'Abril Fatface', serif" },
  { name: "Caveat", value: "'Caveat', cursive" },
  { name: "Courier Prime", value: "'Courier Prime', monospace" },
];

interface FeatureItem {
  id: string;
  title: string;
  desc: string;
}

const TOP_CATEGORIES = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Home & Kitchen",
  "Sports & Fitness",
  "Toys & Kids",
  "Footwear & Bags",
  "Jewelry & Watches",
  "Automotive Accessories",
  "Health & Supplements",
  "Other / Custom Category",
];

const MARKETPLACES = [
  { id: "amazon", name: "Amazon", rule: "1:1 Square (Pure White Background)" },
  { id: "flipkart", name: "Flipkart", rule: "1:1 Square (High Visual Pop)" },
  { id: "meesho", name: "Meesho", rule: "3:4 Portrait / 1:1 Square Compliant" },
  { id: "shopify", name: "Shopify", rule: "Flexible Web Dimensions" },
  { id: "blinkit", name: "Blinkit", rule: "1:1 Quick Commerce Format" },
];

const BACKGROUND_STYLES = [
  { id: "white", name: "Clean White (Minimalist Studio)" },
  { id: "dark", name: "Dark Moody (Cinematic Shadows)" },
  { id: "luxury", name: "Luxury Gold (Warm Spotlight)" },
  { id: "nature", name: "Nature Organic (Wood & Stone)" },
  { id: "tech", name: "Futuristic Tech (Cyberpunk Neon)" },
  { id: "vibrant", name: "Vibrant E-Commerce Pop" },
];

export default function InfographicDashboard() {
  const {
    isOutOfTokensModalOpen,
    setIsOutOfTokensModalOpen,
    checkTokenBalance,
    handleOutOfTokensResponse,
  } = useGenerationTokenGuard();

  // Input States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedStoragePath, setUploadedStoragePath] = useState<string | null>(null);

  // New States for Brand Logo & Typography
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [uploadedLogoPath, setUploadedLogoPath] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState(CURATED_FONTS[0].value);
  const [showAllDashboardFonts, setShowAllDashboardFonts] = useState(false);

  const [productTitle, setProductTitle] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("meesho");
  const [category, setCategory] = useState(TOP_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [backgroundStyle, setBackgroundStyle] = useState("white");

  // Minimum 3 Features
  const [features, setFeatures] = useState<FeatureItem[]>([
    {
      id: "1",
      title: "Ergonomic Premium Grip",
      desc: "Custom contoured design for non-slip usage",
    },
    {
      id: "2",
      title: "Ultra-Durable Alloy Shell",
      desc: "Aircraft grade aluminum build",
    },
    {
      id: "3",
      title: "Smart Battery Efficiency",
      desc: "Up to 18 hours continuous runtime",
    },
  ]);

  // Loading & Output States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

  // Handlers for Product Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadedStoragePath(null);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      setIsUploading(true);

      try {
        const response = await fetch("/api/upload-infographic", {
          method: "POST",
          body: formData,
        });
        const responseText = await response.text();
        let data: { success?: boolean; error?: string; storagePath?: string } = {};
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(`Upload failed with status ${response.status}.`);
        }

        if (!response.ok || !data.success || !data.storagePath) {
          throw new Error(data.error || "Image upload to Supabase failed.");
        }

        setUploadedStoragePath(data.storagePath);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadedStoragePath(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Image upload failed.",
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handler for Optional Brand Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrandLogoFile(file);
      setBrandLogoPreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/upload-infographic", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.success && data.storagePath) {
          setUploadedLogoPath(data.storagePath);
        }
      } catch (err) {
        console.error("Logo upload note: using local preview fallback", err);
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedStoragePath(null);
    setGeneratedImage(null);
  };

  const addFeature = () => {
    if (features.length < 5) {
      setFeatures([
        ...features,
        { id: Date.now().toString(), title: "", desc: "" },
      ]);
    }
  };

  const removeFeature = (id: string) => {
    if (features.length <= 3) {
      alert("At least 3 key features are required for a high-converting listing set!");
      return;
    }
    setFeatures(features.filter((f) => f.id !== id));
  };

  const updateFeature = (id: string, field: "title" | "desc", value: string) => {
    setFeatures(
      features.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );
  };

  const handleGenerate = async () => {
    setErrorMessage(null);

    if (!uploadedStoragePath) {
      setErrorMessage("Please wait for the product photo to finish uploading.");
      return;
    }

    if (!productTitle.trim()) {
      setErrorMessage("Please enter your product title.");
      return;
    }

    const filledFeatures = features.filter((f) => f.title.trim() !== "");
    if (filledFeatures.length < 3) {
      setErrorMessage("Please fill at least 3 feature titles.");
      return;
    }

    try {
      if (!(await checkTokenBalance())) return;
    } catch (error) {
      console.error("Could not verify generation token balance:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not check your token balance.",
      );
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    let progress = 10;
    let progressInterval: ReturnType<typeof setInterval> | undefined =
      setInterval(() => {
        progress = Math.min(progress + 15, 90);
        setGenerationProgress(progress);
        if (progress === 90) {
          clearInterval(progressInterval);
          progressInterval = undefined;
        }
      }, 800);

    try {
      const finalCategory =
        category === "Other / Custom Category" ? customCategory : category;

      const payload = {
        storagePath: uploadedStoragePath,
        brandLogoPath: uploadedLogoPath || null,
        productTitle,
        category: finalCategory,
        platform: selectedPlatform,
        backgroundStyle,
        selectedFont,
        features: filledFeatures,
      };

      const response = await fetch("/api/generate-infographic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(progressInterval);
      progressInterval = undefined;
      setGenerationProgress(100);

      const responseText = await response.text();
      let data: {
        success?: boolean;
        error?: string;
        imageUrl?: string;
        outOfTokens?: boolean;
      } = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Generation failed with status ${response.status}.`);
      }

      if (handleOutOfTokensResponse(response, data)) return;

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setErrorMessage(data.error || "Generation failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      clearInterval(progressInterval);
      progressInterval = undefined;
      setGenerationProgress(100);
      setErrorMessage("Network error while connecting to the AI API.");
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const activeMarketplaceRule = MARKETPLACES.find(
    (m) => m.id === selectedPlatform,
  )?.rule;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL */}
        <div className="min-w-0 bg-white border-b border-slate-200 p-4 flex flex-col gap-5 overflow-y-visible sm:p-6 lg:col-span-4 lg:max-h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/desktop"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <span className="px-2.5 py-1 bg-[#fe834d]/10 text-[#fe834d] text-[10px] font-bold rounded-full uppercase tracking-wider">
              StudioShot AI
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Infographic Studio Pro
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate compliance-ready listing cards automatically via AI.
            </p>
          </div>

          {/* Validation Alert */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* STEP 1: UPLOAD PRODUCT PHOTO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#fe834d] text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                Upload Product Photo <span className="text-[#fe834d]">*</span>
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[11px] font-semibold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-[#fe834d] rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 transition relative min-h-32">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="h-28 object-contain rounded-md"
                />
              ) : (
                <div className="text-center">
                  <div className="w-9 h-9 rounded-full bg-[#fe834d]/10 text-[#fe834d] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Click or drop image to upload
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, or WEBP (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* OPTIONAL BRAND LOGO SECTION */}
          <div className="space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#fe834d]" /> Brand Logo (Optional)
              </label>
              {brandLogoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setBrandLogoFile(null);
                    setBrandLogoPreview(null);
                    setUploadedLogoPath(null);
                  }}
                  className="text-[10px] text-red-500 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>

            {!brandLogoPreview ? (
              <label className="border border-dashed border-slate-300 hover:border-[#fe834d] rounded-lg p-2.5 flex items-center justify-center gap-2 bg-white cursor-pointer transition text-xs text-slate-600 font-medium">
                <Upload className="w-3.5 h-3.5 text-[#fe834d]" /> Upload Brand Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                <img src={brandLogoPreview} alt="Logo" className="w-7 h-7 object-contain bg-slate-100 rounded p-1" />
                <span className="text-xs font-medium text-emerald-600">Logo attached for image generation</span>
              </div>
            )}
          </div>

          {/* STEP 2: SELECT MARKETPLACE */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#fe834d] text-white text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              Target Marketplace
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MARKETPLACES.map((mp) => (
                <button
                  key={mp.id}
                  type="button"
                  onClick={() => setSelectedPlatform(mp.id)}
                  className={`min-h-11 py-2 px-3 text-xs font-semibold rounded-lg border transition text-center cursor-pointer lg:min-h-0 ${
                    selectedPlatform === mp.id
                      ? "bg-[#fe834d] text-white border-[#fe834d] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {mp.name}
                </button>
              ))}
            </div>

            {activeMarketplaceRule && (
              <div className="p-2.5 bg-orange-50/60 border border-orange-100 rounded-lg text-[11px] text-slate-600 flex items-center gap-1.5 mt-1">
                <span className="font-bold text-[#fe834d]">Rule:</span>{" "}
                {activeMarketplaceRule}
              </div>
            )}
          </div>

          {/* STEP 3: BACKGROUND STYLE & TYPOGRAPHY FONT (GRID BOXES + VIEW ALL) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#fe834d] text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              Studio Background & Typography
            </label>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Background Style
                </label>
                <select
                  value={backgroundStyle}
                  onChange={(e) => setBackgroundStyle(e.target.value)}
                  className="w-full text-xs border border-slate-200 focus:border-[#fe834d] rounded-lg p-2.5 outline-none bg-white transition cursor-pointer"
                >
                  {BACKGROUND_STYLES.map((bg) => (
                    <option key={bg.id} value={bg.id}>
                      {bg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Selection Section with View All Toggle & Rounded Rectangular Boxes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Type className="w-3 h-3 text-[#fe834d]" /> Font Style ({showAllDashboardFonts ? "21 Options" : "Top 4 Options"})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllDashboardFonts(!showAllDashboardFonts)}
                    className="text-[#fe834d] hover:underline text-[11px] font-bold cursor-pointer"
                  >
                    {showAllDashboardFonts ? "Show Less" : "View All"}
                  </button>
                </div>

                {/* Font Boxes Grid */}
                <div className={`grid grid-cols-2 gap-2 transition-all duration-300 ${showAllDashboardFonts ? "max-h-56 overflow-y-auto pr-1" : ""}`}>
                  {(showAllDashboardFonts ? CURATED_FONTS : CURATED_FONTS.slice(0, 4)).map((font, idx) => {
                    const isSelected = selectedFont === font.value;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedFont(font.value)}
                        style={{ fontFamily: font.value }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center h-12 text-xs cursor-pointer ${
                          isSelected
                            ? "bg-[#fe834d]/10 border-[#fe834d] text-[#fe834d] font-bold shadow-sm ring-1 ring-[#fe834d]"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate w-full">{font.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: DETAILS & FEATURES */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#fe834d] text-white text-[10px] flex items-center justify-center font-bold">
                4
              </span>
              Product Info & Features <span className="text-[#fe834d]">*</span>
            </label>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                Product Title
              </label>
              <input
                type="text"
                placeholder="e.g. Premium Kids Cricket Bat"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full text-xs border border-slate-200 focus:border-[#fe834d] rounded-lg p-2.5 outline-none bg-white transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                Product Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs border border-slate-200 focus:border-[#fe834d] rounded-lg p-2.5 outline-none bg-white transition cursor-pointer"
              >
                {TOP_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {category === "Other / Custom Category" && (
              <input
                type="text"
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full text-xs border border-orange-200 focus:border-[#fe834d] rounded-lg p-2.5 outline-none bg-orange-50/20"
              />
            )}

            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700">
                  Key Features (Min 3 required)
                </span>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-[11px] font-bold text-[#fe834d] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Feature
                </button>
              </div>

              <div className="space-y-2">
                {features.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        #0{idx + 1}
                      </span>
                      {features.length > 3 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(item.id)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Feature Title (e.g. Ergonomic Grip)"
                      value={item.title}
                      onChange={(e) =>
                        updateFeature(item.id, "title", e.target.value)
                      }
                      className="w-full text-xs border border-slate-200 focus:border-[#fe834d] rounded-md p-2 outline-none bg-white transition"
                    />
                    <input
                      type="text"
                      placeholder="Short Benefit Description"
                      value={item.desc}
                      onChange={(e) =>
                        updateFeature(item.id, "desc", e.target.value)
                      }
                      className="w-full text-[11px] border border-slate-200 focus:border-[#fe834d] rounded-md p-2 outline-none bg-white transition"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || isUploading}
            className="w-full py-3.5 bg-[#fe834d] hover:bg-[#e06f3b] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer mt-auto"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 animate-pulse" />
                Uploading image...
              </>
            ) : isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Processing AI Infographic ({generationProgress}%)...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Infographic
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL: DISPLAY PROCESSED IMAGE */}
        <div className="min-w-0 p-4 flex flex-col justify-between bg-[#f8fafc] sm:p-6 lg:col-span-8 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-6 lg:flex-nowrap lg:gap-0">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Listing Preview Canvas
              </h2>
              <p className="text-xs text-slate-400">
                Target Platform:{" "}
                <span className="font-semibold text-slate-700 capitalize">
                  {selectedPlatform}
                </span>{" "}
                | Background:{" "}
                <span className="font-semibold text-[#fe834d] capitalize">
                  {backgroundStyle}
                </span>
              </p>
            </div>

           

              {generatedImage && (
                <a
                  href={generatedImage}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 bg-[#fe834d] hover:bg-[#e06f3b] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download HD
                </a>
              )}
          </div>

          <div className="flex-1 py-8 flex flex-col items-center justify-center">
            {generatedImage ? (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-md max-w-md w-full flex flex-col items-center">
                <div className="relative overflow-hidden rounded-lg bg-slate-50 w-full aspect-square flex items-center justify-center mb-3 border border-slate-100">
                  <img
                    src={generatedImage}
                    alt="AI Generated Infographic"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700">
                    Generated AI Listing Banner
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                    Ready
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md mx-auto my-auto">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#fe834d] border border-orange-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No Generated Infographic Yet
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Upload your product photo, optional brand logo, pick a font style, and
                  click{" "}
                  <span className="text-[#fe834d] font-semibold">
                    Generate AI Infographic
                  </span>
                  .
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Powered by StudioShot</span>
            {generatedImage && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saved in Database Storage
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Infographic Editor Modal Integration */}
      <InfographicEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        imageUrl={generatedImage}
        productTitle={productTitle}
        features={features}
        onSave={(updatedImageUrl: string | null) => {
          if (updatedImageUrl) setGeneratedImage(updatedImageUrl);
          setIsEditorModalOpen(false);
        }}
      />
      <OutOfTokensModal
        isOpen={isOutOfTokensModalOpen}
        onClose={() => setIsOutOfTokensModalOpen(false)}
      />
    </div>
  );
}