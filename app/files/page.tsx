"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { ImageViewerModal } from "@/components/files/image-viewer-modal";
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
} from "lucide-react";
import { formatBytes, formatRelativeDate } from "@/lib/utils";

export default function FilesPage() {
  const { files, technologies, topics, addFile, deleteFile, updateFile } = useLearningStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadType, setUploadType] = useState("application/pdf");
  const [uploadSize, setUploadSize] = useState(1500000);
  const [isHandwritten, setIsHandwritten] = useState(false);
  const [uploadTechId, setUploadTechId] = useState("");
  const [uploadTopicId, setUploadTopicId] = useState("");

  // Zoomable Image Modal
  const [viewerImage, setViewerImage] = useState<{ url: string; title: string } | null>(null);

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = selectedTech === "All" || f.technology_id === selectedTech;

    if (activeTab === "pdf") return matchesSearch && matchesTech && f.file_type.includes("pdf");
    if (activeTab === "handwritten") return matchesSearch && matchesTech && f.is_handwritten;
    if (activeTab === "images") return matchesSearch && matchesTech && f.file_type.startsWith("image/");
    return matchesSearch && matchesTech;
  });

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilename.trim()) return;

    addFile({
      filename: uploadFilename.trim(),
      file_type: isHandwritten ? "image/jpeg" : uploadType,
      file_size: Number(uploadSize),
      public_url: uploadUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80",
      storage_path: `uploads/${uploadFilename.trim()}`,
      is_handwritten: isHandwritten,
      technology_id: uploadTechId || null,
      topic_id: uploadTopicId || null,
    });

    setUploadFilename("");
    setUploadUrl("");
    setIsUploadOpen(false);
  };

  const getFileIcon = (file: any) => {
    if (file.is_handwritten) return <Camera className="h-5 w-5 text-amber-500" />;
    if (file.file_type.includes("pdf")) return <FileText className="h-5 w-5 text-rose-500" />;
    if (file.file_type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-cyan-500" />;
    return <FolderArchive className="h-5 w-5 text-indigo-500" />;
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
            Store PDFs, architecture diagrams, handwritten note scans, and technical reference attachments.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2 shadow-sm shadow-primary/25">
          <Upload className="h-4 w-4" /> Upload File / Note Scan
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
              badge={files.filter((f) => f.file_type.includes("pdf")).length}
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
              badge={files.filter((f) => f.file_type.startsWith("image/")).length}
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
              No handwritten note scans uploaded yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFiles.map((file) => {
                const tech = technologies.find((t) => t.id === file.technology_id);
                const topic = topics.find((t) => t.id === file.topic_id);

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
                Upload PDFs, cheat sheets, handwritten sketches, or documentation files.
              </p>
              <Button onClick={() => setIsUploadOpen(true)} className="mt-4 gap-2">
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => {
                const tech = technologies.find((t) => t.id === file.technology_id);
                const topic = topics.find((t) => t.id === file.topic_id);

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
                      ) : (
                        <a
                          href={file.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Open File
                        </a>
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
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Learning Material">
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Filename</label>
            <Input
              placeholder="e.g. Spring_Security_Cheat_Sheet.pdf, JWT_Notes_Photo.jpg"
              value={uploadFilename}
              onChange={(e) => setUploadFilename(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">File Type</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="application/pdf" className="bg-card">PDF Document (*.pdf)</option>
              <option value="image/jpeg" className="bg-card">JPG / JPEG Image (*.jpg)</option>
              <option value="image/png" className="bg-card">PNG Image (*.png)</option>
              <option value="text/plain" className="bg-card">Text Document (*.txt)</option>
              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="bg-card">DOCX Document</option>
            </select>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/60">
            <input
              type="checkbox"
              id="is_handwritten_chk"
              checked={isHandwritten}
              onChange={(e) => setIsHandwritten(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="is_handwritten_chk" className="text-xs font-medium text-foreground cursor-pointer">
              This is a photo/scan of <strong>Handwritten Notes</strong> (enables gallery zoom viewer)
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Public URL / Image Link (Optional)</label>
            <Input
              placeholder="https://... (or leave blank to use placeholder link)"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Associate Technology</label>
              <select
                value={uploadTechId}
                onChange={(e) => setUploadTechId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
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
              <label className="text-xs font-semibold text-foreground mb-1 block">Associate Topic</label>
              <select
                value={uploadTopicId}
                onChange={(e) => setUploadTopicId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="" className="bg-card">None</option>
                {topics
                  .filter((t) => !uploadTechId || t.technology_id === uploadTechId)
                  .map((t) => (
                    <option key={t.id} value={t.id} className="bg-card">
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Upload & Save Metadata</Button>
          </div>
        </form>
      </Modal>

      {/* Zoomable Image Viewer */}
      {viewerImage && (
        <ImageViewerModal
          isOpen={Boolean(viewerImage)}
          onClose={() => setViewerImage(null)}
          imageUrl={viewerImage.url}
          title={viewerImage.title}
        />
      )}
    </div>
  );
}
