"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  FileText,
  Search,
  Plus,
  Star,
  Trash2,
  Edit3,
  Tag,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

export default function NotesPage() {
  const router = useRouter();
  const { notes, technologies, topics, addNote, deleteNote, toggleFavoriteNote } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // New Note Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTechId, setNewTechId] = useState("");
  const [newTags, setNewTags] = useState("");

  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content_html.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTech = selectedTech === "All" || n.technology_id === selectedTech;
      const matchesFav = !onlyFavorites || n.is_favorite;
      return matchesSearch && matchesTech && matchesFav;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const note = addNote({
      title: newTitle,
      technology_id: newTechId || null,
      tags,
      content_html: `<h2>${newTitle}</h2><p>Document technical concepts, code snippets, and architecture notes...</p>`,
    });

    setIsAddOpen(false);
    router.push(`/notes/${note.id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" /> Technical Notes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Capture deep engineering notes, syntax patterns, code snippets, and study summaries.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shadow-sm shadow-primary/25">
          <Plus className="h-4 w-4" /> Create Note
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <Input
              placeholder="Search note titles, content, or #tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Tech Filter */}
          <div>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-card px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Technologies</option>
              {technologies.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By & Favorites Filter */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-9 rounded-lg border border-input bg-card px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>

            <Button
              variant={onlyFavorites ? "default" : "outline"}
              size="icon"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              title="Show only favorites"
              className="shrink-0 h-9 w-9"
            >
              <Star className={`h-4 w-4 ${onlyFavorites ? "fill-amber-400 text-amber-400" : ""}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-3">
            <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">No Notes Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {searchQuery || selectedTech !== "All"
              ? "No notes match your current filters."
              : "Capture your first technical breakdown or learning reflection!"}
          </p>
          <Button onClick={() => setIsAddOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Create Note
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const tech = technologies.find((t) => t.id === note.technology_id);
            const topic = topics.find((t) => t.id === note.topic_id);

            // Strip HTML for quick preview snippet
            const textPreview = note.content_html
              ? note.content_html.replace(/<[^>]*>?/gm, "").substring(0, 140)
              : "No content preview available.";

            return (
              <Card
                key={note.id}
                hoverEffect
                className="flex flex-col justify-between p-5 relative group border-t-4"
                style={{ borderTopColor: tech?.color || "#6366f1" }}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tech && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: tech.color || "#6366f1" }}
                        >
                          {tech.name}
                        </span>
                      )}
                      {topic && (
                        <Badge variant="secondary" className="text-[10px]">
                          {topic.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavoriteNote(note.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-amber-500 transition-colors"
                        title={note.is_favorite ? "Remove from favorites" : "Favorite"}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            note.is_favorite ? "fill-amber-400 text-amber-400" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete note '${note.title}'?`)) {
                            deleteNote(note.id);
                          }
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/notes/${note.id}`}
                    className="font-bold text-base text-foreground hover:text-primary transition-colors block line-clamp-2 mt-1 mb-2"
                  >
                    {note.title}
                  </Link>

                  {/* Snippet Preview */}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                    {textPreview}...
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[10px] font-medium"
                        >
                          <Tag className="h-2.5 w-2.5" /> #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated {formatRelativeDate(note.updated_at)}</span>
                  <Link
                    href={`/notes/${note.id}`}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Edit & View <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Note Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Note">
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Note Title</label>
            <Input
              placeholder="e.g. Distributed Tracing in Spring Boot 3"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Associated Technology (Optional)
            </label>
            <select
              value={newTechId}
              onChange={(e) => setNewTechId(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="" className="bg-card">Standalone Note</option>
              {technologies.map((t) => (
                <option key={t.id} value={t.id} className="bg-card">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Tags (comma-separated)
            </label>
            <Input
              placeholder="e.g. spring-boot, tracing, observability"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create & Open Note</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
