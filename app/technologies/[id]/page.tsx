"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { HierarchicalTopicTree } from "@/components/technologies/hierarchical-topic-tree";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconRenderer } from "@/components/ui/icon-renderer";
import {
  Cpu,
  ArrowLeft,
  Star,
  Network,
  FileText,
  FolderArchive,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Hourglass,
  ListTree,
  ExternalLink,
} from "lucide-react";

export default function TechnologyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getTechnologyById,
    topics,
    notes,
    files,
    mindMaps,
    toggleFavoriteTechnology,
    deleteTechnology,
    createMindMapFromTechnology,
  } = useLearningStore();

  const tech = getTechnologyById(id);

  if (!tech) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-foreground">Technology Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested technology roadmap does not exist or has been removed.
        </p>
        <Link href="/technologies" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Technologies
          </Button>
        </Link>
      </div>
    );
  }

  const techTopics = topics.filter((t) => t.technology_id === tech.id);
  const completedTopics = techTopics.filter((t) => t.status === "Completed" || t.progress === 100).length;
  const inProgressTopics = techTopics.filter((t) => t.status === "Learning" && t.progress < 100).length;
  const techNotes = notes.filter((n) => n.technology_id === tech.id);
  const techFiles = files.filter((f) => f.technology_id === tech.id);
  const techMindMaps = mindMaps.filter((m) => m.technology_id === tech.id);

  const handleGenerateMindMap = () => {
    const newMap = createMindMapFromTechnology(tech.id);
    router.push(`/mind-maps/${newMap.id}`);
  };

  const handleDelete = () => {
    if (confirm(`Delete technology '${tech.name}' and all associated topics?`)) {
      deleteTechnology(tech.id);
      router.push("/technologies");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <div>
        <Link
          href="/technologies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Technologies
        </Link>
      </div>

      {/* Main Technology Header Banner */}
      <div
        className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-sm relative overflow-hidden"
        style={{ borderTop: `5px solid ${tech.color || "#6366f1"}` }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-white font-bold shadow-lg shrink-0 text-xl"
              style={{ backgroundColor: tech.color || "#6366f1" }}
            >
              <IconRenderer name={tech.icon} className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {tech.name}
                </h1>
                <Badge variant="secondary">{tech.category}</Badge>
                {tech.is_favorite && (
                  <Badge variant="warning" className="gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Favorite
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {tech.description || "Master core fundamentals and advanced engineering concepts."}
              </p>
            </div>
          </div>

          {/* Actions & Favorite Button */}
          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavoriteTechnology(tech.id)}
              className="gap-1.5"
            >
              <Star
                className={`h-4 w-4 ${
                  tech.is_favorite ? "fill-amber-400 text-amber-400" : ""
                }`}
              />
              <span>{tech.is_favorite ? "Favorited" : "Favorite"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateMindMap}
              className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
            >
              <Network className="h-4 w-4" />
              <span>Create Mind Map</span>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={handleDelete}
              title="Delete technology"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Metrics & Bar */}
        <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground font-medium">Overall Progress</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{tech.progress}%</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground font-medium">Total Topics</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{techTopics.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground font-medium">Completed</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {completedTopics}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground font-medium">In Progress</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {inProgressTopics}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={tech.progress} indicatorColor={tech.color} size="default" />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="roadmap">
        <TabsList className="grid grid-cols-4 max-w-lg mb-4">
          <TabsTrigger value="roadmap" badge={techTopics.length} className="gap-1.5 text-xs">
            <ListTree className="h-3.5 w-3.5" /> Topics
          </TabsTrigger>
          <TabsTrigger value="notes" badge={techNotes.length} className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Notes
          </TabsTrigger>
          <TabsTrigger value="mindmaps" badge={techMindMaps.length} className="gap-1.5 text-xs">
            <Network className="h-3.5 w-3.5" /> Mind Maps
          </TabsTrigger>
          <TabsTrigger value="files" badge={techFiles.length} className="gap-1.5 text-xs">
            <FolderArchive className="h-3.5 w-3.5" /> Files
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Hierarchical Roadmap */}
        <TabsContent value="roadmap">
          <HierarchicalTopicTree technologyId={tech.id} accentColor={tech.color} />
        </TabsContent>

        {/* Tab 2: Notes */}
        <TabsContent value="notes">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Notes related to {tech.name}</h3>
              <Link href={`/notes?tech=${tech.id}`}>
                <Button size="sm" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> New Note
                </Button>
              </Link>
            </div>

            {techNotes.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-card border border-border/70 text-xs text-muted-foreground">
                No notes created for {tech.name} yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {techNotes.map((note) => (
                  <Card key={note.id} hoverEffect className="p-4">
                    <Link href={`/notes/${note.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                      {note.title}
                    </Link>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Mind Maps */}
        <TabsContent value="mindmaps">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Mind Maps for {tech.name}</h3>
              <Button size="sm" onClick={handleGenerateMindMap} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Create Mind Map
              </Button>
            </div>

            {techMindMaps.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-card border border-border/70 text-xs text-muted-foreground">
                No mind maps created yet for this technology. Click &quot;Create Mind Map&quot; to auto-generate one!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {techMindMaps.map((mm) => (
                  <Card key={mm.id} hoverEffect className="p-4 flex flex-col justify-between">
                    <div>
                      <Link href={`/mind-maps/${mm.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                        {mm.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {mm.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                      <span>{mm.nodes_json.length} Nodes</span>
                      <Link href={`/mind-maps/${mm.id}`} className="text-primary font-medium hover:underline flex items-center gap-1">
                        Open Canvas <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Files */}
        <TabsContent value="files">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Attached Documents & Media</h3>
              <Link href="/files">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <FolderArchive className="h-3.5 w-3.5" /> File Manager
                </Button>
              </Link>
            </div>

            {techFiles.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-card border border-border/70 text-xs text-muted-foreground">
                No files or handwritten notes attached to {tech.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {techFiles.map((file) => (
                  <Card key={file.id} hoverEffect className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                        <FolderArchive className="h-4 w-4 text-primary" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-xs text-foreground truncate">{file.filename}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {file.is_handwritten ? "Handwritten Note" : file.file_type}
                        </p>
                      </div>
                    </div>
                    <a href={file.public_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-primary hover:underline">
                      View
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
