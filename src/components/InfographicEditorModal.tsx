"use client";

import React, { useState, useRef } from "react";
import { X, Type, Sparkles, Download, Save, Trash2, Move, Layout } from "lucide-react";

// Curated 16 Aesthetic E-commerce & Design Fonts
export const CURATED_FONTS = [
  { name: "Inter (Modern Sans)", value: "'Inter', sans-serif" },
  { name: "Poppins (Bold Ecom)", value: "'Poppins', sans-serif" },
  { name: "Montserrat (Clean UI)", value: "'Montserrat', sans-serif" },
  { name: "Playfair Display (Luxury Serif)", value: "'Playfair Display', serif" },
  { name: "Bebas Neue (Punchy Header)", value: "'Bebas Neue', sans-serif" },
  { name: "Cinzel (Royal & Premium)", value: "'Cinzel', serif" },
  { name: "Oswald (High Impact)", value: "'Oswald', sans-serif" },
  { name: "Raleway (Elegant Minimal)", value: "'Raleway', sans-serif" },
  { name: "Quicksand (Soft & Rounded)", value: "'Quicksand', sans-serif" },
  { name: "Merriweather (Classic Editorial)", value: "'Merriweather', serif" },
  { name: "Ubuntu (Tech & Gadgets)", value: "'Ubuntu', sans-serif" },
  { name: "Pacifico (Handwritten Script)", value: "'Pacifico', cursive" },
  { name: "Dancing Script (Cursive Flow)", value: "'Dancing Script', cursive" },
  { name: "Lobster (Fun & Bold)", value: "'Lobster', cursive" },
  { name: "Anton (Heavy Display)", value: "'Anton', sans-serif" },
  { name: "Fira Code (Code/Tech)", value: "'Fira Code', monospace" },
];

interface TextLayer {
  id: string;
  text: string;
  x: number; // percentage from left
  y: number; // percentage from top
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
}

interface InfographicEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  productTitle: string;
  features: { id: string; title: string; desc: string }[];
  onSave: (newImageUrl: string) => void;
}

