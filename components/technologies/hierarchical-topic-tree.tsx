"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Topic, TopicStatus, TopicPriority } from "@/types/database";
import { useLearningStore } from "@/lib/store/learning-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  ArrowRight,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Star,
  FolderTree,
  FileText,
  Check,
} from "lucide-react";
import { getStatusColor, getPriorityColor } from "@/lib/utils";

interface HierarchicalTopicTreeProps {
  technologyId: string;
  accentColor?: string;
}

interface TreeNodeItemProps {
  topic: Topic;
  level: number;
  onAddSubtopic: (parentId: string, parentName: string) => void;
  accentColor?: string;
}

function TreeNodeItem({ topic, level, onAddSubtopic, accentColor }: TreeNodeItemProps) {
  const { updateTopicProgress, updateTopic, deleteTopic, toggleFavoriteTopic, isOwner, requireOwner } = useLearningStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [editDesc, setEditDesc] = useState(topic.description);
  const [editStatus, setEditStatus] = useState<TopicStatus>(topic.status);
  const [editPriority, setEditPriority] = useState<TopicPriority>(topic.priority);

  const hasChildren = topic.subtopics && topic.subtopics.length > 0;
  const statusColor = getStatusColor(topic.status);
  const priorityColor = getPriorityColor(topic.priority);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTopic(topic.id, {
      name: editName,
      description: editDesc,
      status: editStatus,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all group shadow-sm"
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Left Tree Connector + Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/topics/${topic.id}`}
                className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
              >
                {topic.name}
              </Link>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
              >
                {topic.status}
              </span>

              {/* Priority Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}
              >
                {topic.priority}
              </span>

              {topic.is_favorite && (
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              )}
            </div>

            {topic.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {topic.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Completed Status & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Completed Checkbox / Status Badge */}
          {isOwner ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const isCompleted = topic.status === "Completed" || topic.progress === 100;
                if (isCompleted) {
                  updateTopic(topic.id, {
                    status: "Not Started",
                    progress: 0,
                    completed_at: null,
                  });
                } else {
                  updateTopic(topic.id, {
                    status: "Completed",
                    progress: 100,
                    completed_at: new Date().toISOString(),
                  });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                topic.status === "Completed" || topic.progress === 100
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-secondary/40"
              }`}
              title={topic.status === "Completed" ? "Click to mark as Incomplete" : "Click to mark as Completed"}
            >
              <div
                className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all ${
                  topic.status === "Completed" || topic.progress === 100
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                    : "border-muted-foreground/50 bg-background"
                }`}
              >
                {(topic.status === "Completed" || topic.progress === 100) && (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </div>
              <span className="text-[11px] font-semibold hidden sm:inline">
                {topic.status === "Completed" || topic.progress === 100 ? "Completed" : "Mark Done"}
              </span>
            </button>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold select-none ${
                topic.status === "Completed" || topic.progress === 100
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                  : "border-border/80 text-muted-foreground bg-secondary/40"
              }`}
            >
              <span>{topic.status === "Completed" || topic.progress === 100 ? "Completed ✓" : topic.status}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={() => onAddSubtopic(topic.id, topic.name)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                  title="Add subtopic here"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Edit topic"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete topic '${topic.name}' and all subtopics?`)) {
                      deleteTopic(topic.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                  title="Delete topic"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            <Link href={`/topics/${topic.id}`}>
              <Button size="icon-sm" variant="subtle" title="Open Learning Page">
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={`Edit ${topic.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Topic Name</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
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
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as any)}
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
            <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Render Recursive Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1 pt-1">
          {topic.subtopics!.map((sub) => (
            <TreeNodeItem
              key={sub.id}
              topic={sub}
              level={level + 1}
              onAddSubtopic={onAddSubtopic}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchicalTopicTree({ technologyId, accentColor }: HierarchicalTopicTreeProps) {
  const { getTopicTree, addTopic, isOwner, requireOwner } = useLearningStore();
  const tree = getTopicTree(technologyId);

  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [parentTopicInfo, setParentTopicInfo] = useState<{ id: string | null; name: string }>({
    id: null,
    name: "",
  });
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [newTopicPriority, setNewTopicPriority] = useState<TopicPriority>("Medium");

  const handleOpenAddSubtopic = (parentId: string, parentName: string) => {
    if (!requireOwner("add a subtopic")) return;
    setParentTopicInfo({ id: parentId, name: parentName });
    setNewTopicName("");
    setNewTopicDesc("");
    setNewTopicPriority("Medium");
    setIsAddSubModalOpen(true);
  };

  const handleOpenAddRoot = () => {
    if (!requireOwner("add a root topic")) return;
    setParentTopicInfo({ id: null, name: "Root Topic" });
    setNewTopicName("");
    setNewTopicDesc("");
    setNewTopicPriority("Medium");
    setIsAddSubModalOpen(true);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    addTopic({
      technology_id: technologyId,
      parent_topic_id: parentTopicInfo.id,
      name: newTopicName,
      description: newTopicDesc,
      priority: newTopicPriority,
      status: "Not Started",
    });

    setIsAddSubModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {tree.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-card border border-border/70">
          <div className="flex justify-center mb-2">
            <FolderTree className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h4 className="font-semibold text-foreground">No Topics in this Roadmap Yet</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Start decomposing this technology into foundational topics, modules, and subtopics.
          </p>
          {isOwner && (
            <Button onClick={handleOpenAddRoot} size="sm" className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" /> Add First Topic
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" /> Topic Hierarchy & Roadmap
            </h3>
            {isOwner && (
              <Button onClick={handleOpenAddRoot} size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Root Topic
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {tree.map((topic) => (
              <TreeNodeItem
                key={topic.id}
                topic={topic}
                level={0}
                onAddSubtopic={handleOpenAddSubtopic}
                accentColor={accentColor}
              />
            ))}
          </div>
        </>
      )}

      {/* Add Topic / Subtopic Modal */}
      <Modal
        isOpen={isAddSubModalOpen}
        onClose={() => setIsAddSubModalOpen(false)}
        title={
          parentTopicInfo.id
            ? `Add Subtopic under "${parentTopicInfo.name}"`
            : "Add Root Topic"
        }
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Topic Name</label>
            <Input
              placeholder="e.g. Memory Optimization, Custom Middleware, Indexing"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              required
            />
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
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
            <Textarea
              placeholder="What specific skills or concepts does this topic cover?"
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddSubModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Topic</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
