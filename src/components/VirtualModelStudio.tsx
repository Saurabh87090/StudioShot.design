"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Sparkles, Download, ArrowLeft, RefreshCw, Layers, Check, X } from 'lucide-react';

const GENDER_CATEGORIES = [
  { id: 'Male', label: 'Male Torso', icon: '👔', desc: 'Standard Athletic Fit' },
  { id: 'Female', label: 'Female Torso', icon: '👗', desc: 'Curved Tailored Fit' },
  { id: 'Child', label: 'Child / Kids', icon: '👕', desc: 'Junior Apparel Fit' },
];

const SKIN_TONES = [
  { id: 'Fair / Ivory', colorBg: 'bg-[#fde0dc]', label: 'Fair' },
  { id: 'Medium / Wheatish', colorBg: 'bg-[#e2b08e]', label: 'Wheatish' },
  { id: 'Warm Tan', colorBg: 'bg-[#c58c62]', label: 'Warm Tan' },
  { id: 'Deep / Dark Tan', colorBg: 'bg-[#8d5524]', label: 'Dark' },
];

const STUDIO_VIBES = [
  'Clean Minimalist White Studio',
  'Traditional & Authentic Ethnic Backdrop',
  'Urban Streetwear Concrete Vibe',
  'Warm Aesthetic Wooden Studio',
  'Luxury Editorial Dark Moody',
];

