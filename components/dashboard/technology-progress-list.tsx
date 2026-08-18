"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLearningStore } from "@/lib/store/learning-store";
import { Cpu, ArrowRight, Star, Plus } from "lucide-react";
import { IconRenderer } from "@/components/ui/icon-renderer";

interface TechnologyProgressListProps {
  onAddTech?: () => void;
}

export function TechnologyProgressList({ onAddTech }: TechnologyProgressListProps) {
  const { technologies, topics } = useLearningStore();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" /> Learning Progress by Technology
        </CardTitle>
        <Link href="/technologies" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
          All Technologies <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[380px]">
        {technologies.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No technologies tracked yet. Add your first technology to start tracking!
          </div>
        ) : (
          technologies.map((tech) => {
            const techTopics = topics.filter((t) => t.technology_id === tech.id);
            const completedCount = techTopics.filter((t) => t.status === "Completed" || t.progress === 100).length;

            return (
              <div
                key={tech.id}
                className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold shrink-0 shadow-sm text-xs"
                      style={{ backgroundColor: tech.color || "#6366f1" }}
                    >
                      <IconRenderer name={tech.icon} className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <Link
                        href={`/technologies/${tech.id}`}
                        className="font-bold text-foreground text-sm hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                      >
                        {tech.name}
                        {tech.is_favorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                      </Link>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {completedCount} of {techTopics.length} topics completed
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-sm text-foreground">
                      {tech.progress}%
                    </span>
                  </div>
                </div>

                <Progress
                  value={tech.progress}
                  indicatorColor={tech.color}
                  size="sm"
                  className="mt-1"
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
