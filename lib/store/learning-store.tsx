"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  Technology,
  Topic,
  ChecklistItem,
  Note,
  FileItem,
  MindMap,
  LearningSession,
  ActivityLogItem,
  DashboardStats,
  TopicStatus,
  TopicPriority,
} from "@/types/database";
import {
  INITIAL_TECHNOLOGIES,
  INITIAL_TOPICS,
  INITIAL_CHECKLIST_ITEMS,
  INITIAL_NOTES,
  INITIAL_FILES,
  INITIAL_MIND_MAPS,
  INITIAL_LEARNING_SESSIONS,
  INITIAL_ACTIVITY_LOG,
  SAMPLE_USER_ID,
} from "@/lib/seed-data";
import { slugify } from "@/lib/utils";
import confetti from "canvas-confetti";

const STORAGE_KEYS = {
  TECHNOLOGIES: "kma_technologies",
  TOPICS: "kma_topics",
  CHECKLIST: "kma_checklist",
  NOTES: "kma_notes",
  FILES: "kma_files",
  MIND_MAPS: "kma_mind_maps",
  SESSIONS: "kma_sessions",
  ACTIVITY_LOG: "kma_activity_log",
};

interface SearchResult {
  id: string;
  type: "technology" | "topic" | "note" | "mind_map" | "file";
  title: string;
  subtitle: string;
  url: string;
  color?: string;
}

interface LearningStoreContextType {
  isLoaded: boolean;
  technologies: Technology[];
  topics: Topic[];
  checklistItems: ChecklistItem[];
  notes: Note[];
  files: FileItem[];
  mindMaps: MindMap[];
  learningSessions: LearningSession[];
  activityLogs: ActivityLogItem[];
  stats: DashboardStats;

  // Technology Actions
  addTechnology: (data: Partial<Technology>) => Technology;
  updateTechnology: (id: string, data: Partial<Technology>) => void;
  deleteTechnology: (id: string) => void;
  toggleFavoriteTechnology: (id: string) => void;

  // Topic Actions
  addTopic: (data: Partial<Topic>) => Topic;
  updateTopic: (id: string, data: Partial<Topic>) => void;
  updateTopicProgress: (id: string, progress: number) => void;
  deleteTopic: (id: string) => void;
  toggleFavoriteTopic: (id: string) => void;
  getTopicTree: (technologyId: string) => Topic[];
  getTopicById: (id: string) => Topic | undefined;
  getTechnologyById: (id: string) => Technology | undefined;

  // Checklist Actions
  addChecklistItem: (topicId: string, title: string) => ChecklistItem;
  toggleChecklistItem: (id: string) => void;
  deleteChecklistItem: (id: string) => void;
  getTopicChecklist: (topicId: string) => ChecklistItem[];

  // Notes Actions
  addNote: (data: Partial<Note>) => Note;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;

  // Files Actions
  addFile: (data: Partial<FileItem>) => FileItem;
  updateFile: (id: string, data: Partial<FileItem>) => void;
  deleteFile: (id: string) => void;

  // Mind Maps Actions
  addMindMap: (data: Partial<MindMap>) => MindMap;
  updateMindMap: (id: string, data: Partial<MindMap>) => void;
  deleteMindMap: (id: string) => void;
  toggleFavoriteMindMap: (id: string) => void;
  getMindMapById: (id: string) => MindMap | undefined;
  createMindMapFromTechnology: (techId: string) => MindMap;
  createMindMapFromTopic: (topicId: string) => MindMap;

  // Learning Sessions Actions
  addLearningSession: (data: Partial<LearningSession>) => LearningSession;
  deleteLearningSession: (id: string) => void;

  // Global Helpers
  searchAll: (query: string) => SearchResult[];
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportDataBackup: () => string;
  importDataBackup: (jsonStr: string) => boolean;
}

const LearningStoreContext = createContext<LearningStoreContextType | null>(null);

