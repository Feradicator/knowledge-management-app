"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { ReaderPreferencesBar } from "@/components/notes/reader-preferences-bar";
import { useReaderPreferences } from "@/lib/hooks/use-reader-preferences";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topic, Note, ChecklistItem } from "@/types/database";
import {
  ArrowLeft,
  BookOpen,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  ListTree,
  FileText,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Tag,
} from "lucide-react";
import { formatDateString, formatRelativeDate, getStatusColor, cn } from "@/lib/utils";

export default function CombinedNotesPage() {
  const params = useParams();
  const router = useRouter();
  const techId = params.id as string;

  const {
    getTechnologyById,
    getTopicTree,
    notes,
    checklistItems,
    files,
  } = useLearningStore();

  const readerPrefs = useReaderPreferences();

  const tech = getTechnologyById(techId);
  const topicsTree = useMemo(() => (tech ? getTopicTree(tech.id) : []), [tech, getTopicTree]);

  const [copied, setCopied] = useState(false);

  // Flatten topics with level information for clean book hierarchy
  const flattenedTopicsWithLevel = useMemo(() => {
    const list: { topic: Topic; level: number; chapterNumber: string }[] = [];
    const traverse = (topics: Topic[], level: number, prefix: string) => {
      topics.forEach((t, idx) => {
        const chapterNumber = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}.0`;
        list.push({ topic: t, level, chapterNumber });
        if (t.subtopics && t.subtopics.length > 0) {
          traverse(t.subtopics, level + 1, `${idx + 1}`);
        }
      });
    };
    traverse(topicsTree, 0, "");
    return list;
  }, [topicsTree]);

  // General notes for this technology (not assigned to any specific topic)
  const generalTechNotes = useMemo(() => {
    return notes.filter((n) => n.technology_id === techId && !n.topic_id);
  }, [notes, techId]);

  if (!tech) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-foreground">Technology Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested technology does not exist or has been removed.
        </p>
        <Link href="/technologies" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Technologies
          </Button>
        </Link>
      </div>
    );
  }

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# ${tech.name} — Study Guide & Comprehensive Notes\n\n`;
    md += `**Category:** ${tech.category} | **Progress:** ${tech.progress}%\n`;
    md += `*Generated from KnowledgeOS on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    if (tech.description) {
      md += `## Overview\n${tech.description}\n\n`;
    }

    if (generalTechNotes.length > 0) {
      md += `## General Technical Notes\n\n`;
      generalTechNotes.forEach((n) => {
        const plainText = n.content_html.replace(/<[^>]+>/g, " ");
        md += `### ${n.title}\n\n${plainText.trim()}\n\n`;
      });
      md += `---\n\n`;
    }

    md += `## Table of Contents & Roadmap Notes\n\n`;
    flattenedTopicsWithLevel.forEach(({ topic, chapterNumber }) => {
      md += `### Chapter ${chapterNumber}: ${topic.name} (${topic.status})\n\n`;
      if (topic.description) {
        md += `> ${topic.description}\n\n`;
      }

      const topicNotes = notes.filter((n) => n.topic_id === topic.id);
      if (topicNotes.length > 0) {
        topicNotes.forEach((n) => {
          const plainText = n.content_html.replace(/<[^>]+>/g, " ");
          md += `#### ${n.title}\n\n${plainText.trim()}\n\n`;
        });
      } else {
        md += `*No notes documented for this topic yet.*\n\n`;
      }

      md += `---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 print:p-0 print:m-0 print:max-w-full">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs print:hidden flex-wrap">
        <div className="flex items-center gap-3">
          <Link href={`/technologies/${tech.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to {tech.name}
            </Button>
          </Link>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Compiled Study Guide
          </span>
        </div>

        {/* Reader Theme & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <ReaderPreferencesBar
            theme={readerPrefs.readerTheme}
            fontSize={readerPrefs.readerFontSize}
            onThemeChange={readerPrefs.updateTheme}
            onFontSizeChange={readerPrefs.updateFontSize}
            onIncreaseFontSize={readerPrefs.increaseFontSize}
            onDecreaseFontSize={readerPrefs.decreaseFontSize}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{copied ? "Copied! ✓" : "Markdown"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrintPdf}
            className="gap-1.5 text-xs shadow-xs font-bold"
          >
            <Printer className="h-4 w-4" />
            <span>Print PDF</span>
          </Button>
        </div>
      </div>

      {/* Printable Book Container with Dynamic Theme */}
      <div
        className={cn(
          "rounded-3xl border p-8 sm:p-12 shadow-sm space-y-10 transition-colors duration-200 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black",
          readerPrefs.getThemeContainerClass()
        )}
      >
        {/* Book Title & Meta Header */}
        <div className="space-y-4 pb-8 border-b-2 border-border/80">
          <div className="flex items-center gap-2.5">
            <span
              className="px-3 py-1 rounded-lg text-xs font-extrabold text-white uppercase tracking-wider"
              style={{ backgroundColor: tech.color || "#6366f1" }}
            >
              {tech.category}
            </span>
            <span className="text-xs font-semibold opacity-70">
              Progress: {tech.progress}%
            </span>
            <span className="text-xs font-semibold opacity-70 ml-auto hidden sm:inline">
              Compiled on {new Date().toLocaleDateString()}
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              {tech.name} Study Guide
            </h1>
            <p className="text-sm opacity-80 mt-2 max-w-2xl leading-relaxed">
              {tech.description || "Comprehensive technical reference, command guides, and curated architectural deep-dives."}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs opacity-75 flex-wrap">
            <span className="flex items-center gap-1 font-medium">
              <ListTree className="h-3.5 w-3.5" /> {flattenedTopicsWithLevel.length} Chapters & Subtopics
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <FileText className="h-3.5 w-3.5" /> {notes.filter((n) => n.technology_id === tech.id).length} Technical Notes
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Mastery: {tech.progress}%
            </span>
          </div>
        </div>

        {/* General Technical Notes */}
        {generalTechNotes.length > 0 && (
          <div className="space-y-6 pb-6 border-b border-border/70">
            <h2 className="text-2xl font-bold">General Architecture & Setup</h2>
            <div className="space-y-6">
              {generalTechNotes.map((n) => (
                <div key={n.id} className="space-y-2">
                  <h3 className="text-lg font-bold">{n.title}</h3>
                  <div
                    className={cn(
                      "tiptap-content prose max-w-none",
                      readerPrefs.getProseClass(),
                      readerPrefs.getFontSizeClass()
                    )}
                    dangerouslySetInnerHTML={{ __html: n.content_html }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Chapters */}
        <div className="space-y-12">
          {flattenedTopicsWithLevel.map(({ topic, level, chapterNumber }) => {
            const topicNotes = notes.filter((n) => n.topic_id === topic.id);
            const topicChecklist = checklistItems.filter((c) => c.topic_id === topic.id);
            const topicFileItems = files.filter((f) => f.topic_id === topic.id);
            const statusColor = getStatusColor(topic.status);

            return (
              <section
                key={topic.id}
                id={`topic-${topic.id}`}
                className="space-y-4 pt-6 border-t border-border/70 first:border-t-0 break-inside-avoid"
              >
                {/* Chapter Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        CHAPTER {chapterNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                      >
                        {topic.status} ({topic.progress}%)
                      </span>
                    </div>

                    <h2
                      className={`font-extrabold ${
                        level === 0 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                      }`}
                    >
                      {topic.name}
                    </h2>
                  </div>

                  <Link href={`/topics/${topic.id}`} className="print:hidden">
                    <Button variant="subtle" size="sm" className="gap-1 text-xs">
                      Open Topic <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                {/* Topic Description */}
                {topic.description && (
                  <p className="text-sm opacity-80 italic bg-secondary/30 p-3 rounded-xl border border-border/40">
                    {topic.description}
                  </p>
                )}

                {/* Topic Deep-Dive Notes */}
                {topicNotes.length > 0 ? (
                  <div className="space-y-6 pt-2">
                    {topicNotes.map((note) => (
                      <div key={note.id} className="space-y-3">
                        {topicNotes.length > 1 && (
                          <h4 className="text-base font-bold flex items-center gap-2 border-b border-border/40 pb-1">
                            <FileText className="h-4 w-4 text-primary" /> {note.title}
                          </h4>
                        )}
                        <div
                          className={cn(
                            "tiptap-content prose max-w-none",
                            readerPrefs.getProseClass(),
                            readerPrefs.getFontSizeClass()
                          )}
                          dangerouslySetInnerHTML={{ __html: note.content_html }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-60 italic py-2">
                    No notes written for this chapter yet.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
