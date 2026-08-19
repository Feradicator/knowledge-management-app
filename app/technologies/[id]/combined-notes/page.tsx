"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
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
import { formatDateString, formatRelativeDate, getStatusColor } from "@/lib/utils";

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
    let md = `# ${tech.name} Comprehensive Study Guide & Notes\n\n`;
    md += `*Category: ${tech.category} | Progress: ${tech.progress}% | Exported: ${new Date().toLocaleDateString()}*\n\n`;
    md += `${tech.description || ""}\n\n`;
    md += `---\n\n## Table of Contents\n\n`;

    flattenedTopicsWithLevel.forEach(({ topic, chapterNumber }) => {
      md += `- [${chapterNumber} ${topic.name}](#${topic.slug || topic.id})\n`;
    });
    md += `\n---\n\n`;

    flattenedTopicsWithLevel.forEach(({ topic, chapterNumber }) => {
      const topicNotes = notes.filter((n) => n.topic_id === topic.id);
      const chk = checklistItems.filter((c) => c.topic_id === topic.id);

      md += `## ${chapterNumber} ${topic.name}\n\n`;
      md += `**Status:** ${topic.status} | **Priority:** ${topic.priority} | **Mastery:** ${topic.progress}%\n\n`;
      if (topic.description) md += `*${topic.description}*\n\n`;

      if (chk.length > 0) {
        md += `### Milestones & Checklist\n`;
        chk.forEach((c) => {
          md += `- [${c.is_completed ? "x" : " "}] ${c.title}\n`;
        });
        md += `\n`;
      }

      if (topicNotes.length > 0) {
        md += `### Notes & Insights\n\n`;
        topicNotes.forEach((n) => {
          // Strip HTML tags for clean markdown copy
          const plainText = n.content_html
            ? n.content_html.replace(/<\/p>/g, "\n\n").replace(/<br\s*[\/]?>/gi, "\n").replace(/<[^>]+>/g, "")
            : "No text notes recorded.";
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20 print:p-0 print:m-0 print:max-w-full">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/technologies/${tech.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to {tech.name}
            </Button>
          </Link>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Compiled Study Guide & Book
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{copied ? "Copied Markdown! ✓" : "Copy Markdown"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrintPdf}
            className="gap-1.5 text-xs shadow-sm shadow-primary/20 bg-primary text-primary-foreground font-bold"
          >
            <Printer className="h-4 w-4" />
            <span>Export to PDF / Print</span>
          </Button>
        </div>
      </div>

      {/* Printable Book Container */}
      <div className="bg-card text-foreground rounded-3xl border border-border/80 p-8 sm:p-12 shadow-sm space-y-10 print:border-none print:shadow-none print:p-0">
        {/* Book Title & Meta Header */}
        <div className="space-y-4 pb-8 border-b-2 border-border/80">
          <div className="flex items-center gap-2.5">
            <span
              className="px-3 py-1 rounded-lg text-xs font-extrabold text-white uppercase tracking-wider"
              style={{ backgroundColor: tech.color || "#6366f1" }}
            >
              {tech.category}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {tech.progress}% Total Mastery • {flattenedTopicsWithLevel.length} Topics Compiled
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {tech.name} Comprehensive Study Guide
          </h1>

          {tech.description && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {tech.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <span>Compiled from live knowledge vault</span>
            <span>•</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Table of Contents Box */}
        <div className="p-6 rounded-2xl bg-secondary/40 border border-border/60 space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ListTree className="h-5 w-5 text-primary" /> Table of Contents
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            {flattenedTopicsWithLevel.map(({ topic, level, chapterNumber }) => (
              <a
                key={topic.id}
                href={`#topic-${topic.id}`}
                className="flex items-center justify-between gap-2 py-1 text-foreground/80 hover:text-primary transition-colors group"
                style={{ paddingLeft: `${level * 12}px` }}
              >
                <span className="truncate group-hover:underline">
                  <strong className="font-mono text-muted-foreground mr-1.5">{chapterNumber}</strong>
                  {topic.name}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {topic.progress}%
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* General Tech Notes (if any) */}
        {generalTechNotes.length > 0 && (
          <div className="space-y-4 pb-8 border-b border-border/60">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> General Overview & Architecture Notes
            </h2>
            <div className="space-y-4">
              {generalTechNotes.map((n) => (
                <div key={n.id} className="p-5 rounded-2xl bg-secondary/20 border border-border/60 space-y-2">
                  <h3 className="font-bold text-base text-foreground">{n.title}</h3>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-foreground/90"
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
                      className={`font-extrabold text-foreground ${
                        level === 0 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl text-foreground/90"
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
                  <p className="text-sm text-muted-foreground italic bg-secondary/30 p-3 rounded-xl border border-border/40">
                    {topic.description}
                  </p>
                )}

                {/* Checklist Milestones */}
                {topicChecklist.length > 0 && (
                  <div className="space-y-2 p-4 rounded-xl bg-secondary/20 border border-border/50">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Milestones & Checklist
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {topicChecklist.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            item.is_completed
                              ? "text-emerald-600 dark:text-emerald-400 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span className="font-mono text-xs">
                            {item.is_completed ? "☑" : "☐"}
                          </span>
                          <span>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Content */}
                {topicNotes.length > 0 ? (
                  <div className="space-y-4">
                    {topicNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                          <h3 className="font-bold text-base text-foreground">{note.title}</h3>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1">
                              {note.tags.map((t) => (
                                <span
                                  key={t}
                                  className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: note.content_html }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-2 italic">
                    No detailed text notes documented yet for this topic.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Print CSS Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, aside, header, .print\\:hidden {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
