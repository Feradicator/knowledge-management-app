"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { TiptapEditor } from "@/components/notes/tiptap-editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Star,
  Trash2,
  Tag,
  Plus,
  X,
  FileText,
  Clock,
  Sparkles,
  Edit2,
  Eye,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getNoteById, technologies, topics, updateNote, deleteNote, toggleFavoriteNote } =
    useLearningStore();

  const note = getNoteById(id);

  const [tagInput, setTagInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  if (!note) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-foreground">Note Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested note does not exist or has been removed.
        </p>
        <Link href="/notes" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Notes
          </Button>
        </Link>
      </div>
    );
  }

  const tech = technologies.find((t) => t.id === note.technology_id);
  const topic = topics.find((t) => t.id === note.topic_id);

  const handleTitleChange = (newTitle: string) => {
    updateNote(note.id, { title: newTitle });
  };

  const handleSaveContent = (html: string) => {
    updateNote(note.id, { content_html: html });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!note.tags.includes(trimmed)) {
        updateNote(note.id, { tags: [...note.tags, trimmed] });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateNote(note.id, { tags: note.tags.filter((t) => t !== tagToRemove) });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete '${note.title}'?`)) {
      deleteNote(note.id);
      router.push("/notes");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Button & Top Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Notes Hub
        </Link>

        <div className="flex items-center gap-2">
          {/* Edit / Reading Mode Toggle */}
          {isEditing ? (
            <Button
              size="sm"
              variant="subtle"
              onClick={() => setIsEditing(false)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Eye className="h-3.5 w-3.5 text-emerald-500" /> Done (Reading View)
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-1.5 text-xs font-semibold border-primary/40 hover:bg-primary/10 text-primary shadow-xs"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Note
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFavoriteNote(note.id)}
            className="gap-1.5"
          >
            <Star
              className={`h-4 w-4 ${
                note.is_favorite ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
            <span className="hidden sm:inline">{note.is_favorite ? "Favorited" : "Favorite"}</span>
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={handleDelete}
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        /* EDITING MODE */
        <div className="space-y-6">
          {/* Note Metadata Details */}
          <Card className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Note Title
              </label>
              <input
                type="text"
                value={note.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note Title..."
                className="w-full text-xl sm:text-2xl font-extrabold tracking-tight bg-transparent text-foreground outline-none border-b border-border/80 focus:border-primary transition-colors pb-1"
              />
            </div>

            {/* Association Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Associated Technology
                </label>
                <select
                  value={note.technology_id || ""}
                  onChange={(e) => updateNote(note.id, { technology_id: e.target.value || null })}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-xs sm:text-sm"
                >
                  <option value="" className="bg-card">None (Standalone Note)</option>
                  {technologies.map((t) => (
                    <option key={t.id} value={t.id} className="bg-card">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Associated Topic (Optional)
                </label>
                <select
                  value={note.topic_id || ""}
                  onChange={(e) => updateNote(note.id, { topic_id: e.target.value || null })}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-xs sm:text-sm"
                >
                  <option value="" className="bg-card">None (General Note)</option>
                  {topics
                    .filter((t) => !note.technology_id || t.technology_id === note.technology_id)
                    .map((t) => (
                      <option key={t.id} value={t.id} className="bg-card">
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-2 border-t border-border/50">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Tags (Press Enter to add)
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-foreground text-xs font-medium border border-border"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="h-7 w-24 rounded-full bg-transparent px-2 text-xs text-foreground placeholder:text-muted-foreground outline-none border border-dashed border-border focus:border-primary"
                />
              </div>
            </div>
          </Card>

          {/* Rich Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Last updated {formatRelativeDate(note.updated_at)}
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Autosaved to database
              </span>
            </div>

            <TiptapEditor
              initialContent={note.content_html}
              onSave={handleSaveContent}
              placeholder="Start typing your technical breakdown..."
            />
          </div>
        </div>
      ) : (
        /* READABLE FORMAT (DEFAULT) */
        <div className="space-y-6">
          {/* Note Header Banner */}
          <div
            className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3"
            style={{ borderLeft: `5px solid ${tech?.color || "#6366f1"}` }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {tech && (
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: tech.color || "#6366f1" }}
                >
                  {tech.name}
                </span>
              )}
              {topic && (
                <Badge variant="outline" className="text-xs">
                  {topic.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Updated {formatRelativeDate(note.updated_at)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {note.title}
            </h1>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Readable Document Content */}
          <div className="p-8 rounded-2xl bg-card border border-border/80 shadow-xs min-h-[300px]">
            {note.content_html ? (
              <div
                className="tiptap-content prose dark:prose-invert max-w-none text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: note.content_html }}
              />
            ) : (
              <div className="py-16 text-center space-y-3">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold text-foreground">This note is currently empty.</p>
                <Button size="sm" onClick={() => setIsEditing(true)} className="gap-1.5 text-xs">
                  <Edit2 className="h-3.5 w-3.5" /> Start Writing
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
