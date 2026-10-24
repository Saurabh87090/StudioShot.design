"use client";

import { useState } from "react";

export default function StudioPage() {
  const [loading, setLoading] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState("");
  const [platform, setPlatform] = useState("Amazon");
  const [background, setBackground] = useState("Pure White");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("Please select a product photo first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("platform", platform);
      formData.append("background", background);
      formData.append("userId", "guest_user_id");

      const res = await fetch("/api/generate-listing", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate the studio image.");
      }

      setProcessedImageUrl(data.processedImageUrl);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Marketplace Studio</h1>

      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="product-photo">Product photo: </label>
        <input
          id="product-photo"
          type="file"
          accept="image/*"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Platform: </label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="Amazon">Amazon</option>
          <option value="Flipkart">Flipkart</option>
          <option value="Shopify">Shopify</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Background: </label>
        <select
          value={background}
          onChange={(e) => setBackground(e.target.value)}
        >
          <option value="Pure White">Pure White</option>
          <option value="Studio Studio">Studio Studio</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f97316",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating Image..." : "Generate & Save Marketplace Image"}
      </button>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {processedImageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result:</h3>
          <img
            src={processedImageUrl}
            alt="Generated Result"
            style={{ maxWidth: "400px", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}
