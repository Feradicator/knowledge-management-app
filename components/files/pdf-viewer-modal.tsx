"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
  Printer,
  Sparkles,
} from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
}: PdfViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !pdfUrl) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth={isFullscreen ? "full" : "4xl"}
    >
      <div className="flex flex-col h-full -mt-4 space-y-3">
        {/* PDF Reader Toolbar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate max-w-md">
                {title || "PDF Document"}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                In-App Document Reader
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="gap-1 text-xs h-8"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" /> Normal View
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                </>
              )}
            </Button>

            <a
              href={pdfUrl}
              download={title.endsWith(".pdf") ? title : `${title}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </a>

            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1 text-xs h-8">
                <ExternalLink className="h-3.5 w-3.5" /> Open Tab
              </Button>
            </a>
          </div>
        </div>

        {/* Embedded PDF Canvas / Viewer */}
        <div
          className={`w-full rounded-xl overflow-hidden bg-secondary/30 border border-border/80 relative transition-all ${
            isFullscreen ? "h-[85vh]" : "h-[72vh]"
          }`}
        >
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full rounded-xl border-none"
            title={title}
          />
        </div>
      </div>
    </Modal>
  );
}
