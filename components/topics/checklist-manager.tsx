"use client";

import React, { useState } from "react";
import { useLearningStore } from "@/lib/store/learning-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistManagerProps {
  topicId: string;
  accentColor?: string;
}

export function ChecklistManager({ topicId, accentColor }: ChecklistManagerProps) {
  const { getTopicChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } =
    useLearningStore();
  const [newItemTitle, setNewItemTitle] = useState("");

  const items = getTopicChecklist(topicId);
  const completedCount = items.filter((i) => i.is_completed).length;
  const percentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    addChecklistItem(topicId, newItemTitle.trim());
    setNewItemTitle("");
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-card border border-border/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">Learning Checklist</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-muted-foreground">
            {completedCount} of {items.length} tasks completed
          </span>
          <span className="font-extrabold text-foreground">{percentage}%</span>
        </div>
      </div>

      {/* Checklist Progress */}
      <Progress value={percentage} indicatorColor={accentColor} size="sm" />

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="flex items-center gap-2 pt-1">
        <Input
          placeholder="Add a checklist concept (e.g. 'Access token expiration', 'Signing keys')..."
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          className="text-xs sm:text-sm"
        />
        <Button type="submit" size="sm" className="gap-1 shrink-0">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>

      {/* Items List */}
      <div className="space-y-2 pt-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No checklist items yet. Add atomic milestones to master this topic!
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none group",
                item.is_completed
                  ? "bg-secondary/40 border-border/60 text-muted-foreground"
                  : "bg-card border-border/80 hover:border-primary/40 text-foreground"
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0",
                    item.is_completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-input hover:border-primary"
                  )}
                >
                  {item.is_completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium transition-all break-words",
                    item.is_completed && "line-through opacity-70"
                  )}
                >
                  {item.title}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChecklistItem(item.id);
                }}
                className="p-1 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-secondary transition-all"
                title="Delete item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
