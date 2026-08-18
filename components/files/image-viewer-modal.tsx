"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}) {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="4xl">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
            Zoom -
          </Button>
          <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
            Zoom +
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(1)}>
            Reset
          </Button>
        </div>
        <div className="w-full max-h-[65vh] overflow-auto rounded-xl border border-border/80 bg-black/5 flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt={title}
            className="rounded-lg object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </div>
    </Modal>
  );
}
