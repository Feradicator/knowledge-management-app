"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Sparkles, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandSearch } from "./command-search";
import { QuickCreateModal } from "./quick-create-modal";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hasSupabase, setHasSupabase] = useState(false);

  useEffect(() => {
    // Check if Supabase keys exist in environment
    setHasSupabase(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));

    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("open-command-search", handleOpenSearch);
    return () => window.removeEventListener("open-command-search", handleOpenSearch);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
        {/* Left Search Trigger */}
        <div className="flex items-center gap-3 pl-12 md:pl-0 flex-1 max-w-md">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-input/80 bg-card/60 px-3.5 py-1.5 text-xs sm:text-sm text-muted-foreground shadow-sm hover:border-primary/40 hover:bg-card transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span>Search knowledge vault...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Storage / Supabase Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 border border-border/60 text-[11px] font-medium text-muted-foreground">
            <Database className="h-3 w-3 text-primary" />
            <span>{hasSupabase ? "Supabase Cloud" : "Local Vault Sync"}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Quick Create Button */}
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 shadow-sm shadow-primary/25 rounded-xl font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Item</span>
          </Button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-400 text-white font-bold text-xs shadow-sm">
            ME
          </div>
        </div>
      </header>

      {/* Modals */}
      <CommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}
