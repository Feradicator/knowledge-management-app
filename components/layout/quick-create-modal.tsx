"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLearningStore } from "@/lib/store/learning-store";
import { Cpu, ListTree, FileText, Network, History, Plus } from "lucide-react";

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "tech" | "topic" | "note" | "mindmap" | "session";
}

export function QuickCreateModal({ isOpen, onClose, defaultTab = "tech" }: QuickCreateModalProps) {
  const router = useRouter();
  const { technologies, topics, addTechnology, addTopic, addNote, addMindMap, addLearningSession } =
    useLearningStore();

  // Tech state
  const [techName, setTechName] = useState("");
  const [techDesc, setTechDesc] = useState("");
  const [techCategory, setTechCategory] = useState("Backend");
  const [techColor, setTechColor] = useState("#6366f1");

  // Topic state
  const [topicName, setTopicName] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [selectedTechId, setSelectedTechId] = useState(technologies[0]?.id || "");
  const [topicPriority, setTopicPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [topicStatus, setTopicStatus] = useState<"Not Started" | "Learning" | "Completed" | "Paused">("Not Started");

  // Note state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteTags, setNoteTags] = useState("");

  // Mind map state
  const [mindMapTitle, setMindMapTitle] = useState("");

  // Session state
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionDesc, setSessionDesc] = useState("");

  const handleCreateTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName.trim()) return;
    const tech = addTechnology({
      name: techName,
      description: techDesc,
      category: techCategory,
      color: techColor,
    });
    setTechName("");
    setTechDesc("");
    onClose();
    router.push(`/technologies/${tech.id}`);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !selectedTechId) return;
    const topic = addTopic({
      technology_id: selectedTechId,
      name: topicName,
      description: topicDesc,
      priority: topicPriority,
      status: topicStatus,
    });
    setTopicName("");
    setTopicDesc("");
    onClose();
    router.push(`/topics/${topic.id}`);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    const tags = noteTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const note = addNote({
      title: noteTitle,
      technology_id: selectedTechId || null,
      tags,
      content_html: `<h2>${noteTitle}</h2><p>Start writing your technical insights here...</p>`,
    });
    setNoteTitle("");
    setNoteTags("");
    onClose();
    router.push(`/notes/${note.id}`);
  };

  const handleCreateMindMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mindMapTitle.trim()) return;
    const map = addMindMap({
      title: mindMapTitle,
      technology_id: selectedTechId || null,
    });
    setMindMapTitle("");
    onClose();
    router.push(`/mind-maps/${map.id}`);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;
    addLearningSession({
      title: sessionTitle,
      duration_minutes: Number(sessionDuration),
      description: sessionDesc,
      technology_id: selectedTechId || null,
      date: new Date().toISOString().split("T")[0],
    });
    setSessionTitle("");
    setSessionDesc("");
    onClose();
    router.push(`/learning-history`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New" maxWidth="lg">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-4">
          <TabsTrigger value="tech" className="gap-1.5 text-xs">
            <Cpu className="h-3.5 w-3.5" /> Tech
          </TabsTrigger>
          <TabsTrigger value="topic" className="gap-1.5 text-xs">
            <ListTree className="h-3.5 w-3.5" /> Topic
          </TabsTrigger>
          <TabsTrigger value="note" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Note
          </TabsTrigger>
          <TabsTrigger value="mindmap" className="gap-1.5 text-xs">
            <Network className="h-3.5 w-3.5" /> Map
          </TabsTrigger>
          <TabsTrigger value="session" className="gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" /> Session
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Technology */}
        <TabsContent value="tech">
          <form onSubmit={handleCreateTech} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Technology Name</label>
              <Input
                placeholder="e.g. Kotlin, Kubernetes, Rust, GraphQL"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
                <select
                  value={techCategory}
                  onChange={(e) => setTechCategory(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Backend" className="bg-card">Backend</option>
                  <option value="Frontend" className="bg-card">Frontend</option>
                  <option value="DevOps" className="bg-card">DevOps</option>
                  <option value="Database" className="bg-card">Database</option>
                  <option value="AI & ML" className="bg-card">AI & ML</option>
                  <option value="General" className="bg-card">General</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Color Tag</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={techColor}
                    onChange={(e) => setTechColor(e.target.value)}
                    className="h-9 w-12 rounded border border-input cursor-pointer bg-transparent p-0.5"
                  />
                  <Input value={techColor} onChange={(e) => setTechColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
              <Textarea
                placeholder="Brief summary of why you're learning this technology..."
                value={techDesc}
                onChange={(e) => setTechDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="gap-1.5"><Plus className="h-4 w-4" /> Add Technology</Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 2: Topic */}
        <TabsContent value="topic">
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Technology</label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              >
                {technologies.map((t) => (
                  <option key={t.id} value={t.id} className="bg-card">
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Topic Name</label>
              <Input
                placeholder="e.g. Memory Leak Troubleshooting, Custom Interceptors"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Status</label>
                <select
                  value={topicStatus}
                  onChange={(e) => setTopicStatus(e.target.value as any)}
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
                  value={topicPriority}
                  onChange={(e) => setTopicPriority(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="High" className="bg-card">High</option>
                  <option value="Medium" className="bg-card">Medium</option>
                  <option value="Low" className="bg-card">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Description / Goals</label>
              <Textarea
                placeholder="What concepts will you master in this topic?"
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="gap-1.5"><Plus className="h-4 w-4" /> Add Topic</Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 3: Note */}
        <TabsContent value="note">
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Note Title</label>
              <Input
                placeholder="e.g. Distributed Tracing in Microservices"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Associated Technology (Optional)</label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="" className="bg-card">Standalone (No Technology)</option>
                {technologies.map((t) => (
                  <option key={t.id} value={t.id} className="bg-card">{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Tags (comma-separated)</label>
              <Input
                placeholder="e.g. architecture, security, notes"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="gap-1.5"><Plus className="h-4 w-4" /> Create & Open Note</Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 4: Mind Map */}
        <TabsContent value="mindmap">
          <form onSubmit={handleCreateMindMap} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Mind Map Title</label>
              <Input
                placeholder="e.g. Microservices Security Mind Map"
                value={mindMapTitle}
                onChange={(e) => setMindMapTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Associated Technology (Optional)</label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="" className="bg-card">Standalone</option>
                {technologies.map((t) => (
                  <option key={t.id} value={t.id} className="bg-card">{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="gap-1.5"><Plus className="h-4 w-4" /> Create Canvas</Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 5: Session */}
        <TabsContent value="session">
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Study Activity Title</label>
              <Input
                placeholder="e.g. Read Spring Security documentation & implemented JWT filter"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Technology</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="" className="bg-card">General</option>
                  {technologies.map((t) => (
                    <option key={t.id} value={t.id} className="bg-card">{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Duration (minutes)</label>
                <Input
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Key Takeaways / Notes</label>
              <Textarea
                placeholder="What did you learn during this session?"
                value={sessionDesc}
                onChange={(e) => setSessionDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="gap-1.5"><Plus className="h-4 w-4" /> Log Session</Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
