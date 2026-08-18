"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  ListTree,
  Search,
  Plus,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { Topic, TopicStatus, TopicPriority } from "@/types/database";
import { getStatusColor, getPriorityColor, formatRelativeDate } from "@/lib/utils";

export default function TopicsCatalogPage() {
  const {
    topics,
    technologies,
    checklistItems,
    addTopic,
    updateTopic,
    updateTopicProgress,
    deleteTopic,
    toggleFavoriteTopic,
  } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [sortBy, setSortBy] = useState<"updated" | "progress" | "name" | "priority">("updated");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicTechId, setNewTopicTechId] = useState(technologies[0]?.id || "");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [newTopicPriority, setNewTopicPriority] = useState<TopicPriority>("Medium");
  const [newTopicStatus, setNewTopicStatus] = useState<TopicStatus>("Not Started");

  // Filtering
  const filteredTopics = topics
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTech = selectedTech === "All" || t.technology_id === selectedTech;
      const matchesStatus = selectedStatus === "All" || t.status === selectedStatus;
      const matchesPriority = selectedPriority === "All" || t.priority === selectedPriority;
      return matchesSearch && matchesTech && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "priority") {
        const pOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !newTopicTechId) return;

    addTopic({
      technology_id: newTopicTechId,
      name: newTopicName,
      description: newTopicDesc,
      priority: newTopicPriority,
      status: newTopicStatus,
    });

    setNewTopicName("");
    setNewTopicDesc("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ListTree className="h-7 w-7 text-primary" /> Topics Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, filter, and track technical milestones across all engineering roadmaps.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm shadow-primary/25">
          <Plus className="h-4 w-4" /> Add Topic
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search all topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Technology Filter */}
          <div>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-card px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Technologies</option>
              {technologies.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-card px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Learning">Learning</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-9 rounded-lg border border-input bg-card px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="updated">Recently Updated</option>
              <option value="progress">Highest Progress</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Topics List */}
      {filteredTopics.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-3">
            <ListTree className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">No Topics Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Try adjusting your search criteria or add a new topic to your roadmaps.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Add Topic
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const tech = technologies.find((t) => t.id === topic.technology_id);
            const checklist = checklistItems.filter((c) => c.topic_id === topic.id);
            const completedChecklist = checklist.filter((c) => c.is_completed).length;
            const statusColor = getStatusColor(topic.status);
            const priorityColor = getPriorityColor(topic.priority);

            return (
              <Card
                key={topic.id}
                hoverEffect
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4"
                style={{ borderLeftColor: tech?.color || "hsl(var(--primary))" }}
              >
                {/* Left Metadata */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: tech?.color || "#6366f1" }}
                    >
                      {tech?.name || "General"}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                    >
                      {topic.status}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}
                    >
                      {topic.priority} Priority
                    </span>

                    {checklist.length > 0 && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                        <CheckSquare className="h-3.5 w-3.5 text-primary" />
                        {completedChecklist}/{checklist.length} checklist
                      </span>
                    )}

                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatRelativeDate(topic.last_studied_at || topic.updated_at)}
                    </span>
                  </div>

                  <Link
                    href={`/topics/${topic.id}`}
                    className="font-bold text-base text-foreground hover:text-primary transition-colors block truncate"
                  >
                    {topic.name}
                  </Link>

                  {topic.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {topic.description}
                    </p>
                  )}
                </div>

                {/* Right Progress Slider & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
                  <div className="flex items-center gap-3 w-44 sm:w-52">
                    <Slider
                      value={topic.progress}
                      onChange={(val) => updateTopicProgress(topic.id, val)}
                      accentColor={tech?.color}
                    />
                    <span className="font-bold text-xs w-10 text-right text-foreground">
                      {topic.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavoriteTopic(topic.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-secondary transition-colors"
                      title={topic.is_favorite ? "Remove favorite" : "Favorite"}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          topic.is_favorite ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete topic '${topic.name}'?`)) {
                          deleteTopic(topic.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link href={`/topics/${topic.id}`}>
                      <Button size="sm" variant="subtle" className="gap-1 text-xs">
                        Study <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Topic Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Topic"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Technology</label>
            <select
              value={newTopicTechId}
              onChange={(e) => setNewTopicTechId(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              {technologies.map((t) => (
                <option key={t.id} value={t.id} className="bg-card">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Topic Name</label>
            <Input
              placeholder="e.g. Distributed Tracing, Index Tuning, JWT Structure"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Initial Status</label>
              <select
                value={newTopicStatus}
                onChange={(e) => setNewTopicStatus(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="Not Started" className="bg-card">Not Started</option>
                <option value="Learning" className="bg-card">Learning</option>
                <option value="Completed" className="bg-card">Completed</option>
                <option value="Paused" className="bg-card">Paused</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Priority</label>
              <select
                value={newTopicPriority}
                onChange={(e) => setNewTopicPriority(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="High" className="bg-card">High</option>
                <option value="Medium" className="bg-card">Medium</option>
                <option value="Low" className="bg-card">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
            <Textarea
              placeholder="What core concepts will you learn in this topic?"
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Topic</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
