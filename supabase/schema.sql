-- ==============================================================================
-- PERSONAL LEARNING & KNOWLEDGE MANAGEMENT WEB APPLICATION SCHEMA
-- PostgreSQL + Supabase Database Schema with Full Personal Vault & Multi-User Support
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Code2',
    category TEXT DEFAULT 'General',
    color TEXT DEFAULT '#6366f1',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_technologies_user_id ON public.technologies(user_id);
CREATE INDEX IF NOT EXISTS idx_technologies_slug ON public.technologies(slug);

-- ------------------------------------------------------------------------------
-- 3. Topics Table (Supports Recursive Nesting)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ------------------------------------------------------------------------------
-- 6. Files & Scanned Handwritten Notes Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'handwritten', 'doc')),
    storage_path TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT,
    thumbnail_url TEXT,
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON public.files(file_type);

-- ------------------------------------------------------------------------------
-- 7. Mind Maps Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mind_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    nodes_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    edges_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    thumbnail_url TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mind_maps_user_id ON public.mind_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_maps_technology_id ON public.mind_maps(technology_id);

-- ------------------------------------------------------------------------------
-- 8. Learning Sessions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    technology_id UUID REFERENCES public.technologies(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    session_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.learning_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_tech_id ON public.learning_sessions(technology_id);

-- ------------------------------------------------------------------------------
-- 9. Activity Log Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action_type TEXT NOT NULL,
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

-- Personal Vault Policies (allows full CRUD for personal web application)
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.profiles;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.technologies;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.topics;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.checklist_items;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.notes;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.files;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.mind_maps;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.learning_sessions;
DROP POLICY IF EXISTS "Allow full access for personal vault" ON public.activity_log;

CREATE POLICY "Allow full access for personal vault" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.technologies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.checklist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.mind_maps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.learning_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for personal vault" ON public.activity_log FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC TRIGGERS: Technology Progress Recalculation
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_technology_progress()
RETURNS TRIGGER AS $$
DECLARE
    target_tech_id UUID;
    total_count INTEGER;
    calculated_progress INTEGER;
BEGIN
    target_tech_id := COALESCE(NEW.technology_id, OLD.technology_id);
    
    SELECT COUNT(*) INTO total_count
    FROM public.topics
    WHERE technology_id = target_tech_id;
    
    IF total_count > 0 THEN
        SELECT ROUND(AVG(progress)) INTO calculated_progress
        FROM public.topics
        WHERE technology_id = target_tech_id;
        
        UPDATE public.technologies
        SET progress = COALESCE(calculated_progress, 0),
            updated_at = NOW()
        WHERE id = target_tech_id;
    ELSE
        UPDATE public.technologies
        SET progress = 0,
            updated_at = NOW()
        WHERE id = target_tech_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tech_progress ON public.topics;
CREATE TRIGGER trigger_update_tech_progress
AFTER INSERT OR UPDATE OF progress, status OR DELETE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.recalculate_technology_progress();

-- ==============================================================================
-- STORAGE BUCKET
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('learning-files', 'learning-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public uploads to learning-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from learning-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from learning-files" ON storage.objects;

CREATE POLICY "Allow public uploads to learning-files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'learning-files');

CREATE POLICY "Allow public reads from learning-files" ON storage.objects
FOR SELECT USING (bucket_id = 'learning-files');

CREATE POLICY "Allow public deletes from learning-files" ON storage.objects
FOR DELETE USING (bucket_id = 'learning-files');