export default function InfographicEditorModal({
  isOpen,
  onClose,
  imageUrl,
  productTitle,
  features,
  onSave,
}: InfographicEditorModalProps) {
  if (!isOpen) return null;

  // Initialize text layers from product title and features
  const [layers, setLayers] = useState<TextLayer[]>([
    {
      id: "title",
      text: productTitle || "Awesome Product",
      x: 10,
      y: 10,
      fontSize: 28,
      fontFamily: "'Poppins', sans-serif",
      color: "#ffffff",
      isBold: true,
    },
    ...features.slice(0, 3).map((f, idx) => ({
      id: f.id,
      text: `✔ ${f.title}`,
      x: 10,
      y: 30 + idx * 15,
      fontSize: 18,
      fontFamily: "'Inter', sans-serif",
      color: "#ffffff",
      isBold: false,
    })),
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string>(layers[0]?.id || "");
  const [selectedFont, setSelectedFont] = useState(CURATED_FONTS[0].value);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const activeLayer = layers.find((l) => l.id === selectedLayerId);

  const handleTextChange = (text: string) => {
    setLayers(layers.map((l) => (l.id === selectedLayerId ? { ...l, text } : l)));
  };

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    setLayers(
      layers.map((l) => (l.id === selectedLayerId ? { ...l, fontFamily: fontValue } : l))
    );
  };

  const handleColorChange = (color: string) => {
    setLayers(
      layers.map((l) => (l.id === selectedLayerId ? { ...l, color } : l))
    );
  };

  const handleFontSizeChange = (size: number) => {
    setLayers(
      layers.map((l) => (l.id === selectedLayerId ? { ...l, fontSize: size } : l))
    );
  };

  const addCustomTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: "Double click to edit badge/text",
      x: 20,
      y: 70,
      fontSize: 20,
      fontFamily: CURATED_FONTS[0].value,
      color: "#fe834d",
      isBold: true,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    if (selectedLayerId === id && layers.length > 0) {
      setSelectedLayerId(layers[0].id);
    }
  };

  // Save & Render Final Image using HTML5 Canvas
  const handleSaveCanvas = async () => {
    setIsExporting(true);
    try {
      if (!imageUrl) return;

      // Create an offscreen canvas to merge image and text layers
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      canvas.width = img.naturalWidth || 1080;
      canvas.height = img.naturalHeight || 1080;

      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw each text layer onto canvas
      layers.forEach((layer) => {
        ctx.font = `${layer.isBold ? "bold" : "normal"} ${
          (layer.fontSize / 400) * canvas.width
        }px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10;
        ctx.fillText(
          layer.text,
          (layer.x / 100) * canvas.width,
          (layer.y / 100) * canvas.height
        );
      });

      const finalDataUrl = canvas.toDataURL("image/png");
      onSave(finalDataUrl);
    } catch (err) {
      console.error("Error generating final canvas image:", err);
      alert("Failed to render final image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl text-slate-100">
        
        {/* TOP NAVBAR */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#fe834d] animate-pulse"></span>
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              Canva Studio Pro — Infographic Editor
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveCanvas}
              disabled={isExporting}
              className="px-4 py-2 bg-[#fe834d] hover:bg-[#e06f3b] text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isExporting ? "Rendering Image..." : "Save Changes to Dashboard"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EDITOR WORKSPACE BODY */}
        flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT SIDEBAR: LAYERS & FONTS */}
          <div className="lg:col-span-4 bg-slate-950/70 border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto">
            
            {/* Add Custom Text Button */}
            <button
              type="button"
              onClick={addCustomTextLayer}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Type className="w-4 h-4 text-[#fe834d]" /> Add Custom Badge / Text
            </button>

            {/* Layers List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Text Layers ({layers.length})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                      selectedLayerId === layer.id
                        ? "bg-[#fe834d]/10 border-[#fe834d] text-white font-semibold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate max-w-[180px]">{layer.text}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Layer Editor Controls */}
            {activeLayer && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold text-[#fe834d] uppercase tracking-wider">
                  Edit Selected Layer
                </span>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={activeLayer.text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:border-[#fe834d]"
                  />
                </div>

                {/* Aesthetic Font Selector (16 Curated Fonts) */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Aesthetic Font Family ({CURATED_FONTS.length} Curated)
                  </label>
                  <select
                    value={activeLayer.fontFamily}
                    onChange={(e) => handleFontChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:border-[#fe834d] cursor-pointer"
                  >
                    {CURATED_FONTS.map((font, idx) => (
                      <option key={idx} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size & Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Font Size ({activeLayer.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={72}
                      value={activeLayer.fontSize}
                      onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                      className="w-full accent-[#fe834d]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeLayer.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-mono">{activeLayer.color}</span>
                    </div>
                  </div>
                </div>

                {/* Positioning sliders */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Position X ({activeLayer.x}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={activeLayer.x}
                      onChange={(e) =>
                        setLayers(
                          layers.map((l) =>
                            l.id === selectedLayerId ? { ...l, x: Number(e.target.value) } : l
                          )
                        )
                      }
                      className="w-full accent-[#fe834d]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Position Y ({activeLayer.y}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={95}
                      value={activeLayer.y}
                      onChange={(e) =>
                        setLayers(
                          layers.map((l) =>
                            l.id === selectedLayerId ? { ...l, y: Number(e.target.value) } : l
                          )
                        )
                      }
                      className="w-full accent-[#fe834d]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PREVIEW CANVAS AREA */}
          <div className="lg:col-span-8 bg-slate-900/50 p-6 flex items-center justify-center relative overflow-hidden">
            <div
              ref={canvasRef}
              className="relative aspect-square max-h-[70vh] bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Editor Background"
                  className="w-full h-full object-contain select-none"
                />
              ) : (
                <div className="text-slate-500 text-xs">No Image Loaded</div>
              )}

              {/* Interactive Live Text Overlays */}
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  style={{
                    position: "absolute",
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    fontFamily: layer.fontFamily,
                    fontSize: `${layer.fontSize}px`,
                    color: layer.color,
                    fontWeight: layer.isBold ? "bold" : "normal",
                    textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
                    cursor: "move",
                  }}
                  className={`select-none p-1 transition-all ${
                    selectedLayerId === layer.id ? "ring-2 ring-[#fe834d] bg-black/30 rounded" : ""
                  }`}
                >
                  {layer.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}