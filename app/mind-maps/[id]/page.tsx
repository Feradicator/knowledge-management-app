"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { MindMapCanvas } from "@/components/mind-maps/mind-map-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Star,
  Trash2,
  Network,
  Cpu,
  ListTree,
  ExternalLink,
} from "lucide-react";

export default function MindMapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getMindMapById,
    technologies,
    topics,
    updateMindMap,
    deleteMindMap,
    toggleFavoriteMindMap,
    isOwner,
  } = useLearningStore();

  const map = getMindMapById(id);

  if (!map) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-foreground">Mind Map Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested mind map does not exist or has been removed.
        </p>
        <Link href="/mind-maps" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Mind Maps
          </Button>
        </Link>
      </div>
    );
  }

  const tech = technologies.find((t) => t.id === map.technology_id);
  const topic = topics.find((t) => t.id === map.topic_id);

  const handleTitleChange = (newTitle: string) => {
    updateMindMap(map.id, { title: newTitle });
  };

  const handleDelete = () => {
    if (confirm(`Delete mind map '${map.title}'?`)) {
      deleteMindMap(map.id);
      router.push("/mind-maps");
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/mind-maps"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={map.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-lg sm:text-xl font-bold bg-transparent text-foreground outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors"
              />
              {tech && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: tech.color || "#6366f1" }}
                >
                  {tech.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {map.nodes_json.length} nodes · {map.edges_json.length} connections
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {tech && (
            <Link href={`/technologies/${tech.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Cpu className="h-3.5 w-3.5" /> View Tech Roadmap
              </Button>
            </Link>
          )}
          {topic && (
            <Link href={`/topics/${topic.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <ListTree className="h-3.5 w-3.5" /> View Topic
              </Button>
            </Link>
          )}
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFavoriteMindMap(map.id)}
                className="gap-1.5"
              >
                <Star
                  className={`h-4 w-4 ${
                    map.is_favorite ? "fill-amber-400 text-amber-400" : ""
                  }`}
                />
                <span className="hidden sm:inline">{map.is_favorite ? "Favorited" : "Favorite"}</span>
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={handleDelete}
                title="Delete mind map"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* React Flow Interactive Canvas */}
      <MindMapCanvas mindMap={map} />
    </div>
  );
}
