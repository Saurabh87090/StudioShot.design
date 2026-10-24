import React, { useState, useEffect } from "react";
import { X, UploadCloud, Store, Loader2, Check, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ImageUploadModal({
  isOpen,
  onClose,
  userId,
  onUploadSuccess,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [isUploading, setIsUploading] = useState(false);

  // States to store uploaded files, loading state, and selected image state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch uploaded images whenever the modal opens or when switching to the "Uploads" tab
  useEffect(() => {
    if (isOpen && activeTab === "Uploads") {
      fetchUserFiles();
    }
  }, [isOpen, activeTab]);

  // Function to fetch images from the Supabase 'user_files' database table
  const fetchUserFiles = async () => {
    try {
      setIsLoadingFiles(true);

      // Get authenticated user ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const effectiveUserId = userId || user?.id;
      if (!effectiveUserId) return;

      // Fetch user's files ordered by creation date (newest first)
      const { data, error } = await supabase
        .from("user_files")
        .select("*")
        .eq("owner_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUploadedFiles(data || []);
    } catch (error) {
      console.error("Error fetching user files:", error.message);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("You are not logged in. Please sign in again.");

      const effectiveUserId = userId || user.id;
      if (!effectiveUserId) throw new Error("Missing authenticated user ID.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${effectiveUserId}/${fileName}`;

      // Upload file to Supabase Storage Bucket ('user-uploads')
      const { error: storageError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Insert Metadata into 'user_files' database table
      const { data: dbData, error: dbError } = await supabase
        .from("user_files")
        .insert([
          {
            owner_id: effectiveUserId,
            file_name: file.name,
            file_size: file.size,
            file_format: file.type,
            file_path: filePath,
            file_url: publicUrl,
          },
        ])
        .select();

      if (dbError) throw dbError;

      const newFile = dbData[0];

      // Refresh files list from database to avoid duplicate state synchronization glitches
      await fetchUserFiles();

      // Automatically select the new file
      setSelectedFile(newFile);

      if (onUploadSuccess) {
        onUploadSuccess(newFile);
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
      // Reset input value so re-uploading the same file triggers onChange
      event.target.value = "";
    }
  };

  // Delete File Handler
  const handleDeleteFile = async (e, file) => {
    e.stopPropagation(); // Stop click from selecting image

    if (!window.confirm(`Are you sure you want to delete "${file.file_name}"?`)) {
      return;
    }

    try {
      setDeletingId(file.id);

      // 1. Delete from Supabase Storage
      if (file.file_path) {
        const { error: storageError } = await supabase.storage
          .from("user-uploads")
          .remove([file.file_path]);

        if (storageError) {
          console.error("Storage delete warning:", storageError.message);
        }
      }

      // 2. Delete from Database Table
      const { error: dbError } = await supabase
        .from("user_files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;

      // 3. Remove from UI state
      setUploadedFiles((prev) => prev.filter((item) => item.id !== file.id));

      // Unselect if deleted file was selected
      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error deleting file:", error.message);
      alert("Failed to delete image: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Confirm selection and pass selected image back to parent component
  const handleAddSelectedImage = () => {
    if (selectedFile) {
      if (onUploadSuccess) {
        onUploadSuccess(selectedFile);
      }
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-slate-800 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Add images</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-6 px-6 pt-3 text-xs border-b border-slate-200 text-slate-500 font-medium overflow-x-auto">
          {[
            "All",
            "Uploads",
            "Shopify products",
            "AI images",
            "Designs",
            "Google Drive",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors shrink-0 ${
                activeTab === tab
                  ? "text-[#fe8956] border-b-2 border-[#fe8956] font-bold"
                  : "hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/60 hover:border-[#fe8956] transition-colors cursor-pointer group">
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-center space-y-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe8956] text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload images</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isUploading ? "Storing in Supabase..." : "or drop them here"}
              </p>
            </label>
          </div>

          {/* Render Uploaded Files ONLY when 'Uploads' tab is active */}
          {activeTab === "Uploads" && (
            <div className="space-y-3">
              <h3 className="text-xs text-slate-500 font-semibold">
                Your Uploads
              </h3>

              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-xs">Loading images...</span>
                </div>
              ) : uploadedFiles.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400">
                    No uploads yet. Upload an image to see it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {uploadedFiles.map((file, idx) => {
                    const isSelected = selectedFile?.id === file.id;
                    const isDeleting = deletingId === file.id;

                    return (
                      <div
                        key={file.id || file.file_path || idx}
                        onClick={() => setSelectedFile(file)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                          isSelected
                            ? "border-[#fe8956] ring-2 ring-[#fe8956]/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={file.file_url}
                          alt={file.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />

                        {/* Top-Right Selection Indicator */}
                        {isSelected && !isDeleting && (
                          <div className="absolute top-2 left-2 bg-[#fe8956] text-white p-1 rounded-full shadow-sm">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        {/* Top-Right Hover Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFile(e, file)}
                          disabled={isDeleting}
                          title="Delete image"
                          className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Shopify Integration Box (Shown on 'All' or 'Shopify products' tab) */}
          {(activeTab === "Shopify products" || activeTab === "All") && (
            <div className="space-y-3">
              <h3 className="text-xs text-slate-500 font-semibold">
                Shopify products
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 text-center">
                <p className="text-xs text-slate-600">
                  Import product images directly from your Shopify store.
                </p>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors">
                  <Store className="h-3.5 w-3.5" />
                  Connect to Shopify
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium truncate max-w-[250px]">
            {selectedFile
              ? `Selected: ${selectedFile.file_name}`
              : "Select images"}
          </span>
          <button
            onClick={handleAddSelectedImage}
            disabled={!selectedFile}
            className={`px-5 py-2 bg-[#fe8956] text-white rounded-xl text-xs font-semibold transition-opacity shadow-xs ${
              selectedFile
                ? "hover:opacity-90 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Add images
          </button>
        </div>
      </div>
    </div>
  );
}