"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLearningStore } from "@/lib/store/learning-store";
import {
  Sparkles,
  CheckCircle2,
  FileText,
  Upload,
  Network,
  Cpu,
  History,
  Clock,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

export function RecentActivity() {
  const { activityLogs } = useLearningStore();

  const getActionIcon = (entityType: string, actionType: string) => {
    if (actionType === "completed") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
    switch (entityType) {
      case "topic":
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case "note":
        return <FileText className="h-4 w-4 text-amber-500" />;
      case "file":
        return <Upload className="h-4 w-4 text-cyan-500" />;
      case "mind_map":
        return <Network className="h-4 w-4 text-purple-500" />;
      case "technology":
        return <Cpu className="h-4 w-4 text-indigo-500" />;
      case "session":
        return <History className="h-4 w-4 text-rose-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEntityUrl = (log: any) => {
    switch (log.entity_type) {
      case "topic":
        return `/topics/${log.entity_id}`;
      case "technology":
        return `/technologies/${log.entity_id}`;
      case "note":
        return `/notes/${log.entity_id}`;
      case "mind_map":
        return `/mind-maps/${log.entity_id}`;
      case "file":
        return `/files`;
      case "session":
        return `/learning-history`;
      default:
        return "/";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Activity
          </span>
          <span className="text-xs font-normal text-muted-foreground">Live Feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border/40 overflow-y-auto max-h-[380px]">
        {activityLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No recent activity recorded yet. Start learning to see your timeline!
          </div>
        ) : (
          activityLogs.slice(0, 8).map((log) => (
            <Link
              key={log.id}
              href={getEntityUrl(log)}
              className="flex items-start gap-3 p-3.5 hover:bg-accent/50 transition-colors group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                {getActionIcon(log.entity_type, log.action_type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                  {log.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatRelativeDate(log.created_at)}
                </p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
