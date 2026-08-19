"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
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
} from "@/lib/seed-data";
import { slugify, generateUUID } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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

  // Auth & Access Control
  currentUser: any | null;
  isOwner: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMessage: string;
  setAuthModalMessage: (msg: string) => void;
  requireOwner: (actionName?: string) => boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string; success?: string }>;

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

  // Auth & Permissions State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>("");

  const supabase = useMemo(() => createClient(), []);

  // Sync Supabase Auth State
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user);
          setIsOwner(true);
        } else {
          const localOwner = typeof window !== "undefined" ? localStorage.getItem("knowledgeos_is_owner") === "true" : false;
          setIsOwner(localOwner);
          if (localOwner) {
            setCurrentUser({ email: "owner@knowledgeos.vault", user_metadata: { full_name: "Vault Owner" } });
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
          setIsOwner(true);
        } else {
          const localOwner = typeof window !== "undefined" ? localStorage.getItem("knowledgeos_is_owner") === "true" : false;
          setIsOwner(localOwner);
          if (localOwner) {
            setCurrentUser({ email: "owner@knowledgeos.vault", user_metadata: { full_name: "Vault Owner" } });
          } else {
            setCurrentUser(null);
          }
        }
      });

      return () => subscription.unsubscribe();
    } else {
      const localOwner = typeof window !== "undefined" ? localStorage.getItem("knowledgeos_is_owner") === "true" : false;
      setIsOwner(localOwner);
      if (localOwner) {
        setCurrentUser({ email: "owner@knowledgeos.vault", user_metadata: { full_name: "Vault Owner" } });
      }
    }
  }, [supabase]);

  const requireOwner = useCallback((actionName?: string): boolean => {
    if (isOwner) return true;
    setAuthModalMessage(actionName ? `Owner sign-in required to ${actionName}.` : "Owner authentication required.");
    setIsAuthModalOpen(true);
    return false;
  }, [isOwner]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message };
      }
      setCurrentUser(data.user);
      setIsOwner(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("knowledgeos_is_owner", "true");
      }
      setIsAuthModalOpen(false);
      return {};
    } else {
      if (password.length >= 4) {
        setIsOwner(true);
        setCurrentUser({ email, user_metadata: { full_name: email.split("@")[0] } });
        if (typeof window !== "undefined") {
          localStorage.setItem("knowledgeos_is_owner", "true");
        }
        setIsAuthModalOpen(false);
        return {};
      }
      return { error: "Password must be at least 4 characters." };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error?: string; success?: string }> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        return { error: error.message };
      }
      if (data.session) {
        setCurrentUser(data.user);
        setIsOwner(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("knowledgeos_is_owner", "true");
        }
        setIsAuthModalOpen(false);
        return { success: "Account created and logged in as Owner!" };
      }
      return { success: "Account created! You can now sign in." };
    } else {
      setIsOwner(true);
      setCurrentUser({ email, user_metadata: { full_name: fullName || email.split("@")[0] } });
      if (typeof window !== "undefined") {
        localStorage.setItem("knowledgeos_is_owner", "true");
      }
      setIsAuthModalOpen(false);
      return { success: "Owner credentials created and activated!" };
    }
  };

  const signOut = async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setIsOwner(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("knowledgeos_is_owner");
    }
  };

  // Safe helper to run Supabase calls in background without Postgrest typing issues
  const runSupabase = useCallback((operation: (client: NonNullable<typeof supabase>) => Promise<any>) => {
    if (!supabase) return;
    operation(supabase).catch((err: unknown) => {
      console.warn("Supabase background operation note:", err);
    });
  }, [supabase]);

  // Initialize data: When Supabase is configured, fetch live database rows.
  useEffect(() => {
    async function loadData() {
      if (supabase) {
        try {
          const [
            techRes,
            topicsRes,
            checklistRes,
            notesRes,
            filesRes,
            mindMapsRes,
            sessionsRes,
            activityRes,
          ] = await Promise.all([
            supabase.from("technologies").select("*").order("created_at", { ascending: false }),
            supabase.from("topics").select("*").order("sort_order", { ascending: true }),
            supabase.from("checklist_items").select("*").order("sort_order", { ascending: true }),
            supabase.from("notes").select("*").order("updated_at", { ascending: false }),
            supabase.from("files").select("*").order("created_at", { ascending: false }),
            supabase.from("mind_maps").select("*").order("updated_at", { ascending: false }),
            supabase.from("learning_sessions").select("*").order("created_at", { ascending: false }),
            supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(50),
          ]);

          // If Supabase query succeeded without error, use Supabase rows
          if (!techRes.error && techRes.data) {
            const dbTech = techRes.data || [];
            const dbTopics = topicsRes.data || [];
            const dbChecklist = checklistRes.data || [];
            const dbNotes = notesRes.data || [];
            const dbFiles = filesRes.data || [];
            const dbMindMaps = mindMapsRes.data || [];
            const dbSessions = sessionsRes.data || [];
            const dbActivity = activityRes.data || [];

            setTechnologies(dbTech);
            setTopics(dbTopics);
            setChecklistItems(dbChecklist);
            setNotes(dbNotes);
            setFiles(dbFiles);
            setMindMaps(dbMindMaps);
            setLearningSessions(dbSessions);
            setActivityLogs(dbActivity);

            saveAll(dbTech, dbTopics, dbChecklist, dbNotes, dbFiles, dbMindMaps, dbSessions, dbActivity);
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.warn("Supabase fetch error, falling back to local storage", err);
        }
      }

      // Local storage fallback
      try {
        const storedTech = localStorage.getItem(STORAGE_KEYS.TECHNOLOGIES);
        const storedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);
        const storedChecklist = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
        const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
        const storedFiles = localStorage.getItem(STORAGE_KEYS.FILES);
        const storedMindMaps = localStorage.getItem(STORAGE_KEYS.MIND_MAPS);
        const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        const storedActivity = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);

        if (storedTech !== null) {
          setTechnologies(JSON.parse(storedTech));
          setTopics(storedTopics ? JSON.parse(storedTopics) : []);
          setChecklistItems(storedChecklist ? JSON.parse(storedChecklist) : []);
          setNotes(storedNotes ? JSON.parse(storedNotes) : []);
          setFiles(storedFiles ? JSON.parse(storedFiles) : []);
          setMindMaps(storedMindMaps ? JSON.parse(storedMindMaps) : []);
          setLearningSessions(storedSessions ? JSON.parse(storedSessions) : []);
          setActivityLogs(storedActivity ? JSON.parse(storedActivity) : []);
        } else {
          // Clean initial empty state
          setTechnologies([]);
          setTopics([]);
          setChecklistItems([]);
          setNotes([]);
          setFiles([]);
          setMindMaps([]);
          setLearningSessions([]);
          setActivityLogs([]);
          saveAll([], [], [], [], [], [], [], []);
        }
      } catch (e) {
        console.error("Error loading data from localStorage", e);
        setTechnologies([]);
        setTopics([]);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, [supabase]);

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
      id: generateUUID(),
      user_id: "",
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

    runSupabase(async (client) => {
      await client.from("activity_log").insert({
        id: newLog.id,
        entity_type: newLog.entity_type,
        entity_id: newLog.entity_id,
        action_type: newLog.action_type,
        title: newLog.title,
        metadata: newLog.metadata,
        created_at: newLog.created_at,
      });
    });
  };

  // Automatically recalculate technology progress based on its topics
  const recalculateTechnologyProgress = (techId: string, currentTopics: Topic[]) => {
    const techTopics = currentTopics.filter((t) => t.technology_id === techId);
    const avgProgress =
      techTopics.length > 0
        ? Math.round(techTopics.reduce((acc, curr) => acc + (curr.progress || 0), 0) / techTopics.length)
        : 0;

    setTechnologies((prev) => {
      const updated = prev.map((t) => (t.id === techId ? { ...t, progress: avgProgress, updated_at: new Date().toISOString() } : t));
      localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updated));
      return updated;
    });

    runSupabase(async (client) => {
      await client.from("technologies").update({ progress: avgProgress, updated_at: new Date().toISOString() }).eq("id", techId);
    });
  };

  // --------------------------------------------------------------------------
  // Technology Actions
  // --------------------------------------------------------------------------
  const addTechnology = (data: Partial<Technology>): Technology => {
    const name = data.name || "New Technology";
    const newTech: Technology = {
      id: generateUUID(),
      user_id: "",
      name,
      slug: slugify(name),
      description: data.description || "",
      icon: data.icon || "Code2",
      category: data.category || "General",
      color: data.color || "#6366f1",
      progress: 0,
      is_favorite: Boolean(data.is_favorite),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newTech, ...technologies];
    setTechnologies(updated);
    localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updated));
    logActivity("technology", newTech.id, "created", `Created technology "${newTech.name}"`);

    runSupabase(async (client) => {
      await client.from("technologies").insert({
        id: newTech.id,
        name: newTech.name,
        slug: newTech.slug,
        description: newTech.description,
        icon: newTech.icon,
        category: newTech.category,
        color: newTech.color,
        progress: newTech.progress,
        is_favorite: newTech.is_favorite,
        created_at: newTech.created_at,
        updated_at: newTech.updated_at,
      });
    });

    return newTech;
  };

  const updateTechnology = (id: string, data: Partial<Technology>) => {
    setTechnologies((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t));
      localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updated));
      return updated;
    });

    runSupabase(async (client) => {
      await client.from("technologies").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
    });
  };

  const deleteTechnology = (id: string) => {
    const techToDelete = technologies.find((t) => t.id === id);
    const updatedTech = technologies.filter((t) => t.id !== id);
    const updatedTopics = topics.filter((top) => top.technology_id !== id);
    const updatedNotes = notes.filter((n) => n.technology_id !== id);
    const updatedMindMaps = mindMaps.filter((m) => m.technology_id !== id);
    const updatedSessions = learningSessions.filter((s) => s.technology_id !== id);

    setTechnologies(updatedTech);
    setTopics(updatedTopics);
    setNotes(updatedNotes);
    setMindMaps(updatedMindMaps);
    setLearningSessions(updatedSessions);

    localStorage.setItem(STORAGE_KEYS.TECHNOLOGIES, JSON.stringify(updatedTech));
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updatedTopics));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updatedMindMaps));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));

    if (techToDelete) {
      logActivity("technology", id, "deleted", `Deleted technology "${techToDelete.name}"`);
    }

    runSupabase(async (client) => {
      await client.from("technologies").delete().eq("id", id);
    });
  };

  const toggleFavoriteTechnology = (id: string) => {
    const item = technologies.find((t) => t.id === id);
    if (!item) return;
    updateTechnology(id, { is_favorite: !item.is_favorite });
  };

  // --------------------------------------------------------------------------
  // Topic Actions
  // --------------------------------------------------------------------------
  const addTopic = (data: Partial<Topic>): Topic => {
    const name = data.name || "New Topic";
    const newTopic: Topic = {
      id: generateUUID(),
      user_id: "",
      technology_id: data.technology_id!,
      parent_topic_id: data.parent_topic_id || undefined,
      name,
      slug: slugify(name),
      description: data.description || "",
      status: (data.status as TopicStatus) || "Not Started",
      progress: data.progress || 0,
      priority: (data.priority as TopicPriority) || "Medium",
      sort_order: data.sort_order || topics.length,
      is_favorite: Boolean(data.is_favorite),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...topics, newTopic];
    setTopics(updated);
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updated));
    recalculateTechnologyProgress(newTopic.technology_id, updated);
    logActivity("topic", newTopic.id, "created", `Created topic "${newTopic.name}"`);

    runSupabase(async (client) => {
      await client.from("topics").insert({
        id: newTopic.id,
        technology_id: newTopic.technology_id,
        parent_topic_id: newTopic.parent_topic_id || null,
        name: newTopic.name,
        slug: newTopic.slug,
        description: newTopic.description,
        status: newTopic.status,
        progress: newTopic.progress,
        priority: newTopic.priority,
        sort_order: newTopic.sort_order,
        is_favorite: newTopic.is_favorite,
        created_at: newTopic.created_at,
        updated_at: newTopic.updated_at,
      });
    });

    return newTopic;
  };

  const updateTopic = (id: string, data: Partial<Topic>) => {
    let techIdToUpdate: string | undefined;

    setTopics((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          techIdToUpdate = t.technology_id;
          const next = { ...t, ...data, updated_at: new Date().toISOString() };
          if (data.progress === 100 && t.progress !== 100) {
            next.status = "Completed";
            next.completed_at = new Date().toISOString();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            logActivity("topic", id, "completed", `Mastered topic "${t.name}"! 🎉`);
          }
          return next;
        }
        return t;
      });

      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updated));
      if (techIdToUpdate) {
        recalculateTechnologyProgress(techIdToUpdate, updated);
      }
      return updated;
    });

    runSupabase(async (client) => {
      await client.from("topics").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
    });
  };

  const updateTopicProgress = (id: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, progress));
    const nextStatus: TopicStatus = clamped === 100 ? "Completed" : clamped > 0 ? "Learning" : "Not Started";
    updateTopic(id, { progress: clamped, status: nextStatus });
  };

  const deleteTopic = (id: string) => {
    const topicToDelete = topics.find((t) => t.id === id);
    const techId = topicToDelete?.technology_id;
    const updatedTopics = topics.filter((t) => t.id !== id && t.parent_topic_id !== id);

    setTopics(updatedTopics);
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updatedTopics));
    if (techId) recalculateTechnologyProgress(techId, updatedTopics);

    if (topicToDelete) {
      logActivity("topic", id, "deleted", `Deleted topic "${topicToDelete.name}"`);
    }

    runSupabase(async (client) => {
      await client.from("topics").delete().eq("id", id);
    });
  };

  const toggleFavoriteTopic = (id: string) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    updateTopic(id, { is_favorite: !topic.is_favorite });
  };

  const getTopicTree = (technologyId: string): Topic[] => {
    const techTopics = topics.filter((t) => t.technology_id === technologyId);
    const buildTree = (parentId?: string): Topic[] => {
      return techTopics
        .filter((t) => (parentId ? t.parent_topic_id === parentId : !t.parent_topic_id))
        .map((t) => ({
          ...t,
          subtopics: buildTree(t.id),
        }));
    };
    return buildTree(undefined);
  };

  const getTopicById = (id: string) => topics.find((t) => t.id === id);
  const getTechnologyById = (id: string) => technologies.find((t) => t.id === id);

  // --------------------------------------------------------------------------
  // Checklist Actions
  // --------------------------------------------------------------------------
  const addChecklistItem = (topicId: string, title: string): ChecklistItem => {
    const newItem: ChecklistItem = {
      id: generateUUID(),
      user_id: "",
      topic_id: topicId,
      title,
      is_completed: false,
      sort_order: checklistItems.filter((c) => c.topic_id === topicId).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...checklistItems, newItem];
    setChecklistItems(updated);
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));

    runSupabase(async (client) => {
      await client.from("checklist_items").insert({
        id: newItem.id,
        topic_id: newItem.topic_id,
        title: newItem.title,
        is_completed: newItem.is_completed,
        sort_order: newItem.sort_order,
        created_at: newItem.created_at,
        updated_at: newItem.updated_at,
      });
    });

    return newItem;
  };

  const toggleChecklistItem = (id: string) => {
    let targetTopicId: string | undefined;

    setChecklistItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          targetTopicId = item.topic_id;
          return { ...item, is_completed: !item.is_completed, updated_at: new Date().toISOString() };
        }
        return item;
      });

      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));

      if (targetTopicId) {
        const topicItems = updated.filter((i) => i.topic_id === targetTopicId);
        if (topicItems.length > 0) {
          const completed = topicItems.filter((i) => i.is_completed).length;
          const pct = Math.round((completed / topicItems.length) * 100);
          updateTopicProgress(targetTopicId, pct);
        }
      }

      return updated;
    });

    const curr = checklistItems.find((c) => c.id === id);
    if (curr) {
      runSupabase(async (client) => {
        await client.from("checklist_items").update({ is_completed: !curr.is_completed, updated_at: new Date().toISOString() }).eq("id", id);
      });
    }
  };

  const deleteChecklistItem = (id: string) => {
    const updated = checklistItems.filter((c) => c.id !== id);
    setChecklistItems(updated);
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));

    runSupabase(async (client) => {
      await client.from("checklist_items").delete().eq("id", id);
    });
  };

  const getTopicChecklist = (topicId: string) => {
    return checklistItems.filter((c) => c.topic_id === topicId).sort((a, b) => a.sort_order - b.sort_order);
  };

  // --------------------------------------------------------------------------
  // Notes Actions
  // --------------------------------------------------------------------------
  const addNote = (data: Partial<Note>): Note => {
    const newNote: Note = {
      id: generateUUID(),
      user_id: "",
      technology_id: data.technology_id,
      topic_id: data.topic_id,
      title: data.title || "Untitled Note",
      content_html: data.content_html || "<p></p>",
      content_json: data.content_json || {},
      tags: data.tags || [],
      is_favorite: Boolean(data.is_favorite),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
    logActivity("note", newNote.id, "created", `Created note "${newNote.title}"`);

    runSupabase(async (client) => {
      await client.from("notes").insert({
        id: newNote.id,
        technology_id: newNote.technology_id || null,
        topic_id: newNote.topic_id || null,
        title: newNote.title,
        content_html: newNote.content_html,
        content_json: newNote.content_json,
        tags: newNote.tags,
        is_favorite: newNote.is_favorite,
        created_at: newNote.created_at,
        updated_at: newNote.updated_at,
      });
    });

    return newNote;
  };

  const updateNote = (id: string, data: Partial<Note>) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...data, updated_at: new Date().toISOString() } : n));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
      return updated;
    });

    runSupabase(async (client) => {
      await client.from("notes").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
    });
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));

    if (noteToDelete) {
      logActivity("note", id, "deleted", `Deleted note "${noteToDelete.title}"`);
    }

    runSupabase(async (client) => {
      await client.from("notes").delete().eq("id", id);
    });
  };

  const toggleFavoriteNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    updateNote(id, { is_favorite: !note.is_favorite });
  };

  const getNoteById = (id: string) => notes.find((n) => n.id === id);

  // --------------------------------------------------------------------------
  // Files Actions
  // --------------------------------------------------------------------------
  const addFile = (data: Partial<FileItem>): FileItem => {
    const newFile: FileItem = {
      id: generateUUID(),
      user_id: "",
      technology_id: data.technology_id,
      topic_id: data.topic_id,
      filename: data.filename || "Uploaded File",
      file_type: data.file_type || "image",
      storage_path: data.storage_path || "",
      file_size: data.file_size || 0,
      public_url: data.public_url || "",
      is_handwritten: Boolean(data.is_handwritten),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newFile, ...files];
    setFiles(updated);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updated));
    logActivity("file", newFile.id, "created", `Uploaded document "${newFile.filename}"`);

    runSupabase(async (client) => {
      await client.from("files").insert({
        id: newFile.id,
        technology_id: newFile.technology_id || null,
        topic_id: newFile.topic_id || null,
        name: newFile.filename,
        file_type: newFile.file_type,
        storage_path: newFile.storage_path,
        file_size: newFile.file_size,
        thumbnail_url: newFile.public_url,
        created_at: newFile.created_at,
        updated_at: newFile.updated_at,
      });
    });

    return newFile;
  };

  const updateFile = (id: string, data: Partial<FileItem>) => {
    setFiles((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, ...data, updated_at: new Date().toISOString() } : f));
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updated));
      return updated;
    });

    runSupabase(async (client) => {
      await client.from("files").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
    });
  };

  const deleteFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updated));

    runSupabase(async (client) => {
      await client.from("files").delete().eq("id", id);
    });
  };

  // --------------------------------------------------------------------------
  // Mind Maps Actions
  // --------------------------------------------------------------------------
  const addMindMap = (data: Partial<MindMap>): MindMap => {
    const newMap: MindMap = {
      id: generateUUID(),
      user_id: "",
      technology_id: data.technology_id,
      topic_id: data.topic_id,
      title: data.title || "Untitled Mind Map",
      description: data.description || "",
      nodes_json: data.nodes_json || [],
      edges_json: data.edges_json || [],
      viewport_json: data.viewport_json,
      is_favorite: Boolean(data.is_favorite),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newMap, ...mindMaps];
    setMindMaps(updated);
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updated));
    logActivity("mind_map", newMap.id, "created", `Created mind map "${newMap.title}"`);

    runSupabase(async (client) => {
      await client.from("mind_maps").insert({
        id: newMap.id,
        technology_id: newMap.technology_id || null,
        topic_id: newMap.topic_id || null,
        title: newMap.title,
        description: newMap.description,
        nodes_json: newMap.nodes_json,
        edges_json: newMap.edges_json,
        is_favorite: newMap.is_favorite,
        created_at: newMap.created_at,
        updated_at: newMap.updated_at,
      });
    });

    return newMap;
  };

  const updateMindMap = (id: string, data: Partial<MindMap>) => {
    setMindMaps((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...data, updated_at: new Date().toISOString() } : m));
      localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updated));
      return updated;
    });

    runSupabase(async (client) => {
      await client.from("mind_maps").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
    });
  };

  const deleteMindMap = (id: string) => {
    const mapToDelete = mindMaps.find((m) => m.id === id);
    const updated = mindMaps.filter((m) => m.id !== id);
    setMindMaps(updated);
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(updated));

    if (mapToDelete) {
      logActivity("mind_map", id, "deleted", `Deleted mind map "${mapToDelete.title}"`);
    }

    runSupabase(async (client) => {
      await client.from("mind_maps").delete().eq("id", id);
    });
  };

  const toggleFavoriteMindMap = (id: string) => {
    const map = mindMaps.find((m) => m.id === id);
    if (!map) return;
    updateMindMap(id, { is_favorite: !map.is_favorite });
  };

  const getMindMapById = (id: string) => mindMaps.find((m) => m.id === id);

  const createMindMapFromTechnology = (techId: string): MindMap => {
    const tech = technologies.find((t) => t.id === techId);
    const techTopics = topics.filter((t) => t.technology_id === techId);
    const rootTopics = techTopics.filter((t) => !t.parent_topic_id);

    const rootNode = {
      id: "root",
      type: "custom",
      data: {
        label: tech ? tech.name : "Technology Roadmap",
        description: tech?.description || "Interactive Architecture & Knowledge Tree",
        status: "Learning" as TopicStatus,
        color: tech?.color || "#6366f1",
        isRoot: true,
        level: 0,
        hasChildren: rootTopics.length > 0,
        childCount: rootTopics.length,
        isExpanded: true,
        parentId: null,
      },
      position: { x: 80, y: Math.max(250, (rootTopics.length * 140) / 2) },
    };

    const childNodes: any[] = [];
    const edges: any[] = [];

    let runningY = 80;

    rootTopics.forEach((topic) => {
      const subtopics = techTopics.filter((t) => t.parent_topic_id === topic.id);
      const nodeId = `node-${topic.id}`;
      const topicY = runningY;

      childNodes.push({
        id: nodeId,
        type: "custom",
        data: {
          label: topic.name,
          description: topic.description || "",
          status: topic.status,
          priority: topic.priority,
          color: topic.status === "Completed" ? "#10b981" : "#6366f1",
          level: 1,
          hasChildren: subtopics.length > 0,
          childCount: subtopics.length,
          isExpanded: true,
          parentId: "root",
        },
        position: { x: 450, y: topicY },
      });

      edges.push({
        id: `edge-root-${nodeId}`,
        source: "root",
        target: nodeId,
        animated: topic.status === "Learning",
        style: { stroke: "#6366f1", strokeWidth: 2 },
      });

      // Place subtopics branching out from this root topic
      if (subtopics.length > 0) {
        subtopics.forEach((sub, subIdx) => {
          const subNodeId = `node-${sub.id}`;
          const subY = topicY + (subIdx - (subtopics.length - 1) / 2) * 95;

          childNodes.push({
            id: subNodeId,
            type: "custom",
            data: {
              label: sub.name,
              description: sub.description || "",
              status: sub.status,
              priority: sub.priority,
              color: sub.status === "Completed" ? "#10b981" : "#38bdf8",
              level: 2,
              hasChildren: false,
              childCount: 0,
              isExpanded: false,
              parentId: nodeId,
            },
            position: { x: 820, y: subY },
          });

          edges.push({
            id: `edge-${nodeId}-${subNodeId}`,
            source: nodeId,
            target: subNodeId,
            animated: sub.status === "Learning",
            style: { stroke: "#38bdf8", strokeWidth: 1.5 },
          });
        });

        runningY += Math.max(140, subtopics.length * 100);
      } else {
        runningY += 130;
      }
    });

    return addMindMap({
      technology_id: techId,
      title: `${tech?.name || "Technology"} Architecture Mind Map`,
      description: `Hierarchical concept roadmap for ${tech?.name}`,
      nodes_json: [rootNode, ...childNodes],
      edges_json: edges,
    });
  };

  const createMindMapFromTopic = (topicId: string): MindMap => {
    const topic = topics.find((t) => t.id === topicId);
    const checklist = checklistItems.filter((c) => c.topic_id === topicId);

    const rootNode = {
      id: "root",
      type: "custom",
      data: {
        label: topic?.name || "Topic Deep Dive",
        description: topic?.description || "Milestones & Core Concepts",
        status: topic?.status || "Learning",
        color: "#6366f1",
      },
      position: { x: 300, y: 150 },
    };

    const childNodes: any[] = [];
    const edges: any[] = [];

    checklist.forEach((item, idx) => {
      const y = 50 + idx * 90;
      const nodeId = `chk-${item.id}`;

      childNodes.push({
        id: nodeId,
        type: "custom",
        data: {
          label: item.title,
          description: item.is_completed ? "Completed Milestone" : "Pending Action",
          status: (item.is_completed ? "Completed" : "Learning") as TopicStatus,
          color: item.is_completed ? "#10b981" : "#f59e0b",
        },
        position: { x: 600, y },
      });

      edges.push({
        id: `edge-${nodeId}`,
        source: "root",
        target: nodeId,
        style: { stroke: item.is_completed ? "#10b981" : "#94a3b8" },
      });
    });

    return addMindMap({
      topic_id: topicId,
      technology_id: topic?.technology_id,
      title: `${topic?.name || "Topic"} Concept Map`,
      description: `Concept and checklist architecture for ${topic?.name}`,
      nodes_json: [rootNode, ...childNodes],
      edges_json: edges,
    });
  };

  // --------------------------------------------------------------------------
  // Learning Sessions Actions
  // --------------------------------------------------------------------------
  const addLearningSession = (data: Partial<LearningSession>): LearningSession => {
    const tech = technologies.find((t) => t.id === data.technology_id);
    const newSession: LearningSession = {
      id: generateUUID(),
      user_id: "",
      technology_id: data.technology_id || null,
      topic_id: data.topic_id || null,
      date: data.date || new Date().toISOString().split("T")[0],
      duration_minutes: data.duration_minutes || 30,
      title: data.title || (tech ? `${tech.name} Study Session` : "Study Session"),
      description: data.description || "",
      created_at: new Date().toISOString(),
      technology_name: tech?.name,
    };

    const updated = [newSession, ...learningSessions];
    setLearningSessions(updated);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));

    logActivity("session", newSession.id, "created", `Logged ${newSession.duration_minutes}m study on ${newSession.title}`);

    runSupabase(async (client) => {
      await client.from("learning_sessions").insert({
        id: newSession.id,
        technology_id: newSession.technology_id,
        topic_id: newSession.topic_id,
        session_date: newSession.date,
        duration_minutes: newSession.duration_minutes,
        notes: newSession.description,
        created_at: newSession.created_at,
      });
    });

    return newSession;
  };

  const deleteLearningSession = (id: string) => {
    const updated = learningSessions.filter((s) => s.id !== id);
    setLearningSessions(updated);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));

    runSupabase(async (client) => {
      await client.from("learning_sessions").delete().eq("id", id);
    });
  };

  // --------------------------------------------------------------------------
  // Search & Global Helpers
  // --------------------------------------------------------------------------
  const searchAll = (query: string): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: SearchResult[] = [];

    technologies
      .filter((t) => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .forEach((t) => {
        results.push({
          id: t.id,
          type: "technology",
          title: t.name,
          subtitle: `${t.category} • ${t.progress}% mastery`,
          url: `/technologies/${t.id}`,
          color: t.color,
        });
      });

    topics
      .filter((top) => top.name.toLowerCase().includes(q) || top.description?.toLowerCase().includes(q))
      .forEach((top) => {
        const parentTech = technologies.find((t) => t.id === top.technology_id);
        results.push({
          id: top.id,
          type: "topic",
          title: top.name,
          subtitle: `${parentTech?.name || "Topic"} • ${top.status}`,
          url: `/topics/${top.id}`,
          color: parentTech?.color,
        });
      });

    notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.tags.some((tag) => tag.toLowerCase().includes(q)))
      .forEach((n) => {
        results.push({
          id: n.id,
          type: "note",
          title: n.title,
          subtitle: `Tags: ${n.tags.join(", ") || "none"}`,
          url: `/notes/${n.id}`,
        });
      });

    mindMaps
      .filter((m) => m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q))
      .forEach((m) => {
        results.push({
          id: m.id,
          type: "mind_map",
          title: m.title,
          subtitle: "Interactive Mind Map",
          url: `/mind-maps/${m.id}`,
        });
      });

    return results;
  };

  const resetToSampleData = async () => {
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

    if (supabase) {
      try {
        await supabase.from("technologies").upsert(INITIAL_TECHNOLOGIES);
        await supabase.from("topics").upsert(INITIAL_TOPICS);
        await supabase.from("checklist_items").upsert(INITIAL_CHECKLIST_ITEMS);
        await supabase.from("notes").upsert(INITIAL_NOTES);
        await supabase.from("mind_maps").upsert(INITIAL_MIND_MAPS);
      } catch (err) {
        console.error("Error seeding sample data to Supabase:", err);
      }
    }
  };

  const clearAllData = async () => {
    setTechnologies([]);
    setTopics([]);
    setChecklistItems([]);
    setNotes([]);
    setFiles([]);
    setMindMaps([]);
    setLearningSessions([]);
    setActivityLogs([]);

    saveAll([], [], [], [], [], [], [], []);

    if (supabase) {
      try {
        await supabase.from("activity_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("learning_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("mind_maps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("files").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("checklist_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("topics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("technologies").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch (err) {
        console.error("Error clearing Supabase data:", err);
      }
    }
  };

  const exportDataBackup = (): string => {
    const backup = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      data: {
        technologies,
        topics,
        checklistItems,
        notes,
        files,
        mindMaps,
        learningSessions,
        activityLogs,
      },
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataBackup = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) return false;

      const d = parsed.data;
      setTechnologies(d.technologies || []);
      setTopics(d.topics || []);
      setChecklistItems(d.checklistItems || []);
      setNotes(d.notes || []);
      setFiles(d.files || []);
      setMindMaps(d.mindMaps || []);
      setLearningSessions(d.learningSessions || []);
      setActivityLogs(d.activityLogs || []);

      saveAll(
        d.technologies || [],
        d.topics || [],
        d.checklistItems || [],
        d.notes || [],
        d.files || [],
        d.mindMaps || [],
        d.learningSessions || [],
        d.activityLogs || []
      );
      return true;
    } catch {
      return false;
    }
  };

  // Compute aggregated stats
  const stats: DashboardStats = useMemo(() => {
    const totalTech = technologies.length;
    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.status === "Completed" || t.progress === 100).length;
    const inProgressTopics = topics.filter((t) => t.status === "Learning" && (t.progress || 0) < 100).length;
    const totalNotes = notes.length;
    const totalMindMaps = mindMaps.length;
    const totalFiles = files.length;
    const totalMinutes = learningSessions.reduce((acc, curr) => acc + curr.duration_minutes, 0);

    return {
      totalTechnologies: totalTech,
      totalTopics,
      completedTopics,
      inProgressTopics,
      totalNotes,
      totalMindMaps,
      totalFiles,
      totalLearningMinutes: totalMinutes,
      streakDays: 7,
    };
  }, [technologies, topics, notes, mindMaps, files, learningSessions]);

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
        currentUser,
        isOwner,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMessage,
        setAuthModalMessage,
        requireOwner,
        signIn,
        signOut,
        signUp,
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