export function LearningStoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // Load initial data from localStorage or fallback to rich seed dataset
  useEffect(() => {
    try {
      const storedTech = localStorage.getItem(STORAGE_KEYS.TECHNOLOGIES);
      const storedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);
      const storedChecklist = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
      const storedFiles = localStorage.getItem(STORAGE_KEYS.FILES);
      const storedMindMaps = localStorage.getItem(STORAGE_KEYS.MIND_MAPS);
      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const storedActivity = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);

      if (storedTech) {
        setTechnologies(JSON.parse(storedTech));
        setTopics(storedTopics ? JSON.parse(storedTopics) : INITIAL_TOPICS);
        setChecklistItems(storedChecklist ? JSON.parse(storedChecklist) : INITIAL_CHECKLIST_ITEMS);
        setNotes(storedNotes ? JSON.parse(storedNotes) : INITIAL_NOTES);
        setFiles(storedFiles ? JSON.parse(storedFiles) : INITIAL_FILES);
        setMindMaps(storedMindMaps ? JSON.parse(storedMindMaps) : INITIAL_MIND_MAPS);
        setLearningSessions(storedSessions ? JSON.parse(storedSessions) : INITIAL_LEARNING_SESSIONS);
        setActivityLogs(storedActivity ? JSON.parse(storedActivity) : INITIAL_ACTIVITY_LOG);
      } else {
        // Initialize with default rich seed data
        setTechnologies(INITIAL_TECHNOLOGIES);
        setTopics(INITIAL_TOPICS);
        setChecklistItems(INITIAL_CHECKLIST_ITEMS);
        setNotes(INITIAL_NOTES);
        setFiles(INITIAL_FILES);
        setMindMaps(INITIAL_MIND_MAPS);
        setLearningSessions(INITIAL_LEARNING_SESSIONS);
        setActivityLogs(INITIAL_ACTIVITY_LOG);
        saveAll(
          INITIAL_TECHNOLOGIES,
          INITIAL_TOPICS,
          INITIAL_CHECKLIST_ITEMS,
          INITIAL_NOTES,
          INITIAL_FILES,
          INITIAL_MIND_MAPS,
          INITIAL_LEARNING_SESSIONS,
          INITIAL_ACTIVITY_LOG
        );
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      setTechnologies(INITIAL_TECHNOLOGIES);
      setTopics(INITIAL_TOPICS);
      setChecklistItems(INITIAL_CHECKLIST_ITEMS);
      setNotes(INITIAL_NOTES);
      setFiles(INITIAL_FILES);
      setMindMaps(INITIAL_MIND_MAPS);
      setLearningSessions(INITIAL_LEARNING_SESSIONS);
      setActivityLogs(INITIAL_ACTIVITY_LOG);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveAll = (
    tech: Technology[],
    top: Topic[],
    chk: ChecklistItem[],
    not: Note[],
    fil: FileItem[],
    mm: MindMap[],
    sess: LearningSession[],
    act: ActivityLogItem[]
  ) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(tech));
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(top));
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(chk));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(not));
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(fil));
      localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(mm));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sess));
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(act));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  // Helper to log activity
  const logActivity = (entityType: any, entityId: string, actionType: any, title: string, metadata = {}) => {
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: SAMPLE_USER_ID,
      entity_type: entityType,
      entity_id: entityId,
      action_type: actionType,
      title,
      metadata,
      created_at: new Date().toISOString(),
    };
    const updated = [newLog, ...activityLogs.slice(0, 49)];
    setActivityLogs(updated);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(updated));
  };

  // Automatically recalculate technology progress based on its topics
  const recalculateTechnologyProgress = (techId: string, currentTopics: Topic[]) => {
    const techTopics = currentTopics.filter((t) => t.technology_id === techId);
    if (techTopics.length === 0) return;
    const avgProgress = Math.round(
      techTopics.reduce((acc, curr) => acc + (curr.progress || 0), 0) / techTopics.length
    );

    setTechnologies((prev) => {
      const updated = prev.map((t) => (t.id === techId ? { ...t, progress: avgProgress, updated_at: new Date().toISOString() } : t));
      localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updated));
      return updated;
    });
  };

  // --------------------------------------------------------------------------
  // Technology Actions
  // --------------------------------------------------------------------------
  const addTechnology = (data: Partial<Technology>): Technology => {
    const name = data.name || "New Technology";
    const newTech: Technology = {
      id: `tech-${Date.now()}`,
      user_id: SAMPLE_USER_ID,
      name,
      slug: slugify(name),
      description: data.description || "",
      icon: data.icon || "Code2",
      category: data.category || "General",
      color: data.color || "#6366f1",
      progress: data.progress || 0,
      is_favorite: data.is_favorite || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newTech, ...technologies];
    setTechnologies(updated);
    localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updated));
    logActivity("technology", newTech.id, "created", `Added new technology '${newTech.name}'`);
    return newTech;
  };

  const updateTechnology = (id: string, data: Partial<Technology>) => {
    const updated = technologies.map((t) =>
      t.id === id ? { ...t, ...data, slug: data.name ? slugify(data.name) : t.slug, updated_at: new Date().toISOString() } : t
    );
    setTechnologies(updated);
    localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updated));
    const target = updated.find((t) => t.id === id);
    if (target) logActivity("technology", id, "updated", `Updated technology '${target.name}'`);
  };

  const deleteTechnology = (id: string) => {
    const target = technologies.find((t) => t.id === id);
    const updatedTech = technologies.filter((t) => t.id !== id);
    const updatedTopics = topics.filter((t) => t.technology_id !== id);
    setTechnologies(updatedTech);
    setTopics(updatedTopics);
    localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updatedTech));
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updatedTopics));
    if (target) logActivity("technology", id, "deleted", `Deleted technology '${target.name}'`);
  };

  const toggleFavoriteTechnology = (id: string) => {
    const updated = technologies.map((t) => (t.id === id ? { ...t, is_favorite: !t.is_favorite } : t));
    setTechnologies(updated);
    localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updated));
  };

  // --------------------------------------------------------------------------
  // Topic Actions
  // --------------------------------------------------------------------------
  const addTopic = (data: Partial<Topic>): Topic => {
    const name = data.name || "New Topic";
    const status: TopicStatus = data.status || "Not Started";
    const progress = status === "Completed" ? 100 : data.progress || 0;

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      user_id: SAMPLE_USER_ID,
      technology_id: data.technology_id || technologies[0]?.id || "",
      parent_topic_id: data.parent_topic_id || null,
      name,
      slug: slugify(name),
      description: data.description || "",
      status,
      progress,
      priority: data.priority || "Medium",
      sort_order: (topics.filter((t) => t.technology_id === data.technology_id).length || 0) + 1,
      is_favorite: data.is_favorite || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_studied_at: status === "Learning" ? new Date().toISOString() : null,
      completed_at: status === "Completed" ? new Date().toISOString() : null,
    };

    const updated = [...topics, newTopic];
    setTopics(updated);
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updated));
    recalculateTechnologyProgress(newTopic.technology_id, updated);
    logActivity("topic", newTopic.id, "created", `Added topic '${newTopic.name}'`);
    return newTopic;
  };

  const updateTopic = (id: string, data: Partial<Topic>) => {
    let completedTrigger = false;
    const updated = topics.map((t) => {
      if (t.id !== id) return t;

      let newStatus = data.status || t.status;
      let newProgress = data.progress !== undefined ? data.progress : t.progress;

      if (newProgress === 100 && t.progress < 100) {
        newStatus = "Completed";
        completedTrigger = true;
      } else if (newProgress < 100 && newStatus === "Completed" && data.progress !== undefined) {
        newStatus = "Learning";
      }

      if (data.status === "Completed" && t.status !== "Completed") {
        newProgress = 100;
        completedTrigger = true;
      }

      return {
        ...t,
        ...data,
        status: newStatus,
        progress: newProgress,
        slug: data.name ? slugify(data.name) : t.slug,
        completed_at: newStatus === "Completed" ? t.completed_at || new Date().toISOString() : null,
        last_studied_at: newStatus === "Learning" ? new Date().toISOString() : t.last_studied_at,
        updated_at: new Date().toISOString(),
      };
    });

    setTopics(updated);
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updated));

    const target = updated.find((t) => t.id === id);
    if (target) {
      recalculateTechnologyProgress(target.technology_id, updated);
      if (completedTrigger) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        logActivity("topic", id, "completed", `Completed topic '${target.name}'! 🎉`);
      } else {
        logActivity("topic", id, "updated", `Updated topic '${target.name}'`);
      }
    }
  };

  const updateTopicProgress = (id: string, progress: number) => {
    updateTopic(id, { progress });
  };

  const deleteTopic = (id: string) => {
    const target = topics.find((t) => t.id === id);
    const techId = target?.technology_id;

    // Delete topic and any child subtopics recursively
    const childIds = new Set<string>();
    const findChildren = (parentId: string) => {
      childIds.add(parentId);
      topics.filter((t) => t.parent_topic_id === parentId).forEach((t) => findChildren(t.id));
    };
    findChildren(id);

    const updatedTopics = topics.filter((t) => !childIds.has(t.id));
    const updatedChecklists = checklistItems.filter((c) => !childIds.has(c.topic_id));
    setTopics(updatedTopics);
    setChecklistItems(updatedChecklists);
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updatedTopics));
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updatedChecklists));

    if (techId) recalculateTechnologyProgress(techId, updatedTopics);
    if (target) logActivity("topic", id, "deleted", `Deleted topic '${target.name}'`);
  };

  const toggleFavoriteTopic = (id: string) => {
    const updated = topics.map((t) => (t.id === id ? { ...t, is_favorite: !t.is_favorite } : t));
    setTopics(updated);
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updated));
  };

  const getTopicTree = (technologyId: string): Topic[] => {
    const techTopics = topics.filter((t) => t.technology_id === technologyId);

    const buildTree = (parentId: string | null): Topic[] => {
      return techTopics
        .filter((t) => t.parent_topic_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((topic) => ({
          ...topic,
          subtopics: buildTree(topic.id),
        }));
    };

    return buildTree(null);
  };

  const getTopicById = (id: string) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return undefined;
    const tech = technologies.find((t) => t.id === topic.technology_id);
    const topicChecklist = checklistItems.filter((c) => c.topic_id === topic.id);
    return {
      ...topic,
      technology_name: tech?.name,
      technology_color: tech?.color,
      checklist_total: topicChecklist.length,
      checklist_completed: topicChecklist.filter((c) => c.is_completed).length,
    };
  };

  const getTechnologyById = (id: string) => {
    return technologies.find((t) => t.id === id || t.slug === id);
  };

  // --------------------------------------------------------------------------
  // Checklist Actions
  // --------------------------------------------------------------------------
  const addChecklistItem = (topicId: string, title: string): ChecklistItem => {
    const currentItems = checklistItems.filter((c) => c.topic_id === topicId);
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      user_id: SAMPLE_USER_ID,
      topic_id: topicId,
      title,
      is_completed: false,
      sort_order: currentItems.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...checklistItems, newItem];
    setChecklistItems(updated);
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));
    return newItem;
  };

  const toggleChecklistItem = (id: string) => {
    const targetItem = checklistItems.find((c) => c.id === id);
    if (!targetItem) return;

    const updated = checklistItems.map((c) => (c.id === id ? { ...c, is_completed: !c.is_completed, updated_at: new Date().toISOString() } : c));
    setChecklistItems(updated);
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));

    // Optionally update topic progress automatically based on checklist completion ratio
    const topicItems = updated.filter((c) => c.topic_id === targetItem.topic_id);
    if (topicItems.length > 0) {
      const completedRatio = Math.round((topicItems.filter((c) => c.is_completed).length / topicItems.length) * 100);
      updateTopic(targetItem.topic_id, { progress: completedRatio });
    }
  };

  const deleteChecklistItem = (id: string) => {
    const updated = checklistItems.filter((c) => c.id !== id);
    setChecklistItems(updated);
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));
  };

  const getTopicChecklist = (topicId: string) => {
    return checklistItems.filter((c) => c.topic_id === topicId).sort((a, b) => a.sort_order - b.sort_order);
  };

  // --------------------------------------------------------------------------
  // Notes Actions
  // --------------------------------------------------------------------------
  const addNote = (data: Partial<Note>): Note => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      user_id: SAMPLE_USER_ID,
      technology_id: data.technology_id || null,
      topic_id: data.topic_id || null,
      title: data.title || "Untitled Note",
      content_html: data.content_html || "",
      content_json: data.content_json || {},
      tags: data.tags || [],
      is_favorite: data.is_favorite || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
    logActivity("note", newNote.id, "created", `Created note '${newNote.title}'`);
    return newNote;
  };

  const updateNote = (id: string, data: Partial<Note>) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, ...data, updated_at: new Date().toISOString() } : n));
    setNotes(updated);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
  };

  const deleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
    if (target) logActivity("note", id, "deleted", `Deleted note '${target.title}'`);
  };

  const toggleFavoriteNote = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, is_favorite: !n.is_favorite } : n));
    setNotes(updated);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
  };

  const getNoteById = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return undefined;
    const tech = technologies.find((t) => t.id === note.technology_id);
    const topic = topics.find((t) => t.id === note.topic_id);
    return {
      ...note,
      technology_name: tech?.name,
      topic_name: topic?.name,
    };
  };

  // --------------------------------------------------------------------------
  // Files Actions
  // --------------------------------------------------------------------------
  const addFile = (data: Partial<FileItem>): FileItem => {
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      user_id: SAMPLE_USER_ID,
      technology_id: data.technology_id || null,
      topic_id: data.topic_id || null,
      filename: data.filename || "file.dat",
      file_type: data.file_type || "application/octet-stream",
      file_size: data.file_size || 1024,
      storage_path: data.storage_path || `uploads/${data.filename}`,
      public_url: data.public_url,
      is_handwritten: data.is_handwritten || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newFile, ...files];
    setFiles(updated);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updated));
    logActivity("file", newFile.id, "uploaded", `Uploaded ${newFile.is_handwritten ? "handwritten note" : "file"} '${newFile.filename}'`);
    return newFile;
  };

  const updateFile = (id: string, data: Partial<FileItem>) => {
    const updated = files.map((f) => (f.id === id ? { ...f, ...data, updated_at: new Date().toISOString() } : f));
    setFiles(updated);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updated));
  };

  const deleteFile = (id: string) => {
    const target = files.find((f) => f.id === id);
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updated));
    if (target) logActivity("file", id, "deleted", `Deleted file '${target.filename}'`);
  };

  // --------------------------------------------------------------------------
  // Mind Maps Actions
  // --------------------------------------------------------------------------
  const addMindMap = (data: Partial<MindMap>): MindMap => {
    const newMap: MindMap = {
      id: `map-${Date.now()}`,
      user_id: SAMPLE_USER_ID,
      technology_id: data.technology_id || null,
      topic_id: data.topic_id || null,
      title: data.title || "Untitled Mind Map",
      description: data.description || "",
      nodes_json: data.nodes_json || [
        {
          id: "node-root",
          type: "custom",
          position: { x: 300, y: 150 },
          data: { label: data.title || "Central Idea", isRoot: true, color: "#6366f1" },
        },
      ],
      edges_json: data.edges_json || [],
      viewport_json: data.viewport_json || { x: 0, y: 0, zoom: 1 },
      is_favorite: data.is_favorite || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newMap, ...mindMaps];
    setMindMaps(updated);
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updated));
    logActivity("mind_map", newMap.id, "created", `Created mind map '${newMap.title}'`);
    return newMap;
  };

  const updateMindMap = (id: string, data: Partial<MindMap>) => {
    const updated = mindMaps.map((m) => (m.id === id ? { ...m, ...data, updated_at: new Date().toISOString() } : m));
    setMindMaps(updated);
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updated));
  };

  const deleteMindMap = (id: string) => {
    const target = mindMaps.find((m) => m.id === id);
    const updated = mindMaps.filter((m) => m.id !== id);
    setMindMaps(updated);
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updated));
    if (target) logActivity("mind_map", id, "deleted", `Deleted mind map '${target.title}'`);
  };

  const toggleFavoriteMindMap = (id: string) => {
    const updated = mindMaps.map((m) => (m.id === id ? { ...m, is_favorite: !m.is_favorite } : m));
    setMindMaps(updated);
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updated));
  };

  const getMindMapById = (id: string) => {
    const map = mindMaps.find((m) => m.id === id);
    if (!map) return undefined;
    const tech = technologies.find((t) => t.id === map.technology_id);
    const topic = topics.find((t) => t.id === map.topic_id);
    return {
      ...map,
      technology_name: tech?.name,
      topic_name: topic?.name,
    };
  };

  const createMindMapFromTechnology = (techId: string): MindMap => {
    const tech = technologies.find((t) => t.id === techId);
    const techTopics = topics.filter((t) => t.technology_id === techId && !t.parent_topic_id);

    const rootNode = {
      id: "node-tech-root",
      type: "custom",
      position: { x: 350, y: 50 },
      data: { label: tech?.name || "Technology", isRoot: true, color: tech?.color || "#6366f1", description: tech?.description },
    };

    const childNodes = techTopics.map((top, idx) => ({
      id: `node-${top.id}`,
      type: "custom",
      position: { x: 100 + (idx % 3) * 250, y: 200 + Math.floor(idx / 3) * 120 },
      data: { label: top.name, color: tech?.color || "#6366f1", description: top.description, status: top.status },
    }));

    const edges = techTopics.map((top) => ({
      id: `e-root-${top.id}`,
      source: "node-tech-root",
      target: `node-${top.id}`,
      animated: true,
    }));

    return addMindMap({
      technology_id: techId,
      title: `${tech?.name || "Technology"} Overview Roadmap`,
      description: `Interactive mind map structure automatically generated from ${tech?.name} curriculum.`,
      nodes_json: [rootNode, ...childNodes],
      edges_json: edges,
    });
  };

  const createMindMapFromTopic = (topicId: string): MindMap => {
    const topic = topics.find((t) => t.id === topicId);
    const tech = technologies.find((t) => t.id === topic?.technology_id);
    const subtopics = topics.filter((t) => t.parent_topic_id === topicId);
    const chkItems = checklistItems.filter((c) => c.topic_id === topicId);

    const rootNode = {
      id: "node-topic-root",
      type: "custom",
      position: { x: 350, y: 50 },
      data: { label: topic?.name || "Topic", isRoot: true, color: tech?.color || "#6366f1", description: topic?.description },
    };

    const branchNodes = subtopics.length > 0
      ? subtopics.map((sub, idx) => ({
          id: `node-${sub.id}`,
          type: "custom",
          position: { x: 120 + idx * 240, y: 200 },
          data: { label: sub.name, color: tech?.color || "#6366f1", description: sub.description },
        }))
      : chkItems.slice(0, 5).map((chk, idx) => ({
          id: `node-chk-${chk.id}`,
          type: "custom",
          position: { x: 100 + (idx % 3) * 260, y: 200 + Math.floor(idx / 3) * 120 },
          data: { label: chk.title, color: tech?.color || "#6366f1", description: chk.is_completed ? "Completed" : "Pending" },
        }));

    const edges = branchNodes.map((b) => ({
      id: `e-${rootNode.id}-${b.id}`,
      source: rootNode.id,
      target: b.id,
      animated: true,
    }));

    return addMindMap({
      technology_id: topic?.technology_id,
      topic_id: topicId,
      title: `${topic?.name || "Topic"} Mind Map`,
      description: `Exploratory graph for ${topic?.name}.`,
      nodes_json: [rootNode, ...branchNodes],
      edges_json: edges,
    });
  };

  // --------------------------------------------------------------------------
  // Learning Sessions Actions
  // --------------------------------------------------------------------------
  const addLearningSession = (data: Partial<LearningSession>): LearningSession => {
    const newSession: LearningSession = {
      id: `sess-${Date.now()}`,
      user_id: SAMPLE_USER_ID,
      technology_id: data.technology_id || null,
      topic_id: data.topic_id || null,
      date: data.date || new Date().toISOString().split("T")[0],
      duration_minutes: data.duration_minutes || 30,
      title: data.title || "Study Session",
      description: data.description || "",
      created_at: new Date().toISOString(),
    };
    const updated = [newSession, ...learningSessions];
    setLearningSessions(updated);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));

    // If topic provided, update its last studied timestamp
    if (newSession.topic_id) {
      updateTopic(newSession.topic_id, { last_studied_at: new Date().toISOString() });
    }

    logActivity("session", newSession.id, "created", `Logged ${Math.floor(newSession.duration_minutes / 60)}h ${newSession.duration_minutes % 60}m study on '${newSession.title}'`);
    return newSession;
  };

  const deleteLearningSession = (id: string) => {
    const updated = learningSessions.filter((s) => s.id !== id);
    setLearningSessions(updated);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  };

  // --------------------------------------------------------------------------
  // Global Search
  // --------------------------------------------------------------------------
  const searchAll = (query: string): SearchResult[] => {
    if (!query || query.trim() === "") return [];
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    technologies.forEach((tech) => {
      if (tech.name.toLowerCase().includes(q) || tech.description.toLowerCase().includes(q)) {
        results.push({
          id: tech.id,
          type: "technology",
          title: tech.name,
          subtitle: `${tech.category} · ${tech.progress}% complete`,
          url: `/technologies/${tech.id}`,
          color: tech.color,
        });
      }
    });

    topics.forEach((topic) => {
      if (topic.name.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q)) {
        const tech = technologies.find((t) => t.id === topic.technology_id);
        results.push({
          id: topic.id,
          type: "topic",
          title: topic.name,
          subtitle: `${tech?.name || "Topic"} · Status: ${topic.status} (${topic.progress}%)`,
          url: `/topics/${topic.id}`,
          color: tech?.color,
        });
      }
    });

    notes.forEach((note) => {
      if (
        note.title.toLowerCase().includes(q) ||
        note.content_html.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        results.push({
          id: note.id,
          type: "note",
          title: note.title,
          subtitle: `Tags: ${note.tags.join(", ") || "none"}`,
          url: `/notes/${note.id}`,
        });
      }
    });

    mindMaps.forEach((map) => {
      if (map.title.toLowerCase().includes(q) || (map.description && map.description.toLowerCase().includes(q))) {
        results.push({
          id: map.id,
          type: "mind_map",
          title: map.title,
          subtitle: `${map.nodes_json.length} nodes · Mind Map`,
          url: `/mind-maps/${map.id}`,
        });
      }
    });

    return results.slice(0, 15);
  };

  // --------------------------------------------------------------------------
  // Seed & Reset Data
  // --------------------------------------------------------------------------
  const resetToSampleData = () => {
    setTechnologies(INITIAL_TECHNOLOGIES);
    setTopics(INITIAL_TOPICS);
    setChecklistItems(INITIAL_CHECKLIST_ITEMS);
    setNotes(INITIAL_NOTES);
    setFiles(INITIAL_FILES);
    setMindMaps(INITIAL_MIND_MAPS);
    setLearningSessions(INITIAL_LEARNING_SESSIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOG);
    saveAll(
      INITIAL_TECHNOLOGIES,
      INITIAL_TOPICS,
      INITIAL_CHECKLIST_ITEMS,
      INITIAL_NOTES,
      INITIAL_FILES,
      INITIAL_MIND_MAPS,
      INITIAL_LEARNING_SESSIONS,
      INITIAL_ACTIVITY_LOG
    );
  };

  const clearAllData = () => {
    setTechnologies([]);
    setTopics([]);
    setChecklistItems([]);
    setNotes([]);
    setFiles([]);
    setMindMaps([]);
    setLearningSessions([]);
    setActivityLogs([]);
    saveAll([], [], [], [], [], [], [], []);
  };

  const exportDataBackup = (): string => {
    const backup = {
      technologies,
      topics,
      checklistItems,
      notes,
      files,
      mindMaps,
      learningSessions,
      activityLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.technologies && Array.isArray(data.technologies)) {
        setTechnologies(data.technologies);
        setTopics(data.topics || []);
        setChecklistItems(data.checklistItems || []);
        setNotes(data.notes || []);
        setFiles(data.files || []);
        setMindMaps(data.mindMaps || []);
        setLearningSessions(data.learningSessions || []);
        setActivityLogs(data.activityLogs || []);
        saveAll(
          data.technologies,
          data.topics || [],
          data.checklistItems || [],
          data.notes || [],
          data.files || [],
          data.mindMaps || [],
          data.learningSessions || [],
          data.activityLogs || []
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // --------------------------------------------------------------------------
  // Computed Stats
  // --------------------------------------------------------------------------
  const stats: DashboardStats = useMemo(() => {
    const totalTechnologies = technologies.length;
    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.status === "Completed" || t.progress === 100).length;
    const inProgressTopics = topics.filter((t) => t.status === "Learning" && t.progress < 100).length;
    const totalNotes = notes.length;
    const totalLearningMinutes = learningSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    const totalMindMaps = mindMaps.length;
    const totalFiles = files.length;

    // Calculate streak days
    const sessionDates = new Set(learningSessions.map((s) => s.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (sessionDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }

    return {
      totalTechnologies,
      totalTopics,
      completedTopics,
      inProgressTopics,
      totalNotes,
      totalLearningMinutes,
      totalMindMaps,
      totalFiles,
      streakDays: streak,
    };
  }, [technologies, topics, notes, learningSessions, mindMaps, files]);

  return (
    <LearningStoreContext.Provider
      value={{
        isLoaded,
        technologies,
        topics,
        checklistItems,
        notes,
        files,
        mindMaps,
        learningSessions,
        activityLogs,
        stats,
        addTechnology,
        updateTechnology,
        deleteTechnology,
        toggleFavoriteTechnology,
        addTopic,
        updateTopic,
        updateTopicProgress,
        deleteTopic,
        toggleFavoriteTopic,
        getTopicTree,
        getTopicById,
        getTechnologyById,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        getTopicChecklist,
        addNote,
        updateNote,
        deleteNote,
        toggleFavoriteNote,
        getNoteById,
        addFile,
        updateFile,
        deleteFile,
        addMindMap,
        updateMindMap,
        deleteMindMap,
        toggleFavoriteMindMap,
        getMindMapById,
        createMindMapFromTechnology,
        createMindMapFromTopic,
        addLearningSession,
        deleteLearningSession,
        searchAll,
        resetToSampleData,
        clearAllData,
        exportDataBackup,
        importDataBackup,
      }}
    >
      {children}
    </LearningStoreContext.Provider>
  );
}

export function useLearningStore() {
  const context = useContext(LearningStoreContext);
  if (!context) {
    throw new Error("useLearningStore must be used within a LearningStoreProvider");
  }
  return context;
}
