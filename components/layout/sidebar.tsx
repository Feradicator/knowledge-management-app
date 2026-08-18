"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  ListTree,
  FileText,
  Network,
  History,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderArchive,
  GraduationCap,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearningStore } from "@/lib/store/learning-store";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { technologies, topics, notes, mindMaps, stats } = useLearningStore();

  const favoritesCount =
    technologies.filter((t) => t.is_favorite).length +
    topics.filter((t) => t.is_favorite).length +
    notes.filter((n) => n.is_favorite).length +
    mindMaps.filter((m) => m.is_favorite).length;

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "My Technologies",
      href: "/technologies",
      icon: Cpu,
      badge: technologies.length,
    },
    {
      label: "Topics",
      href: "/topics",
      icon: ListTree,
      badge: stats.inProgressTopics > 0 ? `${stats.inProgressTopics} active` : undefined,
      badgeColor: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Notes",
      href: "/notes",
      icon: FileText,
      badge: notes.length,
    },
    {
      label: "Mind Maps",
      href: "/mind-maps",
      icon: Network,
      badge: mindMaps.length,
    },
    {
      label: "Files & Media",
      href: "/files",
      icon: FolderArchive,
    },
    {
      label: "Learning History",
      href: "/learning-history",
      icon: History,
    },
    {
      label: "Favorites",
      href: "/favorites",
      icon: Star,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3">
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-400 text-white shadow-md shadow-primary/25 font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-base tracking-tight text-foreground block leading-tight">
                  KnowledgeOS
                </span>
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> Personal Tech Vault
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  isCollapsed ? "justify-center" : "justify-between"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeColor || "bg-secondary text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Progress Card */}
      {!isCollapsed && (
        <div className="mt-auto p-3 rounded-xl bg-secondary/60 border border-border/50 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-foreground">Active Streak</span>
            <span className="text-primary font-bold">{stats.streakDays} Days 🔥</span>
          </div>
          <p className="text-muted-foreground text-[11px]">
            {stats.completedTopics} of {stats.totalTopics} topics mastered
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border text-foreground shadow-sm hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 relative shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
