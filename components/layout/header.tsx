"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Sparkles, Database, ShieldCheck, Eye, LogOut, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandSearch } from "./command-search";
import { QuickCreateModal } from "./quick-create-modal";
import { OwnerAuthModal } from "@/components/auth/owner-auth-modal";
import { useLearningStore } from "@/lib/store/learning-store";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hasSupabase, setHasSupabase] = useState(false);

  const {
    isOwner,
    currentUser,
    setIsAuthModalOpen,
    requireOwner,
    signOut,
  } = useLearningStore();

  useEffect(() => {
    // Check if Supabase keys exist in environment
    setHasSupabase(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));

    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("open-command-search", handleOpenSearch);
    return () => window.removeEventListener("open-command-search", handleOpenSearch);
  }, []);

  const handleCreateClick = () => {
    if (requireOwner("create new items in the knowledge vault")) {
      setIsCreateOpen(true);
    }
  };

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
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 border border-border/60 text-[11px] font-medium text-muted-foreground">
            <Database className="h-3 w-3 text-primary" />
            <span>{hasSupabase ? "Supabase Cloud" : "Local Vault Sync"}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Owner vs Viewer Access Badge */}
          {isOwner ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer shadow-xs"
              title="Owner Mode active. Click to manage credentials or sign out."
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Owner Mode</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/80 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="You are in Read-Only Viewer mode. Click to sign in as Owner."
            >
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Viewer Mode</span>
              <span className="text-[10px] font-bold text-primary sm:border-l sm:border-border/80 sm:pl-1.5">Sign In</span>
            </button>
          )}

          {/* Quick Create Button (Protected by requireOwner) */}
          <Button
            size="sm"
            onClick={handleCreateClick}
            className="gap-1.5 shadow-sm shadow-primary/25 rounded-xl font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Item</span>
          </Button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Avatar */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-400 text-white font-bold text-xs shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
            title={isOwner ? `Signed in as Owner: ${currentUser?.email || ""}` : "Click to Sign In as Owner"}
          >
            {isOwner ? (currentUser?.email ? currentUser.email.slice(0, 2).toUpperCase() : "OW") : "GU"}
          </button>
        </div>
      </header>

      {/* Modals */}
      <CommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <OwnerAuthModal />
    </>
  );
}
