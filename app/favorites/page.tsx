"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLearningStore } from "@/lib/store/learning-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Cpu,
  ListTree,
  FileText,
  Network,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { IconRenderer } from "@/components/ui/icon-renderer";
import { getStatusColor } from "@/lib/utils";

export default function FavoritesPage() {
  const {
    technologies,
    topics,
    notes,
    mindMaps,
    toggleFavoriteTechnology,
    toggleFavoriteTopic,
    toggleFavoriteNote,
    toggleFavoriteMindMap,
    isOwner,
  } = useLearningStore();

  const [activeTab, setActiveTab] = useState("all");

  const favTech = technologies.filter((t) => t.is_favorite);
  const favTopics = topics.filter((t) => t.is_favorite);
  const favNotes = notes.filter((n) => n.is_favorite);
  const favMindMaps = mindMaps.filter((m) => m.is_favorite);
  const totalFavs = favTech.length + favTopics.length + favNotes.length + favMindMaps.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Star className="h-7 w-7 text-amber-400 fill-amber-400" /> Starred & Favorite Items
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quickly access your most important technologies, priority topics, key notes, and architecture mind maps.
        </p>
      </div>

      {totalFavs === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-3">
            <Star className="h-10 w-10 text-muted-foreground opacity-40" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">No Favorites Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Click the star icon on any technology, topic, note, or mind map to pin it to your favorites.
          </p>
          <Link href="/technologies" className="mt-4 inline-block">
            <Button size="sm">Explore Technologies</Button>
          </Link>
        </Card>
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 max-w-2xl mb-6">
            <TabsTrigger value="all" badge={totalFavs} className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="tech" badge={favTech.length} className="text-xs">
              Tech
            </TabsTrigger>
            <TabsTrigger value="topics" badge={favTopics.length} className="text-xs">
              Topics
            </TabsTrigger>
            <TabsTrigger value="notes" badge={favNotes.length} className="text-xs">
              Notes
            </TabsTrigger>
            <TabsTrigger value="mindmaps" badge={favMindMaps.length} className="text-xs">
              Maps
            </TabsTrigger>
          </TabsList>

          {/* Section: Technologies */}
          {(activeTab === "all" || activeTab === "tech") && favTech.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" /> Starred Technologies ({favTech.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favTech.map((tech) => (
                  <Card key={tech.id} hoverEffect className="p-4 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold shadow-md"
                          style={{ backgroundColor: tech.color || "#6366f1" }}
                        >
                          <IconRenderer name={tech.icon} className="h-5 w-5" />
                        </div>
                        <div>
                          <Link href={`/technologies/${tech.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                            {tech.name}
                          </Link>
                          <Badge variant="secondary" className="text-[10px] mt-0.5">{tech.category}</Badge>
                        </div>
                      </div>
                      {isOwner ? (
                        <button onClick={() => toggleFavoriteTechnology(tech.id)} className="text-amber-400 p-1">
                          <Star className="h-4 w-4 fill-amber-400" />
                        </button>
                      ) : (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      )}
                    </div>

                    <div className="mt-4 pt-2 border-t border-border/40">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Mastery</span>
                        <span className="font-bold text-foreground">{tech.progress}%</span>
                      </div>
                      <Progress value={tech.progress} indicatorColor={tech.color} size="sm" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Section: Topics */}
          {(activeTab === "all" || activeTab === "topics") && favTopics.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ListTree className="h-4 w-4 text-blue-500" /> Starred Topics ({favTopics.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favTopics.map((topic) => {
                  const tech = technologies.find((t) => t.id === topic.technology_id);
                  const statusColor = getStatusColor(topic.status);

                  return (
                    <Card key={topic.id} hoverEffect className="p-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: tech?.color || "#6366f1" }}
                          >
                            {tech?.name || "Topic"}
                          </span>
                          {isOwner ? (
                            <button onClick={() => toggleFavoriteTopic(topic.id)} className="text-amber-400 p-1">
                              <Star className="h-4 w-4 fill-amber-400" />
                            </button>
                          ) : (
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          )}
                        </div>

                        <Link href={`/topics/${topic.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                          {topic.name}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2">{topic.description}</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                          {topic.status}
                        </span>
                        <Link href={`/topics/${topic.id}`} className="text-primary font-semibold hover:underline flex items-center gap-1">
                          Study <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Notes */}
          {(activeTab === "all" || activeTab === "notes") && favNotes.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" /> Starred Notes ({favNotes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favNotes.map((note) => (
                  <Card key={note.id} hoverEffect className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/notes/${note.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                          {note.title}
                        </Link>
                        {isOwner ? (
                          <button onClick={() => toggleFavoriteNote(note.id)} className="text-amber-400 p-1 shrink-0">
                            <Star className="h-4 w-4 fill-amber-400" />
                          </button>
                        ) : (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-border/40 text-right">
                      <Link href={`/notes/${note.id}`} className="text-primary font-semibold text-xs hover:underline flex items-center justify-end gap-1">
                        Open Note <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Section: Mind Maps */}
          {(activeTab === "all" || activeTab === "mindmaps") && favMindMaps.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-500" /> Starred Mind Maps ({favMindMaps.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favMindMaps.map((map) => (
                  <Card key={map.id} hoverEffect className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/mind-maps/${map.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                          {map.title}
                        </Link>
                        {isOwner ? (
                          <button onClick={() => toggleFavoriteMindMap(map.id)} className="text-amber-400 p-1 shrink-0">
                            <Star className="h-4 w-4 fill-amber-400" />
                          </button>
                        ) : (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{map.description}</p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                      <span>{map.nodes_json.length} Nodes</span>
                      <Link href={`/mind-maps/${map.id}`} className="text-primary font-semibold hover:underline flex items-center gap-1">
                        Canvas <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Tabs>
      )}
    </div>
  );
}
