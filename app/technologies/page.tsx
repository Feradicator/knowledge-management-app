"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { IconRenderer } from "@/components/ui/icon-renderer";
import {
  Cpu,
  Plus,
  Search,
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  ListTree,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
} from "lucide-react";
import { Technology } from "@/types/database";

export default function TechnologiesPage() {
  const {
    technologies,
    topics,
    addTechnology,
    updateTechnology,
    deleteTechnology,
    toggleFavoriteTechnology,
  } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);

  // Form fields
  const [techName, setTechName] = useState("");
  const [techDesc, setTechDesc] = useState("");
  const [techCategory, setTechCategory] = useState("Backend");
  const [techColor, setTechColor] = useState("#6366f1");
  const [techIcon, setTechIcon] = useState("Code2");

  const categories = ["All", "Backend", "Frontend", "DevOps", "Database", "AI & ML", "General"];

  const filteredTechnologies = technologies.filter((tech) => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || tech.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingTech(null);
    setTechName("");
    setTechDesc("");
    setTechCategory("Backend");
    setTechColor("#6366f1");
    setTechIcon("Code2");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (tech: Technology, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingTech(tech);
    setTechName(tech.name);
    setTechDesc(tech.description);
    setTechCategory(tech.category);
    setTechColor(tech.color);
    setTechIcon(tech.icon);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Are you sure you want to delete '${name}' and all its topics?`)) {
      deleteTechnology(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName.trim()) return;

    if (editingTech) {
      updateTechnology(editingTech.id, {
        name: techName,
        description: techDesc,
        category: techCategory,
        color: techColor,
        icon: techIcon,
      });
    } else {
      addTechnology({
        name: techName,
        description: techDesc,
        category: techCategory,
        color: techColor,
        icon: techIcon,
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="h-7 w-7 text-primary" /> My Technologies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize tech stacks, track overall progress, and create structured topic roadmaps.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm shadow-primary/25">
          <Plus className="h-4 w-4" /> Add Technology
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Technologies Grid */}
      {filteredTechnologies.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-3">
            <Cpu className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">No Technologies Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {searchQuery || selectedCategory !== "All"
              ? "No technologies match your search filters."
              : "Start building your technical learning roadmap by adding your first technology!"}
          </p>
          <Button onClick={handleOpenAdd} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Add Technology
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTechnologies.map((tech) => {
            const techTopics = topics.filter((t) => t.technology_id === tech.id);
            const completedTopics = techTopics.filter((t) => t.status === "Completed" || t.progress === 100).length;

            return (
              <Card
                key={tech.id}
                hoverEffect
                className="flex flex-col justify-between overflow-hidden relative group border-t-4"
                style={{ borderTopColor: tech.color || "#6366f1" }}
              >
                <div className="p-5">
                  {/* Top Bar: Icon, Name, Category, Favorite, Menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold shadow-md"
                        style={{ backgroundColor: tech.color || "#6366f1" }}
                      >
                        <IconRenderer name={tech.icon} className="h-6 w-6" />
                      </div>
                      <div>
                        <Link
                          href={`/technologies/${tech.id}`}
                          className="font-bold text-lg text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          {tech.name}
                        </Link>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {tech.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavoriteTechnology(tech.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-secondary transition-colors"
                        title={tech.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            tech.is_favorite ? "fill-amber-400 text-amber-400" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => handleOpenEdit(tech, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="Edit technology"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(tech.id, tech.name, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                        title="Delete technology"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-3 mb-4">
                    {tech.description || "Track concepts and hierarchical topic roadmaps."}
                  </p>

                  {/* Topic Count Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <ListTree className="h-3.5 w-3.5 text-primary" /> {techTopics.length} Topics
                    </span>
                    <span>
                      {completedTopics} Completed ({tech.progress}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <Progress value={tech.progress} indicatorColor={tech.color} size="default" />
                </div>

                {/* Footer Action Link */}
                <Link
                  href={`/technologies/${tech.id}`}
                  className="flex items-center justify-between px-5 py-3 bg-secondary/40 border-t border-border/50 text-xs font-semibold text-primary hover:bg-secondary/70 transition-colors"
                >
                  <span>Explore Roadmaps & Topics</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Technology Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingTech ? `Edit ${editingTech.name}` : "Add New Technology"}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Technology Name
            </label>
            <Input
              placeholder="e.g. Java, Docker, React, Python"
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
                <Input
                  value={techColor}
                  onChange={(e) => setTechColor(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Icon (Lucide name)
            </label>
            <select
              value={techIcon}
              onChange={(e) => setTechIcon(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="Code2" className="bg-card">Code2 (General Code)</option>
              <option value="Coffee" className="bg-card">Coffee (Java / JVM)</option>
              <option value="Leaf" className="bg-card">Leaf (Spring / Eco)</option>
              <option value="Container" className="bg-card">Container (Docker / Containers)</option>
              <option value="Database" className="bg-card">Database (Postgres / SQL)</option>
              <option value="Cpu" className="bg-card">Cpu (AI / Hardware)</option>
              <option value="Layers" className="bg-card">Layers (Architecture)</option>
              <option value="Terminal" className="bg-card">Terminal (CLI / Shell)</option>
              <option value="Sparkles" className="bg-card">Sparkles (LLMs)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
            <Textarea
              placeholder="Provide a brief overview of this technology..."
              value={techDesc}
              onChange={(e) => setTechDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTech ? "Save Changes" : "Create Technology"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