export default function VirtualModelStudio() {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [garmentStoragePath, setGarmentStoragePath] = useState<string | null>(null);
  const [targetGender, setTargetGender] = useState('Male');
  const [skinTone, setSkinTone] = useState('Medium / Wheatish');
  const [poseStyle, setPoseStyle] = useState(STUDIO_VIBES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [generatedStoragePath, setGeneratedStoragePath] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  // Handle Image Upload & Save to Supabase Storage Bucket ('virtual-studio-assets')
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    try {
      const file = input.files?.[0];
      if (!file) return;

      setUploadError(null);
      if (!file.type.startsWith('image/')) {
        setUploadError('Choose an image file to upload.');
        return;
      }
      if (file.size === 0 || file.size > 10 * 1024 * 1024) {
        setUploadError('Choose an image smaller than 10 MB.');
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/virtual-studio-upload', {
        method: 'POST',
        body: formData,
      });
      const result: {
        imageUrl?: string;
        storagePath?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !result.imageUrl || !result.storagePath) {
        throw new Error(result.error || 'Image upload failed. Please try again.');
      }

      setProductImage(result.imageUrl);
      setGarmentStoragePath(result.storagePath);
    } catch (err) {
      console.error('Error handling upload:', err);
      setUploadError(err instanceof Error ? err.message : 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!productImage || !garmentStoragePath) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    setGeneratedStoragePath(null);
    setDownloadError(null);
    
    try {
      const response = await fetch('/api/generate-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath: garmentStoragePath,
          targetGender,
          skinTone,
          poseStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate model shoot');
      }

      setGeneratedResult(data.generatedImageUrl);
      setGeneratedStoragePath(data.generatedStoragePath);
    } catch (err) {
      console.error('Generation Error:', err);
      alert('AI Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler to download generated image
  const handleDownload = async () => {
    if (!generatedStoragePath || isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(
        `/api/virtual-studio-download?path=${encodeURIComponent(generatedStoragePath)}`,
      );
      if (!response.ok) {
        const result: { error?: string } = await response.json();
        throw new Error(result.error || 'Image download failed.');
      }

      const imageBlob = await response.blob();
      const blobUrl = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `studio-shot-model.${generatedStoragePath.split('.').pop() || 'png'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Image download failed:', err);
      setDownloadError(
        err instanceof Error ? err.message : 'Image download failed. Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-gray-900">
      
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <Link href="/desktop" className="flex items-center text-sm font-medium text-gray-600 hover:text-[#fe8956] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-gray-900">AI Virtual Model Studio</h1>
            <span className="bg-[#fe8956]/15 text-[#fe8956] text-xs font-semibold px-2 py-0.5 rounded-full">
              Database Connected 🚀
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Preview Image Thumbnail Button */}
          {(generatedResult || productImage) && (
            <button
              onClick={() => setIsFullScreenOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-all cursor-pointer"
              title="Click to preview full screen"
            >
              <img 
                src={generatedResult || productImage || ''} 
                alt="Preview Thumbnail" 
                className="w-6 h-6 object-cover rounded border border-gray-200"
              />
              <span className="text-xs">Preview</span>
            </button>
          )}

          {/* Download HD Image Button */}
          <button 
            onClick={handleDownload}
            disabled={!generatedStoragePath || isDownloading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${
              generatedStoragePath && !isDownloading
                ? 'bg-[#fe8956] text-white hover:opacity-90 cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download HD Image'}</span>
          </button>
        </div>
      </header>
      {downloadError && (
        <p role="alert" className="px-6 py-2 text-sm text-red-600">
          {downloadError}
        </p>
      )}

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Control Panel */}
        <div className="w-[440px] bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-6 flex-shrink-0">
          
          {/* Section 1: Upload Garment */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
              <span>Upload Garment Photo </span>
              {productImage && (
                <button 
                onClick={() => {
                  setProductImage(null);
                  setGarmentStoragePath(null);
                  setGeneratedResult(null);
                  setGeneratedStoragePath(null);
                  setDownloadError(null);
                }}
                className="text-[#fe8956] hover:opacity-80 text-xs font-normal cursor-pointer"
              >
                Remove
                </button>
              )}
            </label>

            {!productImage ? (
              <label className="border-2 border-dashed border-gray-300 hover:border-[#fe8956] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-[#fe8956]/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#fe8956]/15 flex items-center justify-center text-[#fe8956] mb-3 group-hover:scale-105 transition-transform">
                  {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {isUploading ? "Uploading to Supabase..." : "Click to upload flat-lay / hanger pic"}
                </span>
                <span className="text-xs text-gray-400 mt-1">Saved in `virtual-studio-assets/garments/`</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-xl border border-gray-200 p-2 bg-gray-50 flex items-center space-x-3">
                <img src={productImage} alt="Uploaded Garment" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Supabase Bucket File</p>
                  <p className="text-xs text-emerald-600 font-medium">Synced & Ready in Bucket</p>
                </div>
              </div>
            )}
            {uploadError && (
              <p role="alert" className="text-xs text-red-600">
                {uploadError}
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Torso Categories */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              2. Select Torso Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {GENDER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTargetGender(cat.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center cursor-pointer ${
                    targetGender === cat.id
                      ? 'bg-[#fe8956]/10 border-[#fe8956] text-[#fe8956] shadow-sm ring-1 ring-[#fe8956]'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-xs font-bold">{cat.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Model Skin Tone */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
              <span>3. Model Skin Tone</span>
              <span className="text-[11px] font-normal text-gray-400 capitalize">{skinTone}</span>
            </label>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSkinTone(tone.id)}
                  className={`w-9 h-9 rounded-full ${tone.colorBg} border-2 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    skinTone === tone.id ? 'border-[#fe8956] ring-2 ring-[#fe8956]/30 scale-105' : 'border-white shadow-sm'
                  }`}
                  title={tone.label}
                >
                  {skinTone === tone.id && <Check className="w-4 h-4 text-gray-800 drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Studio Backdrop & Vibe */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              4. Studio Backdrop & Vibe
            </label>
            <div className="space-y-1.5 mt-2.5 max-h-48 overflow-y pr-1">
              {STUDIO_VIBES.map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => setPoseStyle(vibe)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    poseStyle === vibe
                      ? 'bg-[#fe8956] text-white border-[#fe8956] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{vibe}</span>
                  {poseStyle === vibe && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={!productImage || isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-md flex items-center justify-center space-x-2 transition-all ${
                !productImage 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : isGenerating
                  ? 'bg-[#fe8956]/70 text-white cursor-wait'
                  : 'bg-[#fe8956] hover:opacity-90 text-white cursor-pointer shadow-[#fe8956]/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Ghost Mannequin...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Model Shoot</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-2">Saved to Database Table upon generation</p>
          </div>

        </div>

        {/* Right Preview Canvas Area */}
        <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-8 relative overflow-y-auto">
          
          <div className="absolute top-6 left-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">Virtual Try-On Preview Canvas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Torso: {targetGender} | Tone: {skinTone} | Vibe: {poseStyle}</p>
          </div>

          {/* Canvas Box */}
          <div className="w-full max-w-lg aspect-[3/4] bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col items-center justify-center p-6 relative group overflow-hidden">
            
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#fe8956] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-gray-600 animate-pulse">Mapping fabric folds onto {targetGender.toLowerCase()} torso...</p>
              </div>
            ) : generatedResult || productImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/5 to-transparent rounded-xl pointer-events-none"></div>
                <div className="relative w-3/4 h-3/4 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer" onClick={() => setIsFullScreenOpen(true)}>
                   <img
                     src={generatedResult || productImage || ''}
                     alt={generatedResult ? "Model Result" : "Uploaded garment preview"}
                     className="w-full h-full object-contain filter contrast-105"
                   />
                </div>
                <div className={`mt-4 flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
                  generatedResult
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-[#fe8956]/10 text-[#fe8956] border-[#fe8956]/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${generatedResult ? 'bg-emerald-500' : 'bg-[#fe8956]'}`}></span>
                  <span>{generatedResult ? 'Saved to Database Table & Bucket!' : 'Garment uploaded and ready for virtual try-on'}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <Layers className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">No Model Shoot Generated Yet</h3>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Upload your garment photo to sync with Database, then click &quot;Generate AI Model Shoot&quot;.
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-4 text-center text-xs text-gray-400 flex items-center space-x-1">
            <span>Powered by StudioShot</span>
          </div>

        </div>

      </div>

      {/* Full Screen Preview Modal */}
      {isFullScreenOpen && (generatedResult || productImage) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsFullScreenOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer z-10"
              title="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={generatedResult || productImage || ''}
              alt="Full Screen Preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}