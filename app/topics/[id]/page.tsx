"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { TiptapEditor } from "@/components/notes/tiptap-editor";
import { TopicBookSidebar } from "@/components/topics/topic-book-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  Star,
  Network,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Edit2,
  Eye,
  CornerDownRight,
  FolderTree,
} from "lucide-react";
import { getStatusColor, cn } from "@/lib/utils";
import { ImageViewerModal } from "@/components/files/image-viewer-modal";
import { PdfViewerModal } from "@/components/files/pdf-viewer-modal";
import { Topic } from "@/types/database";

interface FlatTopicItem {
  topic: Topic;
  level: number;
  hierarchicalIndex: string;
  parentChain: Array<{ id: string; name: string }>;
  isSubtopic: boolean;
  rootChapterName: string;
}

export default function ContinuousTopicBookPage() {
  const params = useParams();
  const router = useRouter();
  const initialTopicId = params.id as string;

  const {
    getTopicById,
    getTechnologyById,
    getTopicTree,
    updateTopic,
    toggleFavoriteTopic,
    notes,
    files,
    mindMaps,
    addNote,
    updateNote,
    addLearningSession,
  } = useLearningStore();

  const currentTopic = getTopicById(initialTopicId);
  const tech = currentTopic ? getTechnologyById(currentTopic.technology_id) : undefined;
  const topicsTree = useMemo(() => (tech ? getTopicTree(tech.id) : []), [tech, getTopicTree]);

  // Flatten the topic tree with full ancestry and hierarchy information
  const flatOrderedTopics = useMemo(() => {
    const list: FlatTopicItem[] = [];

    const processTree = (
      nodes: Topic[],
      level: number,
      parentPrefix: string,
      parentChain: Array<{ id: string; name: string }>,
      rootName: string
    ) => {
      nodes.forEach((t, idx) => {
        const itemPrefix =
          level === 0 ? `${idx + 1}.0` : `${parentPrefix}.${idx + 1}`;
        const currentRootName = level === 0 ? t.name : rootName;

        list.push({
          topic: t,
          level,
          hierarchicalIndex: itemPrefix,
          parentChain,
          isSubtopic: level > 0,
          rootChapterName: currentRootName,
        });

        if (t.subtopics && t.subtopics.length > 0) {
          processTree(
            t.subtopics,
            level + 1,
            itemPrefix,
            [...parentChain, { id: t.id, name: t.name }],
            currentRootName
          );
        }
      });
    };

    processTree(topicsTree, 0, "", [], "");
    return list;
  }, [topicsTree]);

  // State to track which topic is actively highlighted in viewport
  const [activeTopicId, setActiveTopicId] = useState<string>(initialTopicId);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // Dedicated reference to the scrollable right container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Study log modal
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [sessionTopic, setSessionTopic] = useState<Topic | null>(currentTopic || null);
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [sessionNotes, setSessionNotes] = useState("");

  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

  // Initial scroll into the requested topic section inside the scrollable container
  useEffect(() => {
    if (initialTopicId && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(`topic-section-${initialTopicId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [initialTopicId]);

  // ScrollSpy with IntersectionObserver attached to the right scrollable container
  useEffect(() => {
    if (flatOrderedTopics.length === 0 || !scrollContainerRef.current) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        visibleEntries.sort((a, b) => {
          return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
        });
        const topTopicId = visibleEntries[0].target.getAttribute("data-topic-id");
        if (topTopicId && topTopicId !== activeTopicId) {
          setActiveTopicId(topTopicId);
          window.history.replaceState(null, "", `/topics/${topTopicId}`);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: scrollContainerRef.current,
      rootMargin: "-40px 0px -50% 0px",
      threshold: [0, 0.1, 0.3, 0.5, 0.8],
    });

    flatOrderedTopics.forEach((item) => {
      const el = document.getElementById(`topic-section-${item.topic.id}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [flatOrderedTopics, activeTopicId]);

  // Handle smooth scroll when clicking on Table of Contents item
  const handleScrollToTopic = (targetTopicId: string) => {
    const el = document.getElementById(`topic-section-${targetTopicId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTopicId(targetTopicId);
      window.history.replaceState(null, "", `/topics/${targetTopicId}`);
    }
  };

  // Previous & Next navigation relative to active visible topic
  const currentVisibleIndex = flatOrderedTopics.findIndex((t) => t.topic.id === activeTopicId);
  const activeVisibleItem = currentVisibleIndex >= 0 ? flatOrderedTopics[currentVisibleIndex] : null;
  const activeVisibleTopic = activeVisibleItem ? activeVisibleItem.topic : currentTopic;
  const prevItem = currentVisibleIndex > 0 ? flatOrderedTopics[currentVisibleIndex - 1] : null;
  const nextItem =
    currentVisibleIndex >= 0 && currentVisibleIndex < flatOrderedTopics.length - 1
      ? flatOrderedTopics[currentVisibleIndex + 1]
      : null;

  if (!currentTopic && flatOrderedTopics.length === 0) {
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

  const handleSaveNoteForTopic = (topicItem: Topic, html: string) => {
    const existing = notes.find((n) => n.topic_id === topicItem.id);
    if (existing) {
      updateNote(existing.id, { content_html: html });
    } else {
      addNote({
        title: `${topicItem.name} Notes`,
        technology_id: topicItem.technology_id,
        topic_id: topicItem.id,
        content_html: html,
        tags: [topicItem.slug, tech?.slug || "tech"].filter(Boolean),
      });
    }
  };

  const handleLogSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic) return;
    addLearningSession({
      technology_id: sessionTopic.technology_id,
      topic_id: sessionTopic.id,
      title: `Studied ${sessionTopic.name}`,
      duration_minutes: Number(sessionMinutes),
      description: sessionNotes,
      date: new Date().toISOString().split("T")[0],
    });
    setIsLogSessionOpen(false);
    setSessionNotes("");
  };

  return (
    <div data-page-container="full-height" className="h-full flex flex-col overflow-hidden min-h-0">
      {/* Persistent Top Navigation Bar (Fixed in place) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/80 shrink-0 bg-background z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/technologies"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Technologies
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          {tech && (
            <>
              <Link
                href={`/technologies/${tech.id}`}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {tech.name}
              </Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            </>
          )}

          {/* Ancestry Breadcrumb if Active Item is a Subtopic */}
          {activeVisibleItem?.parentChain && activeVisibleItem.parentChain.length > 0 && (
            <>
              {activeVisibleItem.parentChain.map((p) => (
                <React.Fragment key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleScrollToTopic(p.id)}
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {p.name}
                  </button>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                </React.Fragment>
              ))}
            </>
          )}

          <span className="text-xs font-bold text-foreground">
            {activeVisibleTopic?.name || "Study Guide"}
          </span>
        </div>

        {/* Previous / Next chapter jump buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground hidden sm:inline mr-2 font-mono">
            Topic {currentVisibleIndex + 1} of {flatOrderedTopics.length}
          </span>

          {prevItem ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleScrollToTopic(prevItem.topic.id)}
              className="gap-1 text-xs h-8"
              title={`Previous: ${prevItem.topic.name}`}
            >
              <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline truncate max-w-[120px]">{prevItem.topic.name}</span>
              <span className="sm:hidden">Prev</span>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled className="gap-1 text-xs h-8 opacity-40">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
          )}

          {nextItem ? (
            <Button
              size="sm"
              onClick={() => handleScrollToTopic(nextItem.topic.id)}
              className="gap-1 text-xs h-8 shadow-xs"
              title={`Next: ${nextItem.topic.name}`}
            >
              <span className="hidden sm:inline truncate max-w-[120px]">{nextItem.topic.name}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled className="gap-1 text-xs h-8 opacity-40">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Book Layout: Left Fixed TOC + Right Independent Scrolling Feed */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 pt-3 items-stretch overflow-hidden">
        {/* Left Col: Fixed Table of Contents with Independent Internal Scroll */}
        {tech && (
          <div className="hidden lg:flex lg:w-72 lg:shrink-0 h-full flex-col overflow-hidden">
            <TopicBookSidebar
              technology={tech}
              topicsTree={topicsTree}
              activeTopicId={activeTopicId}
              onTopicClick={handleScrollToTopic}
              className="h-full flex flex-col overflow-hidden"
            />
          </div>
        )}

        {/* Right Col: ONLY THIS SCROLLS VERTICALLY */}
        <div
          ref={scrollContainerRef}
          id="topics-scroll-container"
          className="flex-1 min-w-0 h-full overflow-y-auto pr-3 custom-scrollbar space-y-10 pb-16"
        >
          {flatOrderedTopics.map((item) => {
            const topicItem = item.topic;
            const isCurrentActive = topicItem.id === activeTopicId;
            const noteForTopic = notes.find((n) => n.topic_id === topicItem.id);
            const isEditingThis = editingTopicId === topicItem.id;
            const itemMindMaps = mindMaps.filter((m) => m.topic_id === topicItem.id);
            const itemFiles = files.filter((f) => f.topic_id === topicItem.id);
            const isCompleted = topicItem.status === "Completed" || topicItem.progress === 100;

            return (
              <section
                key={topicItem.id}
                id={`topic-section-${topicItem.id}`}
                data-topic-id={topicItem.id}
                className={cn(
                  "scroll-mt-6 space-y-4 pt-2 border-b border-border/40 pb-10 last:border-b-0 transition-all",
                  item.isSubtopic ? "sm:pl-4 sm:border-l-2 sm:border-l-primary/20 ml-1" : ""
                )}
              >
                {/* Clear Hierarchy / Parent Reference Pill if Subtopic */}
                {item.isSubtopic && item.parentChain.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-lg border border-border/60 w-fit flex-wrap">
                    <CornerDownRight className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-primary">Part of:</span>
                    {item.parentChain.map((p, pIdx) => (
                      <React.Fragment key={p.id}>
                        {pIdx > 0 && <ChevronRight className="h-3 w-3 opacity-60 text-muted-foreground" />}
                        <button
                          type="button"
                          onClick={() => handleScrollToTopic(p.id)}
                          className="hover:text-primary hover:underline font-semibold text-foreground transition-colors cursor-pointer"
                          title={`Jump to parent: ${p.name}`}
                        >
                          {p.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Topic Header Banner */}
                <div
                  className={cn(
                    "px-4 py-3 rounded-xl bg-card border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs",
                    isCurrentActive
                      ? "border-primary/60 ring-1 ring-primary/20 bg-card"
                      : "border-border/80",
                    item.isSubtopic ? "border-l-4 border-l-primary/60" : ""
                  )}
                  style={!item.isSubtopic ? { borderLeft: `4px solid ${tech?.color || "#6366f1"}` } : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-xs",
                        item.isSubtopic ? "bg-indigo-600/90 dark:bg-indigo-500/90" : ""
                      )}
                      style={!item.isSubtopic ? { backgroundColor: tech?.color || "#6366f1" } : undefined}
                    >
                      {item.isSubtopic ? `Subtopic ${item.hierarchicalIndex}` : `Chapter ${item.hierarchicalIndex}`}
                    </span>

                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                      {topicItem.name}
                    </h2>

                    {/* Completed Checkbox Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isCompleted) {
                          updateTopic(topicItem.id, {
                            status: "Not Started",
                            progress: 0,
                            completed_at: null,
                          });
                        } else {
                          updateTopic(topicItem.id, {
                            status: "Completed",
                            progress: 100,
                            completed_at: new Date().toISOString(),
                          });
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
                        isCompleted
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-secondary/30"
                      }`}
                      title={isCompleted ? "Click to mark as Incomplete" : "Click to mark as Completed"}
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded flex items-center justify-center border transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                            : "border-muted-foreground/50 bg-background"
                        }`}
                      >
                        {isCompleted && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px]">
                        {isCompleted ? "Completed ✓" : "Mark Done"}
                      </span>
                    </button>
                  </div>

                  {/* Actions: Edit Notes, Favorite & Log Time */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {isEditingThis ? (
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => setEditingTopicId(null)}
                        className="gap-1.5 text-xs h-8 font-semibold text-emerald-600 dark:text-emerald-400"
                      >
                        <Eye className="h-3.5 w-3.5" /> Done (Reading View)
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTopicId(topicItem.id)}
                        className="gap-1.5 text-xs h-8 font-semibold border-primary/40 hover:bg-primary/10 text-primary shadow-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit Notes
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFavoriteTopic(topicItem.id)}
                      className="gap-1 text-xs h-8"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          topicItem.is_favorite ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                      <span className="hidden sm:inline">{topicItem.is_favorite ? "Favorited" : "Favorite"}</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSessionTopic(topicItem);
                        setIsLogSessionOpen(true);
                      }}
                      className="gap-1 text-xs h-8 shadow-xs"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Log Time</span>
                    </Button>
                  </div>
                </div>

                {/* Notes Container: Reading View vs Tiptap Editor */}
                <div className="space-y-4">
                  {isEditingThis ? (
                    <Card className="p-4 bg-card border border-border/80 shadow-xs">
                      <TiptapEditor
                        initialContent={
                          noteForTopic?.content_html ||
                          `<h2>${topicItem.name} Key Points</h2><p>Document your code snippets, command flags, and conceptual notes here...</p>`
                        }
                        onSave={(html) => handleSaveNoteForTopic(topicItem, html)}
                        placeholder="Write detailed notes, code blocks, or checklists..."
                      />
                    </Card>
                  ) : (
                    <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-xs min-h-[140px]">
                      {noteForTopic?.content_html ? (
                        <div
                          className="tiptap-content prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: noteForTopic.content_html }}
                        />
                      ) : (
                        <div className="py-8 text-center space-y-2">
                          <p className="text-xs text-muted-foreground">No notes written for this topic yet.</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTopicId(topicItem.id)}
                            className="gap-1.5 text-xs border-dashed"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Start Writing Notes
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Associated Mind Map & Files Pills if any */}
                {(itemMindMaps.length > 0 || itemFiles.length > 0) && (
                  <div className="flex items-center gap-3 flex-wrap pt-1 text-xs text-muted-foreground">
                    {itemMindMaps.map((map) => (
                      <Link
                        key={map.id}
                        href={`/mind-maps/${map.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-medium border border-border/60"
                      >
                        <Network className="h-3.5 w-3.5 text-primary" /> Visual Mind Map: {map.title}
                      </Link>
                    ))}
                    {itemFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => {
                          const url = file.public_url || file.storage_path;
                          if (file.file_type.includes("pdf") || file.filename.toLowerCase().endsWith(".pdf")) {
                            setSelectedPdf({ url, title: file.filename });
                          } else {
                            setSelectedImage({ url, title: file.filename });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-medium border border-border/60 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" /> {file.filename}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Log Study Session Modal */}
      <Modal
        isOpen={isLogSessionOpen}
        onClose={() => setIsLogSessionOpen(false)}
        title={sessionTopic ? `Log Study Session: ${sessionTopic.name}` : "Log Study Session"}
        maxWidth="md"
      >
        <form onSubmit={handleLogSessionSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Study Duration (Minutes)
            </label>
            <Input
              type="number"
              min="5"
              max="600"
              step="5"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              What did you learn / practice? (Optional)
            </label>
            <Textarea
              placeholder="e.g. Practiced CLI commands, reviewed container lifecycle, configured volume mounts..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogSessionOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Clock className="h-4 w-4" /> Save Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Fullscreen PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={Boolean(selectedPdf)}
          onClose={() => setSelectedPdf(null)}
          pdfUrl={selectedPdf.url}
          title={selectedPdf.title}
        />
      )}

      {/* Fullscreen Image Viewer Modal */}
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
