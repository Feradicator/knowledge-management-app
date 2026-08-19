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
import { cn, getStatusColor } from "@/lib/utils";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      {/* Hierarchical Chapter List */}
      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
        {topicsTree.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No topics in this roadmap yet.
          </p>
        ) : (
          topicsTree.map((rootTopic, rootIdx) => {
            const isRootActive = rootTopic.id === activeTopicId;
            const hasSubtopics = Boolean(
              rootTopic.subtopics && rootTopic.subtopics.length > 0
            );
            const isCompleted = rootTopic.status === "Completed" || rootTopic.progress === 100;

            return (
              <div key={rootTopic.id} className="space-y-0.5">
                {/* Root Topic Row */}
                <Link
                  href={`/topics/${rootTopic.id}`}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group",
                    isRootActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-foreground/90 hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0",
                        isRootActive
                          ? "bg-white/20 text-white"
                          : "bg-secondary text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {rootIdx + 1}.0
                    </span>
                    <span className="truncate">{rootTopic.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2
                        className={cn(
                          "h-3.5 w-3.5",
                          isRootActive ? "text-white" : "text-emerald-500"
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-[10px] font-mono",
                          isRootActive ? "text-white/80" : "text-muted-foreground"
                        )}
                      >
                        {rootTopic.progress}%
                      </span>
                    )}
                  </div>
                </Link>

                {/* Subtopics List */}
                {hasSubtopics && (
                  <div className="pl-4 space-y-0.5 border-l-2 border-border/40 ml-3.5 my-0.5">
                    {rootTopic.subtopics!.map((subTopic, subIdx) => {
                      const isSubActive = subTopic.id === activeTopicId;
                      const isSubCompleted =
                        subTopic.status === "Completed" || subTopic.progress === 100;

                      return (
                        <Link
                          key={subTopic.id}
                          href={`/topics/${subTopic.id}`}
                          className={cn(
                            "flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all group",
                            isSubActive
                              ? "bg-primary/20 text-primary border border-primary/40 font-bold"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[9px] font-mono opacity-60 shrink-0">
                              {rootIdx + 1}.{subIdx + 1}
                            </span>
                            <span className="truncate">{subTopic.name}</span>
                          </div>

                          <div className="shrink-0">
                            {isSubCompleted ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <span className="text-[9px] opacity-75 font-mono">
                                {subTopic.progress}%
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
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
