"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLearningStore } from "@/lib/store/learning-store";
import { StatCard } from "@/components/dashboard/stat-card";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TechnologyProgressList } from "@/components/dashboard/technology-progress-list";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StudyHeatmap } from "@/components/dashboard/study-heatmap";
import { QuickCreateModal } from "@/components/layout/quick-create-modal";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/utils";
import {
  Cpu,
  ListTree,
  CheckCircle2,
  Clock,
  FileText,
  Hourglass,
  Plus,
  Flame,
  Sparkles,
  BookOpen,
  Network,
} from "lucide-react";

export default function DashboardPage() {
  const { stats, isLoaded } = useLearningStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState<"tech" | "topic" | "note" | "mindmap" | "session">("tech");

  const openCreate = (tab: "tech" | "topic" | "note" | "mindmap" | "session") => {
    setCreateTab(tab);
    setIsCreateOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading your knowledge vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-transparent border border-primary/20 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Technical Learning Hub
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="h-3 w-3" /> {stats.streakDays} Days Streak
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to Your Knowledge System
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Track roadmaps, master hierarchical topics, take rich notes, inspect handwritten notes, and navigate interactive mind maps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <Button onClick={() => openCreate("session")} variant="secondary" size="sm" className="gap-1.5 shadow-sm">
            <Clock className="h-4 w-4 text-primary" /> Log Study Time
          </Button>
          <Button onClick={() => openCreate("tech")} size="sm" className="gap-1.5 shadow-sm shadow-primary/25">
            <Plus className="h-4 w-4" /> Add Technology
          </Button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Technologies"
          value={stats.totalTechnologies}
          subtitle="Tracked roadmaps"
          icon={<Cpu className="h-5 w-5" />}
          color="text-indigo-500"
        />
        <StatCard
          title="Total Topics"
          value={stats.totalTopics}
          subtitle="Nested concepts"
          icon={<ListTree className="h-5 w-5" />}
          color="text-blue-500"
        />
        <StatCard
          title="Completed"
          value={stats.completedTopics}
          subtitle="Mastered topics"
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="text-emerald-500"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressTopics}
          subtitle="Active learning"
          icon={<Hourglass className="h-5 w-5" />}
          color="text-amber-500"
        />
        <StatCard
          title="Total Notes"
          value={stats.totalNotes}
          subtitle="Rich documents"
          icon={<FileText className="h-5 w-5" />}
          color="text-rose-500"
        />
        <StatCard
          title="Study Time"
          value={formatMinutes(stats.totalLearningMinutes)}
          subtitle="All-time recorded"
          icon={<Clock className="h-5 w-5" />}
          color="text-purple-500"
        />
      </div>

      {/* Continue Learning Section */}
      <ContinueLearning />

      {/* 2-Column: Technology Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TechnologyProgressList onAddTech={() => openCreate("tech")} />
        <RecentActivity />
      </div>

      {/* Heatmap Section */}
      <StudyHeatmap />

      {/* Quick Action Drawer / Trigger Modal */}
      <QuickCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultTab={createTab}
      />
    </div>
  );
}
