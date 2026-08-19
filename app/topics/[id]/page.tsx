"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { ChecklistManager } from "@/components/topics/checklist-manager";
import { TiptapEditor } from "@/components/notes/tiptap-editor";
import { TopicBookSidebar } from "@/components/topics/topic-book-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
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
  ChevronLeft,
  ListTree,
  Sparkles,
} from "lucide-react";
import { getStatusColor, getPriorityColor, formatDateString, formatRelativeDate } from "@/lib/utils";
import { ImageViewerModal } from "@/components/files/image-viewer-modal";
import { PdfViewerModal } from "@/components/files/pdf-viewer-modal";
import { Topic } from "@/types/database";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getTopicById,
    getTechnologyById,
    getTopicTree,
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
  const topicsTree = useMemo(() => (tech ? getTopicTree(tech.id) : []), [tech, getTopicTree]);

  // Flatten the topic tree sequentially to calculate Book Previous / Next pointers
  const flatOrderedTopics = useMemo(() => {
    const flatten = (tree: Topic[]): Topic[] => {
      let list: Topic[] = [];
      tree.forEach((t) => {
        list.push(t);
        if (t.subtopics && t.subtopics.length > 0) {
          list = list.concat(flatten(t.subtopics));
        }
      });
      return list;
    };
    return flatten(topicsTree);
  }, [topicsTree]);

  const currentIndex = flatOrderedTopics.findIndex((t) => t.id === id);
  const prevTopic = currentIndex > 0 ? flatOrderedTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < flatOrderedTopics.length - 1 ? flatOrderedTopics[currentIndex + 1] : null;

  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

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
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Book Paging & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <Link href="/technologies" className="hover:text-foreground shrink-0">Technologies</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {tech && (
            <>
              <Link href={`/technologies/${tech.id}`} className="hover:text-foreground font-semibold truncate shrink-0">
                {tech.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="text-foreground font-bold truncate">{topic.name}</span>
        </div>

        {/* Sequential Book Switcher Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-mono text-muted-foreground mr-1 hidden sm:inline">
            Topic {currentIndex + 1} of {flatOrderedTopics.length || 1}
          </span>

          {prevTopic ? (
            <Link href={`/topics/${prevTopic.id}`}>
              <Button size="sm" variant="outline" className="gap-1 text-xs h-8">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden md:inline truncate max-w-[120px]">{prevTopic.name}</span>
                <span className="md:hidden">Prev</span>
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled className="gap-1 text-xs h-8 opacity-40">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
          )}

          {nextTopic ? (
            <Link href={`/topics/${nextTopic.id}`}>
              <Button size="sm" variant="default" className="gap-1 text-xs h-8">
                <span className="hidden md:inline truncate max-w-[120px]">{nextTopic.name}</span>
                <span className="md:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled className="gap-1 text-xs h-8 opacity-40">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 2-Column Main Layout: Left Book Sidebar TOC + Right Topic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Col: Interactive Book Table of Contents */}
        {tech && (
          <div className="hidden lg:block lg:col-span-1 sticky top-20">
            <TopicBookSidebar
              technology={tech}
              topicsTree={topicsTree}
              activeTopicId={topic.id}
            />
          </div>
        )}

        {/* Right Col: Topic Detail Content & Editor */}
        <div className={tech ? "lg:col-span-3 space-y-6" : "lg:col-span-4 space-y-6"}>
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
                  {topic.description || "Master key implementation details, core fundamentals, and technical concepts."}
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
                  <BookOpen className="h-4 w-4 text-primary" /> Mastery Progress:
                </span>
                <span className="font-extrabold text-base text-foreground">{topic.progress}%</span>
              </div>

              <Slider
                value={topic.progress}
                onChange={(val) => updateTopicProgress(topic.id, val)}
                accentColor={tech?.color}
              />
              <p className="text-[11px] text-muted-foreground">
                Drag slider to update mastery progress. Setting to 100% automatically marks topic as Completed!
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

          {/* Checklist & Attachments */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left 2 Cols: Checklist & Tiptap Notes */}
            <div className="xl:col-span-2 space-y-6">
              <ChecklistManager topicId={topic.id} accentColor={tech?.color} />

              {/* Rich Notes Section with Tiptap Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Topic Notes & Deep-Dive Insights
                  </h3>
                  <span className="text-xs text-muted-foreground">Autosaved to database</span>
                </div>

                <Card className="p-4 bg-card border border-border/80 shadow-xs">
                  <TiptapEditor
                    initialContent={topicNote?.content_html || `<h2>${topic.name} Key Points</h2><p>Document your code snippets, command flags, and conceptual notes here...</p>`}
                    onSave={handleSaveNote}
                    placeholder="Write detailed notes, code blocks, or checklists..."
                  />
                </Card>
              </div>
            </div>

            {/* Right 1 Col: Mind Maps & Attachments */}
            <div className="space-y-6">
              {/* Mind Map Generation */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" /> Concept Mind Map
                  </h3>
                  {topicMindMaps.length === 0 && (
                    <Button size="sm" variant="subtle" onClick={handleCreateMindMap} className="gap-1 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Generate
                    </Button>
                  )}
                </div>

                {topicMindMaps.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border/80 rounded-xl space-y-2">
                    <p className="text-xs text-muted-foreground">No mind map generated for this topic yet.</p>
                    <Button size="sm" onClick={handleCreateMindMap} className="gap-1 text-xs">
                      <Sparkles className="h-3.5 w-3.5" /> Create Visual Map
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topicMindMaps.map((map) => (
                      <Link key={map.id} href={`/mind-maps/${map.id}`}>
                        <div className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 transition-colors flex items-center justify-between group">
                          <div>
                            <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                              {map.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{map.nodes_json?.length || 0} nodes</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              {/* Linked Files & Handwritten Scans */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <FolderArchive className="h-4 w-4 text-primary" /> Topic Attachments
                  </h3>
                  <Link href={`/files?tech=${topic.technology_id}`}>
                    <Button size="sm" variant="subtle" className="gap-1 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Upload
                    </Button>
                  </Link>
                </div>

                {topicFiles.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border/80 rounded-xl">
                    <p className="text-xs text-muted-foreground">No files attached to this topic.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topicFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{file.filename}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {file.is_handwritten ? "Handwritten Note" : "Document"}
                          </span>
                        </div>

                        {file.is_handwritten && file.public_url ? (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => setSelectedImage({ url: file.public_url!, title: file.filename })}
                            title="Inspect scan"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        ) : (file.file_type?.includes("pdf") || file.filename?.endsWith(".pdf")) && file.public_url ? (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => setSelectedPdf({ url: file.public_url!, title: file.filename })}
                            title="Read PDF in-app"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-rose-500" />
                          </Button>
                        ) : (
                          <a href={file.public_url} target="_blank" rel="noopener noreferrer">
                            <Button size="icon-sm" variant="outline">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Bottom Book Chapter Navigation Cards */}
          <div className="pt-6 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevTopic ? (
              <Link href={`/topics/${prevTopic.id}`}>
                <Card hoverEffect className="p-4 h-full flex flex-col justify-between group bg-secondary/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <ChevronLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform" />
                    <span>Previous Chapter</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {prevTopic.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {prevTopic.description || "Continue reading previous topic"}
                    </p>
                  </div>
                </Card>
              </Link>
            ) : (
              <div />
            )}

            {nextTopic ? (
              <Link href={`/topics/${nextTopic.id}`}>
                <Card hoverEffect className="p-4 h-full flex flex-col justify-between items-end text-right group bg-secondary/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>Next Chapter</span>
                    <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {nextTopic.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {nextTopic.description || "Continue reading next topic"}
                    </p>
                  </div>
                </Card>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Log Study Session Modal */}
      <Modal isOpen={isLogSessionOpen} onClose={() => setIsLogSessionOpen(false)} title={`Log Study Time: ${topic.name}`}>
        <form onSubmit={handleLogSession} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Study Duration (Minutes)</label>
            <Input
              type="number"
              min="5"
              max="600"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Notes / Key Takeaways (Optional)</label>
            <Textarea
              placeholder="What problems did you solve? What did you build today?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsLogSessionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Log Session</Button>
          </div>
        </form>
      </Modal>

      {/* Zoomable Image Viewer Modal */}
      {selectedImage && (
        <ImageViewerModal
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
        />
      )}

      {/* In-App PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={Boolean(selectedPdf)}
          onClose={() => setSelectedPdf(null)}
          pdfUrl={selectedPdf.url}
          title={selectedPdf.title}
        />
      )}
    </div>
  );
}
