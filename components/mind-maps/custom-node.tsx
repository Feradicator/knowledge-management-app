"use client";

import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Sparkles, Trash2, Edit2, Check } from "lucide-react";

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data as any).label || "Node");
  const isRoot = Boolean((data as any).isRoot);
  const color = (data as any).color || "#6366f1";
  const description = (data as any).description;
  const status = (data as any).status;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    (data as any).label = label;
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-4 shadow-md transition-all duration-150 min-w-[180px] max-w-[280px] border-2",
        isRoot
          ? "bg-gradient-to-tr from-primary/20 via-card to-card text-foreground font-bold shadow-lg"
          : "bg-card text-card-foreground",
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg"
          : "hover:shadow-md"
      )}
      style={{ borderColor: color }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="h-3 w-3 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="h-3 w-3 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />

      {/* Node Header & Content */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          {isRoot ? (
            <span
              className="px-2 py-0.5 rounded text-[9px] font-extrabold text-white uppercase tracking-wider shadow-xs"
              style={{ backgroundColor: color }}
            >
              Root Concept
            </span>
          ) : (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}

          {status && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground font-semibold">
              {status}
            </span>
          )}
        </div>

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
            onDoubleClick={() => setIsEditing(true)}
            className="font-bold text-sm text-foreground tracking-tight break-words cursor-text"
          >
            {label}
          </div>
        )}

        {description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});

CustomNode.displayName = "CustomNode";
