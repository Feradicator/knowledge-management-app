"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { ChecklistManager } from "@/components/topics/checklist-manager";
import { TiptapEditor } from "@/components/notes/tiptap-editor";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Network,
  FolderArchive,
  FileText,
  Plus,
  Play,
  Share2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { getStatusColor, getPriorityColor, formatDateString, formatRelativeDate } from "@/lib/utils";

import { ImageViewerModal } from "@/components/files/image-viewer-modal";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getTopicById,
    getTechnologyById,
    updateTopic,
    updateTopicProgress,
    toggleFavoriteTopic,
    notes,
    files,
    mindMaps,
    addNote,
    updateNote,
    addLearningSession,
    createMindMapFromTopic,
  } = useLearningStore();

  const topic = getTopicById(id);
  const tech = topic ? getTechnologyById(topic.technology_id) : undefined;

  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  if (!topic) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-foreground">Topic Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested topic does not exist or has been removed.
        </p>
        <Link href="/topics" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Topics
          </Button>
        </Link>
      </div>
    );
  }

  // Find or create primary note for this topic
  const topicNote = notes.find((n) => n.topic_id === topic.id);
  const topicFiles = files.filter((f) => f.topic_id === topic.id);
  const topicMindMaps = mindMaps.filter((m) => m.topic_id === topic.id);

  const statusColor = getStatusColor(topic.status);
  const priorityColor = getPriorityColor(topic.priority);

  const handleSaveNote = (html: string) => {
    if (topicNote) {
      updateNote(topicNote.id, { content_html: html });
    } else {
      addNote({
        title: `${topic.name} Study Notes`,
        technology_id: topic.technology_id,
        topic_id: topic.id,
        content_html: html,
        tags: [topic.slug, tech?.slug || "tech"].filter(Boolean),
      });
    }
  };

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    addLearningSession({
      technology_id: topic.technology_id,
      topic_id: topic.id,
      title: `Studied ${topic.name}`,
      duration_minutes: Number(sessionMinutes),
      description: sessionNotes,
      date: new Date().toISOString().split("T")[0],
    });
    setIsLogSessionOpen(false);
    setSessionNotes("");
  };

  const handleCreateMindMap = () => {
    const map = createMindMapFromTopic(topic.id);
    router.push(`/mind-maps/${map.id}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/technologies" className="hover:text-foreground">Technologies</Link>
        <ChevronRight className="h-3 w-3" />
        {tech && (
          <>
            <Link href={`/technologies/${tech.id}`} className="hover:text-foreground font-medium">
              {tech.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground font-semibold truncate">{topic.name}</span>
      </div>

      {/* Main Topic Card Header */}
      <div
        className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-sm relative overflow-hidden"
        style={{ borderTop: `5px solid ${tech?.color || "#6366f1"}` }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: tech?.color || "#6366f1" }}
              >
                {tech?.name || "General"}
              </span>

              {/* Status Select */}
              <select
                value={topic.status}
                onChange={(e) => updateTopic(topic.id, { status: e.target.value as any })}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer ${statusColor.bg} ${statusColor.text} ${statusColor.border} bg-transparent outline-none`}
              >
                <option value="Not Started" className="bg-card text-foreground">Not Started</option>
                <option value="Learning" className="bg-card text-foreground">Learning</option>
                <option value="Completed" className="bg-card text-foreground">Completed</option>
                <option value="Paused" className="bg-card text-foreground">Paused</option>
              </select>

              {/* Priority Select */}
              <select
                value={topic.priority}
                onChange={(e) => updateTopic(topic.id, { priority: e.target.value as any })}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border} bg-transparent outline-none`}
              >
                <option value="High" className="bg-card text-foreground">High Priority</option>
                <option value="Medium" className="bg-card text-foreground">Medium Priority</option>
                <option value="Low" className="bg-card text-foreground">Low Priority</option>
              </select>

              {topic.is_favorite && (
                <Badge variant="warning" className="gap-1">
                  <Star className="h-3 w-3 fill-amber-400" /> Favorited
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {topic.name}
            </h1>

            <p className="text-sm text-muted-foreground">
              {topic.description || "Master key implementation details, security considerations, and edge cases."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavoriteTopic(topic.id)}
              className="gap-1.5"
            >
              <Star
                className={`h-4 w-4 ${
                  topic.is_favorite ? "fill-amber-400 text-amber-400" : ""
                }`}
              />
              <span className="hidden sm:inline">{topic.is_favorite ? "Favorited" : "Favorite"}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsLogSessionOpen(true)}
              className="gap-1.5 shadow-sm shadow-primary/20"
            >
              <Clock className="h-4 w-4" />
              <span>Log Study Time</span>
            </Button>
          </div>
        </div>

        {/* Interactive Progress Bar & Slider */}
        <div className="mt-6 pt-6 border-t border-border/50 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" /> Mastery & Progress:
            </span>
            <span className="font-extrabold text-base text-foreground">{topic.progress}%</span>
          </div>

          <Slider
            value={topic.progress}
            onChange={(val) => updateTopicProgress(topic.id, val)}
            accentColor={tech?.color}
          />
          <p className="text-[11px] text-muted-foreground">
            Drag slider to update mastery progress. Setting to 100% automatically completes the topic!
          </p>
        </div>

        {/* Timestamps */}
        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {topic.last_studied_at && (
            <span>Last studied: <strong>{formatRelativeDate(topic.last_studied_at)}</strong></span>
          )}
          {topic.completed_at && (
            <span className="text-emerald-600 dark:text-emerald-400">
              Completed on: <strong>{formatDateString(topic.completed_at)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Section: Checklist & Quick Media */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <ChecklistManager topicId={topic.id} accentColor={tech?.color} />

          {/* Rich Notes Section with Tiptap Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> My Notes & Insights
              </h3>
              <span className="text-xs text-muted-foreground">Autosaved to vault</span>
            </div>

            <TiptapEditor
              initialContent={
                topicNote?.content_html ||
                `<h2>${topic.name} Overview</h2><p>Document architecture patterns, code snippets, and key takeaways here...</p>`
              }
              onSave={handleSaveNote}
              placeholder={`Write deep notes about ${topic.name}...`}
            />
          </div>
        </div>

        {/* Right 1 Col: Mind Maps, Files & Handwritten Notes */}
        <div className="space-y-6">
          {/* Mind Maps Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-500" /> Mind Maps
              </h4>
              <Button size="sm" variant="subtle" onClick={handleCreateMindMap} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> New Map
              </Button>
            </div>

            {topicMindMaps.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No mind map attached. Click above to auto-generate a concept graph!
              </p>
            ) : (
              <div className="space-y-2">
                {topicMindMaps.map((mm) => (
                  <Link
                    key={mm.id}
                    href={`/mind-maps/${mm.id}`}
                    className="block p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 text-xs transition-colors"
                  >
                    <p className="font-semibold text-foreground truncate">{mm.title}</p>
                    <span className="text-[10px] text-muted-foreground">{mm.nodes_json.length} nodes</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Files & Handwritten Scans Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FolderArchive className="h-4 w-4 text-cyan-500" /> Files & Handwritten Notes
              </h4>
              <Link href="/files">
                <Button size="sm" variant="subtle" className="h-7 text-xs">Manage</Button>
              </Link>
            </div>

            {topicFiles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No PDFs or handwritten scans attached to this topic yet.
              </p>
            ) : (
              <div className="space-y-2">
                {topicFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/50 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderArchive className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">{f.filename}</span>
                    </div>
                    {f.is_handwritten && f.public_url ? (
                      <button
                        onClick={() => setSelectedImage({ url: f.public_url!, title: f.filename })}
                        className="text-primary hover:underline font-semibold shrink-0"
                      >
                        Zoom
                      </button>
                    ) : (
                      <a href={f.public_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline shrink-0">
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Log Study Session Modal */}
      <Modal
        isOpen={isLogSessionOpen}
        onClose={() => setIsLogSessionOpen(false)}
        title={`Log Study Session: ${topic.name}`}
      >
        <form onSubmit={handleLogSession} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Duration (minutes)
            </label>
            <Input
              type="number"
              min="5"
              max="720"
              step="5"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              What did you study / accomplish?
            </label>
            <Textarea
              placeholder="e.g. Read RFC 7519, wrote OncePerRequestFilter, tested invalid token response."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsLogSessionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Session</Button>
          </div>
        </form>
      </Modal>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <ImageViewerModal
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
        />
      )}
    </div>
  );
}
