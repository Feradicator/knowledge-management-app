-- ==============================================================================
-- PERSONAL LEARNING & KNOWLEDGE MANAGEMENT WEB APPLICATION SCHEMA
-- PostgreSQL + Supabase Database Schema with Row-Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. Technologies Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Code2',
    category TEXT DEFAULT 'General',
    color TEXT DEFAULT '#6366f1',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_technologies_user_id ON public.technologies(user_id);
CREATE INDEX IF NOT EXISTS idx_technologies_slug ON public.technologies(slug);

-- ------------------------------------------------------------------------------
-- 3. Topics Table (Supports Recursive Nesting)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE CASCADE NOT NULL,
    parent_topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Learning', 'Completed', 'Paused')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    sort_order INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_studied_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_topics_user_id ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_technology_id ON public.topics(technology_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_topic_id ON public.topics(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_status ON public.topics(status);

-- ------------------------------------------------------------------------------
-- 4. Topic Checklist Items
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_topic_id ON public.checklist_items(topic_id);

-- ------------------------------------------------------------------------------
-- 5. Notes Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_html TEXT DEFAULT '',
    content_json JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_technology_id ON public.notes(technology_id);
CREATE INDEX IF NOT EXISTS idx_notes_topic_id ON public.notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN (tags);

-- ------------------------------------------------------------------------------
-- 6. Files & Attachments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    is_handwritten BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_topic_id ON public.files(topic_id);
CREATE INDEX IF NOT EXISTS idx_files_is_handwritten ON public.files(is_handwritten);

-- ------------------------------------------------------------------------------
-- 7. Mind Maps Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mind_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    nodes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    viewport_json JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mind_maps_user_id ON public.mind_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_maps_technology_id ON public.mind_maps(technology_id);
CREATE INDEX IF NOT EXISTS idx_mind_maps_topic_id ON public.mind_maps(topic_id);

-- ------------------------------------------------------------------------------
-- 8. Learning Sessions Table (Learning History & Analytics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_date ON public.learning_sessions(date);

-- ------------------------------------------------------------------------------
-- 9. Activity Log Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('technology', 'topic', 'note', 'file', 'mind_map', 'session')),
    entity_id UUID NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'completed', 'uploaded', 'deleted')),
    title TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Technologies Policies
CREATE POLICY "Users can view own technologies" ON public.technologies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own technologies" ON public.technologies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own technologies" ON public.technologies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own technologies" ON public.technologies FOR DELETE USING (auth.uid() = user_id);

-- Topics Policies
CREATE POLICY "Users can view own topics" ON public.topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own topics" ON public.topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own topics" ON public.topics FOR DELETE USING (auth.uid() = user_id);

-- Checklist Items Policies
CREATE POLICY "Users can view own checklist_items" ON public.checklist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist_items" ON public.checklist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist_items" ON public.checklist_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist_items" ON public.checklist_items FOR DELETE USING (auth.uid() = user_id);

-- Notes Policies
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Files Policies
CREATE POLICY "Users can view own files" ON public.files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON public.files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own files" ON public.files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON public.files FOR DELETE USING (auth.uid() = user_id);

-- Mind Maps Policies
CREATE POLICY "Users can view own mind_maps" ON public.mind_maps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mind_maps" ON public.mind_maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mind_maps" ON public.mind_maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mind_maps" ON public.mind_maps FOR DELETE USING (auth.uid() = user_id);

-- Learning Sessions Policies
CREATE POLICY "Users can view own learning_sessions" ON public.learning_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning_sessions" ON public.learning_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning_sessions" ON public.learning_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own learning_sessions" ON public.learning_sessions FOR DELETE USING (auth.uid() = user_id);

-- Activity Log Policies
CREATE POLICY "Users can view own activity_log" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity_log" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC TRIGGERS: Technology Progress Recalculation
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_technology_progress()
RETURNS TRIGGER AS $$
DECLARE
    target_tech_id UUID;
    total_count INTEGER;
    completed_count INTEGER;
    calculated_progress INTEGER;
BEGIN
    target_tech_id := COALESCE(NEW.technology_id, OLD.technology_id);
    
    -- Count total topics for technology
    SELECT COUNT(*) INTO total_count
    FROM public.topics
    WHERE technology_id = target_tech_id;
    
    -- Count completed topics (or calculate average progress)
    IF total_count > 0 THEN
        SELECT ROUND(AVG(progress)) INTO calculated_progress
        FROM public.topics
        WHERE technology_id = target_tech_id;
        
        UPDATE public.technologies
        SET progress = COALESCE(calculated_progress, 0),
            updated_at = NOW()
        WHERE id = target_tech_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_tech_progress
AFTER INSERT OR UPDATE OF progress, status OR DELETE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.recalculate_technology_progress();

-- ==============================================================================
-- SUPABASE STORAGE BUCKET SETUP
-- ==============================================================================
-- Run in Supabase SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('learning-files', 'learning-files', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
-- FOR INSERT TO authenticated WITH CHECK (bucket_id = 'learning-files' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "Allow user read" ON storage.objects
-- FOR SELECT TO authenticated USING (bucket_id = 'learning-files' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "Allow user delete" ON storage.objects
-- FOR DELETE TO authenticated USING (bucket_id = 'learning-files' AND (storage.foldername(name))[1] = auth.uid()::text);
