"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { ImageViewerModal } from "@/components/files/image-viewer-modal";
import { PdfViewerModal } from "@/components/files/pdf-viewer-modal";
import { createClient } from "@/lib/supabase/client";
import {
  FolderArchive,
  Upload,
  Search,
  FileText,
  FileCode,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Download,
  Plus,
  ZoomIn,
  Sparkles,
  Camera,
  File,
  X,
  CheckCircle,
  CloudUpload,
  BookOpen,
} from "lucide-react";
import { formatBytes, formatRelativeDate } from "@/lib/utils";

export default function FilesPage() {
  const { files, technologies, topics, addFile, deleteFile, updateFile } = useLearningStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"device" | "url">("device");
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadType, setUploadType] = useState("application/pdf");
  const [uploadSize, setUploadSize] = useState(0);
  const [isHandwritten, setIsHandwritten] = useState(false);
  const [uploadTechId, setUploadTechId] = useState("");
  const [uploadTopicId, setUploadTopicId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Zoomable Image & PDF Modals
  const [viewerImage, setViewerImage] = useState<{ url: string; title: string } | null>(null);
  const [viewerPdf, setViewerPdf] = useState<{ url: string; title: string } | null>(null);

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = selectedTech === "All" || f.technology_id === selectedTech;

    if (activeTab === "pdf") return matchesSearch && matchesTech && f.file_type.includes("pdf");
    if (activeTab === "handwritten") return matchesSearch && matchesTech && f.is_handwritten;
    if (activeTab === "images") return matchesSearch && matchesTech && f.file_type.startsWith("image/");
    return matchesSearch && matchesTech;
  });

  const handleFileSelect = (file: globalThis.File) => {
    setSelectedFile(file);
    setUploadFilename(file.name);
    setUploadSize(file.size);
    setUploadType(file.type || "application/octet-stream");

    const isImg = file.type.startsWith("image/");
    if (isImg) {
      setIsHandwritten(true);
    } else {
      setIsHandwritten(false);
    }

    // Generate local preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFilePreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFilePreviewUrl("");
    setUploadFilename("");
    setUploadUrl("");
    setUploadType("application/pdf");
    setUploadSize(0);
    setIsHandwritten(false);
    setUploadTechId("");
    setUploadTopicId("");
    setIsUploading(false);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilename.trim()) return;

    setIsUploading(true);
    let finalUrl = uploadUrl;

    // If local file was picked, attempt Supabase Storage upload or use Data URL
    if (selectedFile) {
      finalUrl = filePreviewUrl; // Default to base64 Data URL for instant rendering

      try {
        const supabase = createClient();
        if (supabase) {
          const fileExt = selectedFile.name.split(".").pop();
          const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const storagePath = `documents/${Date.now()}_${cleanName}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("learning-files")
            .upload(storagePath, selectedFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (!uploadErr && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from("learning-files")
              .getPublicUrl(storagePath);

            if (publicUrlData?.publicUrl) {
              finalUrl = publicUrlData.publicUrl;
            }
          }
        }
      } catch (err) {
        console.warn("Storage upload note, saving document locally:", err);
      }
    }

    addFile({
      filename: uploadFilename.trim(),
      file_type: isHandwritten ? (uploadType.startsWith("image/") ? uploadType : "image/jpeg") : uploadType,
      file_size: uploadSize > 0 ? uploadSize : 1500000,
      public_url: finalUrl || (isHandwritten ? "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80" : ""),
      storage_path: selectedFile ? `learning-files/${selectedFile.name}` : `uploads/${uploadFilename.trim()}`,
      is_handwritten: isHandwritten,
      technology_id: uploadTechId || null,
      topic_id: uploadTopicId || null,
    });

    resetUploadForm();
    setIsUploadOpen(false);
  };

  const getFileIcon = (file: any) => {
    if (file.is_handwritten) return <Camera className="h-5 w-5 text-amber-500" />;
    if (file.file_type?.includes("pdf") || file.filename?.endsWith(".pdf")) return <FileText className="h-5 w-5 text-rose-500" />;
    if (file.file_type?.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-cyan-500" />;
    return <File className="h-5 w-5 text-indigo-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <FolderArchive className="h-7 w-7 text-primary" /> Files & Handwritten Notes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload PDFs, documents, architecture diagrams, handwritten note photos, and technical cheat sheets.
          </p>
        </div>
        <Button onClick={() => { resetUploadForm(); setIsUploadOpen(true); }} className="gap-2 shadow-sm shadow-primary/25">
          <Upload className="h-4 w-4" /> Upload Document / Note Scan
        </Button>
      </div>

      {/* Tabs & Filters */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all" badge={files.length} className="text-xs">
              All Files
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              badge={files.filter((f) => f.file_type?.includes("pdf") || f.filename?.endsWith(".pdf")).length}
              className="text-xs"
            >
              PDFs
            </TabsTrigger>
            <TabsTrigger
              value="handwritten"
              badge={files.filter((f) => f.is_handwritten).length}
              className="text-xs"
            >
              Handwritten
            </TabsTrigger>
            <TabsTrigger
              value="images"
              badge={files.filter((f) => f.file_type?.startsWith("image/")).length}
              className="text-xs"
            >
              Images
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="w-full sm:w-56">
              <Input
                placeholder="Search filenames..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs sm:text-sm"
            >
              <option value="All">All Technologies</option>
              {technologies.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content View: Handwritten Gallery Mode or Standard File Cards */}
        {activeTab === "handwritten" ? (
          /* Handwritten Notes Gallery Grid */
          filteredFiles.length === 0 ? (
            <Card className="p-12 text-center text-xs text-muted-foreground">
              No handwritten note scans uploaded yet. Click &quot;Upload Document / Note Scan&quot; above to add your first photo.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFiles.map((file) => {
                const tech = technologies.find((t) => t.id === file.technology_id);

                return (
                  <Card
                    key={file.id}
                    hoverEffect
                    className="overflow-hidden group flex flex-col justify-between"
                  >
                    <div
                      className="relative h-48 bg-secondary/80 overflow-hidden cursor-pointer flex items-center justify-center"
                      onClick={() =>
                        setViewerImage({
                          url: file.public_url || "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80",
                          title: file.filename,
                        })
                      }
                    >
                      <img
                        src={file.public_url || "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80"}
                        alt={file.filename}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs">
                        <ZoomIn className="h-4 w-4" /> Click to Zoom & Inspect
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-foreground truncate">
                          {file.filename}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Delete '${file.filename}'?`)) deleteFile(file.id);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {tech && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[10px] text-white font-bold"
                            style={{ backgroundColor: tech.color || "#6366f1" }}
                          >
                            {tech.name}
                          </span>
                        )}
                        <span>{formatBytes(file.file_size)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          /* Standard File Grid */
          filteredFiles.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-3">
                <FolderArchive className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">No Files Uploaded</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Upload PDFs, cheat sheets, handwritten sketches, or documentation files directly from your computer.
              </p>
              <Button onClick={() => { resetUploadForm(); setIsUploadOpen(true); }} className="mt-4 gap-2">
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => {
                const tech = technologies.find((t) => t.id === file.technology_id);

                return (
                  <Card key={file.id} hoverEffect className="p-4 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary shrink-0">
                        {getFileIcon(file)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate">{file.filename}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatBytes(file.file_size)}</span>
                          <span>·</span>
                          <span>{formatRelativeDate(file.created_at)}</span>
                        </div>
                        {tech && (
                          <div className="mt-2">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs inline-block"
                              style={{ backgroundColor: tech.color || "#6366f1" }}
                            >
                              {tech.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      {file.is_handwritten && file.public_url ? (
                        <button
                          onClick={() => setViewerImage({ url: file.public_url!, title: file.filename })}
                          className="text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          <ZoomIn className="h-3.5 w-3.5" /> Inspect Scan
                        </button>
                      ) : (file.file_type?.includes("pdf") || file.filename?.endsWith(".pdf")) && file.public_url ? (
                        <button
                          onClick={() => setViewerPdf({ url: file.public_url!, title: file.filename })}
                          className="text-rose-500 font-semibold hover:underline flex items-center gap-1.5"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> Read PDF
                        </button>
                      ) : (
                        file.public_url ? (
                          <a
                            href={file.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={file.filename}
                            className="text-primary font-semibold hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View / Download
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Local Document</span>
                        )
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Delete file '${file.filename}'?`)) deleteFile(file.id);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        )}
      </Tabs>

      {/* Upload File / Note Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Learning Material" maxWidth="lg">
        <form onSubmit={handleFileUpload} className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => setUploadMode("device")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                uploadMode === "device"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📁 Choose File from Device
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                uploadMode === "url"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🔗 Link via Web URL
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            accept="application/pdf,image/*,.docx,.doc,.txt,.md,.zip"
            className="hidden"
          />

          {uploadMode === "device" ? (
            /* Drag and Drop Zone */
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary bg-primary/10 scale-[0.99]"
                    : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/40"
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center text-center space-y-2">
                    {selectedFile.type.startsWith("image/") && filePreviewUrl ? (
                      <div className="h-24 w-32 rounded-lg overflow-hidden border border-border shadow-xs">
                        <img
                          src={filePreviewUrl}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {selectedFile.type.includes("pdf") ? (
                          <FileText className="h-6 w-6" />
                        ) : (
                          <CheckCircle className="h-6 w-6" />
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-foreground truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatBytes(selectedFile.size)} • Click or drag to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CloudUpload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Drag and drop your file here, or <span className="text-primary font-bold underline">Browse Device</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Supports PDF, PNG, JPG, DOCX, TXT (up to 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* URL Input Mode */
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Direct Web URL / Link</label>
              <Input
                placeholder="https://example.com/document.pdf or image link"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                required={uploadMode === "url"}
              />
            </div>
          )}

          {/* Filename Input */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Document Title / Filename</label>
            <Input
              placeholder="e.g. Spring_Security_Cheat_Sheet.pdf, Docker_Architecture.png"
              value={uploadFilename}
              onChange={(e) => setUploadFilename(e.target.value)}
              required
            />
          </div>

          {/* File Type Select */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">File Category</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="application/pdf" className="bg-card">PDF Document (*.pdf)</option>
                <option value="image/jpeg" className="bg-card">JPG / JPEG Image (*.jpg)</option>
                <option value="image/png" className="bg-card">PNG Image (*.png)</option>
                <option value="text/plain" className="bg-card">Text Document (*.txt)</option>
                <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="bg-card">Word Document (*.docx)</option>
                <option value="application/octet-stream" className="bg-card">Other Archive / File</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="is_handwritten_chk"
                  checked={isHandwritten}
                  onChange={(e) => setIsHandwritten(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span>Handwritten Note / Scan</span>
              </label>
            </div>
          </div>

          {/* Technology & Topic Association */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Associate Technology</label>
              <select
                value={uploadTechId}
                onChange={(e) => setUploadTechId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="" className="bg-card">None (General Vault)</option>
                {technologies.map((t) => (
                  <option key={t.id} value={t.id} className="bg-card">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Associate Topic (Root Topics Only)</label>
              <select
                value={uploadTopicId}
                onChange={(e) => setUploadTopicId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={!uploadTechId}
              >
                <option value="" className="bg-card">None (General to Technology)</option>
                {topics
                  .filter((top) => top.technology_id === uploadTechId && !top.parent_topic_id)
                  .map((top) => (
                    <option key={top.id} value={top.id} className="bg-card">
                      {top.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading} className="gap-1.5">
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Save & Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Zoomable Image Viewer Modal */}
      {viewerImage && (
        <ImageViewerModal
          isOpen={Boolean(viewerImage)}
          onClose={() => setViewerImage(null)}
          imageUrl={viewerImage.url}
          title={viewerImage.title}
        />
      )}

      {/* In-App PDF Viewer Modal */}
      {viewerPdf && (
        <PdfViewerModal
          isOpen={Boolean(viewerPdf)}
          onClose={() => setViewerPdf(null)}
          pdfUrl={viewerPdf.url}
          title={viewerPdf.title}
        />
      )}
    </div>
  );
}
