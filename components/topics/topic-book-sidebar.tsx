"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Topic, Technology } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ListTree,
  FolderTree,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicBookSidebarProps {
  technology: Technology;
  topicsTree: Topic[];
  activeTopicId: string;
  className?: string;
}

export function TopicBookSidebar({
  technology,
  topicsTree,
  activeTopicId,
  className,
}: TopicBookSidebarProps) {
  // Recursive renderer for any depth of topics and subtopics
  const renderTopicNode = (
    topicNode: Topic,
    level: number,
    prefix: string
  ): React.ReactNode => {
    const isActive = topicNode.id === activeTopicId;
    const hasSubtopics = Boolean(
      topicNode.subtopics && topicNode.subtopics.length > 0
    );
    const isCompleted =
      topicNode.status === "Completed" || topicNode.progress === 100;

    return (
      <div key={topicNode.id} className="space-y-0.5">
        <Link
          href={`/topics/${topicNode.id}`}
          className={cn(
            "flex items-center justify-between gap-2 rounded-xl transition-all group select-none",
            level === 0
              ? "px-2.5 py-2 text-xs font-semibold"
              : level === 1
              ? "px-2 py-1.5 text-[11px] font-medium"
              : "px-2 py-1 text-[11px] font-normal",
            isActive
              ? level === 0
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "bg-primary/20 text-primary border border-primary/40 font-bold"
              : "text-foreground/90 hover:bg-secondary/80 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "font-mono shrink-0",
                level === 0
                  ? "text-[10px] px-1.5 py-0.5 rounded"
                  : "text-[9px] opacity-70",
                isActive && level === 0
                  ? "bg-white/20 text-white"
                  : level === 0
                  ? "bg-secondary text-muted-foreground group-hover:text-foreground"
                  : ""
              )}
            >
              {prefix}
            </span>
            <span className="truncate">{topicNode.name}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isCompleted ? (
              <CheckCircle2
                className={cn(
                  "h-3.5 w-3.5",
                  isActive && level === 0 ? "text-white" : "text-emerald-500"
                )}
              />
            ) : (
              <div
                className={cn(
                  level === 0 ? "h-2 w-2 rounded-full" : "h-1.5 w-1.5 rounded-full",
                  isActive && level === 0 ? "bg-white/50" : "bg-muted-foreground/30"
                )}
              />
            )}
          </div>
        </Link>

        {/* Recursive Child Subtopics of Any Depth */}
        {hasSubtopics && (
          <div className="pl-3 space-y-0.5 border-l-2 border-border/40 ml-3 my-0.5">
            {topicNode.subtopics!.map((subTopic, subIdx) =>
              renderTopicNode(
                subTopic,
                level + 1,
                level === 0 ? `${parseInt(prefix)}.0.${subIdx + 1}` : `${prefix}.${subIdx + 1}`
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border/80 p-4 shadow-sm flex flex-col transition-all",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/technologies/${technology.id}`}
            className="flex items-center gap-2 group min-w-0"
          >
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
              style={{ backgroundColor: technology.color || "#6366f1" }}
            >
              {technology.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                {technology.name}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Interactive Study Guide
              </p>
            </div>
          </Link>

          <Link href={`/technologies/${technology.id}/combined-notes`}>
            <Button size="icon-sm" variant="subtle" title="Read Combined Notes Book">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Chapters Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ListTree className="h-3.5 w-3.5 text-primary" /> Table of Contents
        </span>
      </div>

      {/* Hierarchical Chapter List with Full Depth Support */}
      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
        {topicsTree.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No topics in this roadmap yet.
          </p>
        ) : (
          topicsTree.map((rootTopic, rootIdx) =>
            renderTopicNode(rootTopic, 0, `${rootIdx + 1}.0`)
          )
        )}
      </div>

      {/* Bottom Quick Links */}
      <div className="pt-3 mt-3 border-t border-border/60 space-y-1">
        <Link href={`/technologies/${technology.id}/combined-notes`}>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5 justify-start text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" /> Full Combined Notes
          </Button>
        </Link>
      </div>
    </div>
  );
}
