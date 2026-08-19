"use client";

import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Sparkles,
  Layers,
  CheckCircle2,
  FolderTree,
  Edit2,
  Check,
} from "lucide-react";

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data as any).label || "Node");
  const isRoot = Boolean((data as any).isRoot);
  const level = (data as any).level ?? (isRoot ? 0 : 1);
  const color = (data as any).color || "#6366f1";
  const description = (data as any).description;
  const status = (data as any).status;
  const hasChildren = Boolean((data as any).hasChildren);
  const isExpanded = Boolean((data as any).isExpanded);
  const childCount = (data as any).childCount || 0;
  const onToggleExpand = (data as any).onToggleExpand;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    (data as any).label = label;
    setIsEditing(false);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof onToggleExpand === "function") {
      onToggleExpand(id);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-4 shadow-md transition-all duration-200 min-w-[200px] max-w-[300px] border-2 cursor-pointer relative select-none",
        isRoot
          ? "bg-gradient-to-tr from-primary/20 via-card to-card text-foreground font-bold shadow-xl ring-1 ring-primary/30"
          : level === 1
          ? "bg-card text-card-foreground shadow-md hover:border-primary/60"
          : "bg-secondary/40 text-card-foreground text-xs shadow-xs",
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-[1.02]"
          : "hover:shadow-lg hover:scale-[1.01]"
      )}
      style={{ borderColor: color }}
      onClick={() => {
        if (hasChildren && typeof onToggleExpand === "function") {
          onToggleExpand(id);
        }
      }}
    >
      {/* Connection Handles (Left & Right for Horizontal Tree Flow) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="h-3.5 w-3.5 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="h-3.5 w-3.5 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="h-3 w-3 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="h-3 w-3 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />

      {/* Node Header & Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          {isRoot ? (
            <span
              className="px-2.5 py-0.5 rounded text-[10px] font-extrabold text-white uppercase tracking-wider shadow-xs flex items-center gap-1"
              style={{ backgroundColor: color }}
            >
              <Sparkles className="h-3 w-3" /> Root Technology
            </span>
          ) : level === 1 ? (
            <span
              className="px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wide flex items-center gap-1"
              style={{ backgroundColor: color }}
            >
              <FolderTree className="h-2.5 w-2.5" /> Topic
            </span>
          ) : (
            <span className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              • Subtopic
            </span>
          )}

          {status && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground font-semibold">
              {status}
            </span>
          )}
        </div>

        {/* Title */}
        {isEditing ? (
          <form onSubmit={handleSave} className="flex items-center gap-1 mt-1">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full text-xs font-semibold bg-secondary px-2 py-1 rounded outline-none border border-primary text-foreground"
              autoFocus
              onBlur={() => {
                (data as any).label = label;
                setIsEditing(false);
              }}
            />
            <button type="submit" className="p-1 text-primary hover:bg-secondary rounded">
              <Check className="h-3 w-3" />
            </button>
          </form>
        ) : (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={cn(
              "font-bold tracking-tight break-words text-foreground",
              isRoot ? "text-base sm:text-lg" : level === 1 ? "text-sm" : "text-xs"
            )}
          >
            {label}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Expand / Collapse Action Badge for Parent Nodes */}
        {hasChildren && (
          <div className="pt-2 mt-1 border-t border-border/40 flex items-center justify-between">
            <button
              onClick={handleToggleClick}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shadow-xs",
                isExpanded
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:opacity-90 animate-pulse"
              )}
            >
              {isExpanded ? (
                <>
                  <Minus className="h-3 w-3" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  <span>Expand {childCount} {level === 0 ? "Topics" : "Subtopics"}</span>
                </>
              )}
            </button>

            <span className="text-[10px] font-mono text-muted-foreground">
              {childCount} {level === 0 ? "topics" : "items"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

CustomNode.displayName = "CustomNode";
