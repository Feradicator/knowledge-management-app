"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Network,
  Plus,
  Search,
  Star,
  Trash2,
  Cpu,
  ListTree,
  ArrowRight,
  Sparkles,
  LayoutTemplate,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

export default function MindMapsPage() {
  const router = useRouter();
  const {
    mindMaps,
    technologies,
    topics,
    addMindMap,
    deleteMindMap,
    toggleFavoriteMindMap,
    createMindMapFromTechnology,
    createMindMapFromTopic,
    isOwner,
  } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateType, setTemplateType] = useState<"blank" | "tech" | "topic">("blank");
  const [selectedTechId, setSelectedTechId] = useState(technologies[0]?.id || "");
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || "");
  const [customTitle, setCustomTitle] = useState("");

  const filteredMindMaps = mindMaps.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (templateType === "tech" && selectedTechId) {
      const map = createMindMapFromTechnology(selectedTechId);
      setIsTemplateModalOpen(false);
      router.push(`/mind-maps/${map.id}`);
    } else if (templateType === "topic" && selectedTopicId) {
      const map = createMindMapFromTopic(selectedTopicId);
      setIsTemplateModalOpen(false);
      router.push(`/mind-maps/${map.id}`);
    } else {
      const title = customTitle.trim() || "New Concept Mind Map";
      const map = addMindMap({
        title,
        nodes_json: [
          {
            id: "node-root",
            type: "custom",
            position: { x: 350, y: 150 },
            data: { label: title, isRoot: true, color: "#6366f1" },
          },
        ],
      });
      setIsTemplateModalOpen(false);
      router.push(`/mind-maps/${map.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Network className="h-7 w-7 text-primary" /> Interactive Mind Maps
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design visual concept graphs, map architectural relationships, and organize technical knowledge.
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setIsTemplateModalOpen(true)} className="gap-2 shadow-sm shadow-primary/25">
            <Plus className="h-4 w-4" /> New Mind Map
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search mind maps by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Mind Maps Grid */}
      {filteredMindMaps.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-3">
            <Network className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">No Mind Maps Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Create an interactive concept graph from a template or start with a blank canvas!
          </p>
          {isOwner && (
            <Button onClick={() => setIsTemplateModalOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Create First Mind Map
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMindMaps.map((map) => {
            const tech = technologies.find((t) => t.id === map.technology_id);
            const topic = topics.find((t) => t.id === map.topic_id);

            return (
              <Card
                key={map.id}
                hoverEffect
                className="flex flex-col justify-between p-5 relative group border-t-4"
                style={{ borderTopColor: tech?.color || "#6366f1" }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tech && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: tech.color || "#6366f1" }}
                        >
                          {tech.name}
                        </span>
                      )}
                      {topic && (
                        <Badge variant="secondary" className="text-[10px]">
                          {topic.name}
                        </Badge>
                      )}
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavoriteMindMap(map.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-amber-500 transition-colors"
                          title={map.is_favorite ? "Remove from favorites" : "Favorite"}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              map.is_favorite ? "fill-amber-400 text-amber-400" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete mind map '${map.title}'?`)) {
                              deleteMindMap(map.id);
                            }
                          }}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete mind map"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/mind-maps/${map.id}`}
                    className="font-bold text-base text-foreground hover:text-primary transition-colors block line-clamp-2 mt-1 mb-2"
                  >
                    {map.title}
                  </Link>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {map.description || "Interactive node graph exploring relationships and architectural flows."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold">{map.nodes_json.length} Connected Nodes</span>
                  <Link
                    href={`/mind-maps/${map.id}`}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Open Canvas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Template Chooser Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Create Interactive Mind Map"
        maxWidth="lg"
      >
        <form onSubmit={handleStartTemplate} className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTemplateType("blank")}
              className={`p-4 rounded-xl border text-center transition-all ${
                templateType === "blank"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              <LayoutTemplate className="h-6 w-6 mx-auto mb-2" />
              <span className="text-xs block">Blank Canvas</span>
            </button>

            <button
              type="button"
              onClick={() => setTemplateType("tech")}
              className={`p-4 rounded-xl border text-center transition-all ${
                templateType === "tech"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              <Cpu className="h-6 w-6 mx-auto mb-2" />
              <span className="text-xs block">From Technology</span>
            </button>

            <button
              type="button"
              onClick={() => setTemplateType("topic")}
              className={`p-4 rounded-xl border text-center transition-all ${
                templateType === "topic"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              <ListTree className="h-6 w-6 mx-auto mb-2" />
              <span className="text-xs block">From Topic</span>
            </button>
          </div>

          {templateType === "blank" && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Mind Map Title
              </label>
              <Input
                placeholder="e.g. Distributed Consensus Algorithms"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
              />
            </div>
          )}

          {templateType === "tech" && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Choose Technology Roadmap to Auto-Generate
              </label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                {technologies.map((t) => (
                  <option key={t.id} value={t.id} className="bg-card">
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {templateType === "topic" && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Choose Topic to Auto-Generate Concept Map
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                {topics.map((top) => (
                  <option key={top.id} value={top.id} className="bg-card">
                    {top.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Launch Mind Map Canvas</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
