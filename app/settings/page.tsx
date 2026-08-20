"use client";

import React, { useState, useEffect } from "react";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Database,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    resetToSampleData,
    clearAllData,
    exportDataBackup,
    importDataBackup,
    stats,
    isOwner,
  } = useLearningStore();

  const [hasSupabase, setHasSupabase] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setHasSupabase(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));
  }, []);

  const handleSeed = () => {
    if (confirm("Reset knowledge vault with comprehensive sample engineering roadmaps?")) {
      resetToSampleData();
      confetti({ particleCount: 60, spread: 60 });
      alert("Sample engineering data loaded successfully! Explore Java, Spring Boot, Docker, React, and AI.");
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear ALL data from your vault? This cannot be undone.")) {
      clearAllData();
      alert("Vault cleared. You can start fresh or reload sample data at any time.");
    }
  };

  const handleExport = () => {
    const backupJson = exportDataBackup();
    const blob = new Blob([backupJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knowledge_vault_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataBackup(content);
      if (success) {
        setImportStatus("Vault data restored successfully!");
        confetti({ particleCount: 50 });
      } else {
        setImportStatus("Invalid backup JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" /> Application Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize themes, manage cloud database synchronization, backup data, or seed realistic technical datasets.
        </p>
      </div>

      {/* Theme Settings */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" /> Appearance & Theme
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose your interface appearance. Changes are preserved across sessions.
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            <Moon className="h-5 w-5 mb-2" />
            <span className="text-xs">Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            <Sun className="h-5 w-5 mb-2" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === "system"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            <Laptop className="h-5 w-5 mb-2" />
            <span className="text-xs">System Mode</span>
          </button>
        </div>
      </Card>

      {/* Supabase & Cloud Sync */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" /> Database & Supabase Cloud Connection
        </h2>
        <p className="text-xs text-muted-foreground">
          KnowledgeOS stores your data in real-time. Connect Supabase PostgreSQL & Storage for multi-device sync.
        </p>

        <div className="p-4 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">
                {hasSupabase ? "Supabase Cloud Connected" : "Local Encrypted Storage Vault Active"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {hasSupabase
                  ? "Connected to PostgreSQL with Row Level Security."
                  : "All roadmaps, notes, files, mind maps, and analytics are persisted safely."}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Operational
          </span>
        </div>
      </Card>

      {/* Sample Data & Vault Management (Only for Owner) */}
      {isOwner && (
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Sample Data & Vault Seeder
          </h2>
          <p className="text-xs text-muted-foreground">
            Pre-populate realistic technical roadmaps (Java, Spring Boot with JWT checklists, React, Docker, Postgres, AI) or clear the vault to start clean.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={handleSeed} variant="secondary" className="gap-2 text-xs font-semibold">
              <RefreshCw className="h-4 w-4 text-primary" /> Seed Realistic Sample Roadmaps
            </Button>

            <Button onClick={handleClear} variant="destructive" className="gap-2 text-xs font-semibold">
              <Trash2 className="h-4 w-4" /> Wipe Entire Vault Data
            </Button>
          </div>
        </Card>
      )}

      {/* Backup & Restore */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Download className="h-5 w-5 text-emerald-500" /> Backup & Export Vault
        </h2>
        <p className="text-xs text-muted-foreground">
          Export your entire learning history, notes, mind maps, and checklists to an offline JSON backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={handleExport} variant="outline" className="gap-2 text-xs">
            <Download className="h-4 w-4" /> Export Backup (JSON)
          </Button>

          {isOwner && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-xs font-medium hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" /> Import Backup File
              </span>
            </label>
          )}
        </div>

        {importStatus && (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {importStatus}
          </p>
        )}
      </Card>

      {/* System Statistics */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" /> Vault Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground">Technologies:</span>
            <p className="font-bold text-base text-foreground mt-0.5">{stats.totalTechnologies}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground">Topics:</span>
            <p className="font-bold text-base text-foreground mt-0.5">{stats.totalTopics}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground">Notes:</span>
            <p className="font-bold text-base text-foreground mt-0.5">{stats.totalNotes}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground">Mind Maps:</span>
            <p className="font-bold text-base text-foreground mt-0.5">{stats.totalMindMaps}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
