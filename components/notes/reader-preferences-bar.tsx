"use client";

import React from "react";
import { Sun, Moon, BookOpen, ZoomIn, ZoomOut, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReaderTheme, ReaderFontSize } from "@/lib/hooks/use-reader-preferences";

interface ReaderPreferencesBarProps {
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  onThemeChange: (theme: ReaderTheme) => void;
  onFontSizeChange: (size: ReaderFontSize) => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  className?: string;
}

export function ReaderPreferencesBar({
  theme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
  onIncreaseFontSize,
  onDecreaseFontSize,
  className,
}: ReaderPreferencesBarProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 p-1.5 rounded-xl bg-card border border-border/80 shadow-xs backdrop-blur-md flex-wrap",
        className
      )}
    >
      {/* Theme Selector Pill Group */}
      <div className="flex items-center bg-secondary/70 p-0.5 rounded-lg border border-border/50">
        <button
          type="button"
          onClick={() => onThemeChange("day")}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
            theme === "day"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Day Mode (Pure White Paper)"
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">Day</span>
        </button>

        <button
          type="button"
          onClick={() => onThemeChange("night")}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
            theme === "night"
              ? "bg-[#0d1117] text-white shadow-xs border border-slate-700"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Night Mode (Deep Dark Background)"
        >
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Night</span>
        </button>

        <button
          type="button"
          onClick={() => onThemeChange("sepia")}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
            theme === "sepia"
              ? "bg-[#fbf0d9] text-[#433422] shadow-xs border border-[#ebd9b8]"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Sepia Mode (Warm Book Paper)"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-700" />
          <span className="hidden sm:inline">Sepia</span>
        </button>
      </div>

      <div className="h-4 w-px bg-border/80 hidden sm:block" />

      {/* Font Size Adjuster Group */}
      <div className="flex items-center bg-secondary/70 p-0.5 rounded-lg border border-border/50">
        <button
          type="button"
          onClick={onDecreaseFontSize}
          className="px-2 py-1 rounded-md text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors cursor-pointer"
          title="Decrease Font Size"
        >
          A-
        </button>

        <select
          value={fontSize}
          onChange={(e) => onFontSizeChange(e.target.value as ReaderFontSize)}
          aria-label="Reading Font Size"
          className="h-6 px-1.5 text-[11px] font-semibold bg-transparent border-0 text-foreground focus:outline-none cursor-pointer"
        >
          <option value="sm">Small</option>
          <option value="base">Normal</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
          <option value="2xl">2X Large</option>
        </select>

        <button
          type="button"
          onClick={onIncreaseFontSize}
          className="px-2 py-1 rounded-md text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors cursor-pointer"
          title="Increase Font Size"
        >
          A+
        </button>
      </div>
    </div>
  );
}
