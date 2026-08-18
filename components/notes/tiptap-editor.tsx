"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  FileCode,
  Quote,
  Table as TableIcon,
  Highlighter,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  Save,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  initialContent?: string;
  onSave?: (contentHtml: string) => void;
  placeholder?: string;
  autoSave?: boolean;
}

export function TiptapEditor({
  initialContent = "",
  onSave,
  placeholder = "Write your technical notes, code snippets, architectural trade-offs...",
  autoSave = true,
}: TiptapEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap-content prose dark:prose-invert max-w-none focus:outline-none min-h-[260px] p-4 text-sm sm:text-base",
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus("unsaved");
    },
  });

  // Debounced autosave
  useEffect(() => {
    if (!autoSave || !editor || saveStatus !== "unsaved") return;

    setSaveStatus("saving");
    const timeout = setTimeout(() => {
      const html = editor.getHTML();
      onSave?.(html);
      setSaveStatus("saved");
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1200);

    return () => clearTimeout(timeout);
  }, [editor, saveStatus, autoSave, onSave]);

  const handleManualSave = () => {
    if (!editor) return;
    setSaveStatus("saving");
    const html = editor.getHTML();
    onSave?.(html);
    setSaveStatus("saved");
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL or paste an image link:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-secondary/50 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              "p-1.5 rounded-lg text-xs font-bold transition-colors",
              editor.isActive("heading", { level: 1 })
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "p-1.5 rounded-lg text-xs font-bold transition-colors",
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              "p-1.5 rounded-lg text-xs font-bold transition-colors",
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Text Styling */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("bold")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("italic")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("underline")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("highlight")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Highlight text"
          >
            <Highlighter className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("bulletList")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("orderedList")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Code & Quotes */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("code")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("codeBlock")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Code Block"
          >
            <FileCode className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("blockquote")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Table, Link, Image */}
          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            title="Insert 3x3 Table"
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              editor.isActive("link")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Save Status & Button */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
            {saveStatus === "saving" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                Autosaving...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                Saved {lastSavedTime && `at ${lastSavedTime}`}
              </>
            )}
            {saveStatus === "unsaved" && "Unsaved changes"}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSave}
            className="h-7 text-xs gap-1"
          >
            <Save className="h-3 w-3" /> Save
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
