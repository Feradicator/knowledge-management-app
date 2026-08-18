export type TopicStatus = 'Not Started' | 'Learning' | 'Completed' | 'Paused';
export type TopicPriority = 'Low' | 'Medium' | 'High';
export type EntityType = 'technology' | 'topic' | 'note' | 'file' | 'mind_map' | 'session';
export type ActionType = 'created' | 'updated' | 'completed' | 'uploaded' | 'deleted';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  progress: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  topics_count?: number;
  completed_topics_count?: number;
}

export interface Topic {
  id: string;
  user_id: string;
  technology_id: string;
  parent_topic_id?: string | null;
  name: string;
  slug: string;
  description: string;
  status: TopicStatus;
  progress: number;
  priority: TopicPriority;
  sort_order: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  last_studied_at?: string | null;
  completed_at?: string | null;
  subtopics?: Topic[];
  technology_name?: string;
  technology_color?: string;
  checklist_total?: number;
  checklist_completed?: number;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  topic_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  technology_id?: string | null;
  topic_id?: string | null;
  title: string;
  content_html: string;
  content_json?: any;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  technology_name?: string;
  topic_name?: string;
}

export interface FileItem {
  id: string;
  user_id: string;
  technology_id?: string | null;
  topic_id?: string | null;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url?: string;
  is_handwritten: boolean;
  created_at: string;
  updated_at: string;
  technology_name?: string;
  topic_name?: string;
}

export interface MindMapNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    color?: string;
    bgColor?: string;
    isRoot?: boolean;
    status?: TopicStatus;
    icon?: string;
  };
  style?: Record<string, any>;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface MindMap {
  id: string;
  user_id: string;
  technology_id?: string | null;
  topic_id?: string | null;
  title: string;
  description?: string;
  nodes_json: MindMapNode[];
  edges_json: MindMapEdge[];
  viewport_json?: { x: number; y: number; zoom: number };
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  technology_name?: string;
  topic_name?: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  technology_id?: string | null;
  topic_id?: string | null;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  title: string;
  description?: string;
  created_at: string;
  technology_name?: string;
  topic_name?: string;
}

export interface ActivityLogItem {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  action_type: ActionType;
  title: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  totalTechnologies: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  totalNotes: number;
  totalLearningMinutes: number;
  totalMindMaps: number;
  totalFiles: number;
  streakDays: number;
}
