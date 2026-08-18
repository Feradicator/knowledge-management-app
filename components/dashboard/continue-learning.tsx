"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLearningStore } from "@/lib/store/learning-store";
import { ArrowRight, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

export function ContinueLearning() {
  const { topics, technologies } = useLearningStore();

  // Find topics in progress (status == 'Learning' or progress between 1 and 99)
  const inProgressTopics = topics
    .filter((t) => (t.status === "Learning" || t.progress > 0) && t.progress < 100)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  if (inProgressTopics.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex justify-center mb-3">
          <BookOpen className="h-8 w-8 text-muted-foreground opacity-60" />
        </div>
        <h3 className="font-semibold text-foreground">All Caught Up!</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No topics are currently in progress. Pick a new topic from your roadmaps or start exploring a new technology!
        </p>
        <Link href="/topics" className="mt-4 inline-block">
          <Button size="sm" variant="outline">Browse Topics</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Continue Learning
        </h2>
        <Link
          href="/topics"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          View all topics <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inProgressTopics.map((topic) => {
          const tech = technologies.find((t) => t.id === topic.technology_id);

          return (
            <Card
              key={topic.id}
              hoverEffect
              className="p-5 flex flex-col justify-between group border-l-4"
              style={{ borderLeftColor: tech?.color || "hsl(var(--primary))" }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {tech?.name || "General"}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {topic.priority} Priority
                  </Badge>
                </div>

                <Link
                  href={`/topics/${topic.id}`}
                  className="font-bold text-foreground hover:text-primary transition-colors text-base line-clamp-1 group-hover:translate-x-0.5 transform duration-150 inline-block"
                >
                  {topic.name}
                </Link>

                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-4">
                  {topic.description || "Continue working through key concepts and checklist items."}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {formatRelativeDate(topic.last_studied_at || topic.updated_at)}
                  </span>
                  <span className="font-bold text-foreground">{topic.progress}%</span>
                </div>

                <Progress value={topic.progress} indicatorColor={tech?.color} size="sm" />

                <div className="flex justify-end pt-1">
                  <Link href={`/topics/${topic.id}`}>
                    <Button size="sm" variant="subtle" className="h-7 text-xs gap-1.5 w-full sm:w-auto">
                      Resume Study <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
