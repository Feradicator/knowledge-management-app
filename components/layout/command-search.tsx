"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Cpu, ListTree, FileText, Network, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import { useLearningStore } from "@/lib/store/learning-store";
import { cn } from "@/lib/utils";

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandSearch({ isOpen, onClose }: CommandSearchProps) {
  const router = useRouter();
  const { searchAll } = useLearningStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchAll(query);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or global listener
          const event = new CustomEvent("open-command-search");
          window.dispatchEvent(event);
        }
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        navigateToResult(results[selectedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const navigateToResult = (res: any) => {
    onClose();
    router.push(res.url);
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technology":
        return <Cpu className="h-4 w-4 text-emerald-500" />;
      case "topic":
        return <ListTree className="h-4 w-4 text-blue-500" />;
      case "note":
        return <FileText className="h-4 w-4 text-amber-500" />;
      case "mind_map":
        return <Network className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 z-10">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/70">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search technologies, topics, notes, mind maps... (e.g. 'JWT', 'Docker', 'Java')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm sm:text-base outline-none text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <div className="flex justify-center mb-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse-subtle" />
              </div>
              <p className="font-medium text-foreground">Global Knowledge Search</p>
              <p className="text-xs text-muted-foreground mt-1">
                Type keywords to instantly search across all technologies, subtopics, notes, and mind maps.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No results found for &ldquo;<span className="text-foreground font-semibold">{query}</span>&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res, idx) => (
                <div
                  key={`${res.type}-${res.id}`}
                  onClick={() => navigateToResult(res)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm cursor-pointer transition-colors",
                    selectedIndex === idx
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary shrink-0">
                      {getTypeIcon(res.type)}
                    </div>
                    <div className="truncate">
                      <div className="font-medium truncate flex items-center gap-2">
                        <span>{res.title}</span>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-secondary text-muted-foreground font-semibold">
                          {res.type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {res.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedIndex === idx && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-primary" />
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/40 border-t border-border/50 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="rounded bg-card px-1.5 py-0.5 border border-border">↑</kbd>
            <kbd className="rounded bg-card px-1.5 py-0.5 border border-border">↓</kbd>
            <span>Select:</span>
            <kbd className="rounded bg-card px-1.5 py-0.5 border border-border">↵</kbd>
          </div>
          <div>Ctrl + K</div>
        </div>
      </div>
    </div>
  );
}
