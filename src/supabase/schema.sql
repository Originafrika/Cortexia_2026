-- Coconut Pro Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS ====================
-- Handled by Supabase Auth, but we extend with profile
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== PROJECTS ====================
CREATE TABLE IF NOT EXISTS public.coconut_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'campaign')),
  
  -- Project data (JSON)
  nodes JSONB DEFAULT '[]'::JSONB,
  layers JSONB DEFAULT '[]'::JSONB,
  versions JSONB DEFAULT '[]'::JSONB,
  settings JSONB DEFAULT '{}'::JSONB,
  
  -- Generation settings
  generation_mode TEXT DEFAULT 'semi-auto' CHECK (generation_mode IN ('auto', 'semi-auto', 'manual')),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),
  
  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  
  -- Metadata
  thumbnail_url TEXT,
  final_output_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_coconut_projects_owner ON public.coconut_projects(owner_id);
CREATE INDEX idx_coconut_projects_share_token ON public.coconut_projects(share_token);
CREATE INDEX idx_coconut_projects_public ON public.coconut_projects(is_public) WHERE is_public = TRUE;

-- ==================== PROJECT VERSIONS ====================
CREATE TABLE IF NOT EXISTS public.project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.coconut_projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Snapshot of project state
  nodes JSONB NOT NULL,
  layers JSONB NOT NULL,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, version_number)
);

CREATE INDEX idx_project_versions_project ON public.project_versions(project_id);

-- ==================== COMMENTS ====================
CREATE TABLE IF NOT EXISTS public.node_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.coconut_projects(id) ON DELETE CASCADE NOT NULL,
  node_id TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  content TEXT NOT NULL,
  
  -- Threading
  parent_comment_id UUID REFERENCES public.node_comments(id) ON DELETE CASCADE,
  
  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_node_comments_project ON public.node_comments(project_id);
CREATE INDEX idx_node_comments_node ON public.node_comments(node_id);

-- ==================== COLLABORATORS ====================
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.coconut_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  
  -- Permissions
  can_edit BOOLEAN DEFAULT TRUE,
  can_comment BOOLEAN DEFAULT TRUE,
  can_share BOOLEAN DEFAULT FALSE,
  
  invited_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_collaborators_project ON public.project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user ON public.project_collaborators(user_id);

-- ==================== TEAM LIBRARIES ====================
CREATE TABLE IF NOT EXISTS public.team_libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Assets
  assets JSONB DEFAULT '[]'::JSONB,
  
  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_libraries_owner ON public.team_libraries(owner_id);

-- ==================== LIBRARY ITEMS ====================
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_id UUID REFERENCES public.team_libraries(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT NOT NULL CHECK (type IN ('prompt', 'node', 'layer', 'style', 'template')),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Data
  data JSONB NOT NULL,
  
  -- Metadata
  thumbnail_url TEXT,
  tags TEXT[],
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Usage tracking
  use_count INTEGER DEFAULT 0
);

CREATE INDEX idx_library_items_library ON public.library_items(library_id);
CREATE INDEX idx_library_items_type ON public.library_items(type);
CREATE INDEX idx_library_items_tags ON public.library_items USING GIN(tags);

-- ==================== AI OBSERVATIONS ====================
CREATE TABLE IF NOT EXISTS public.ai_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.coconut_projects(id) ON DELETE CASCADE NOT NULL,
  node_id TEXT NOT NULL,
  
  -- AI feedback
  observation_type TEXT NOT NULL CHECK (observation_type IN ('validation', 'suggestion', 'warning', 'error')),
  message TEXT NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Details
  details JSONB,
  
  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_observations_project ON public.ai_observations(project_id);
CREATE INDEX idx_ai_observations_node ON public.ai_observations(node_id);

-- ==================== ACTIVITY LOG ====================
CREATE TABLE IF NOT EXISTS public.project_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.coconut_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_activity_project ON public.project_activity(project_id);
CREATE INDEX idx_project_activity_created ON public.project_activity(created_at DESC);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coconut_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Coconut Projects Policies
CREATE POLICY "Users can view own projects"
  ON public.coconut_projects FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR is_public = TRUE
    OR EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = coconut_projects.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON public.coconut_projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects"
  ON public.coconut_projects FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = coconut_projects.id
      AND user_id = auth.uid()
      AND can_edit = TRUE
    )
  );

CREATE POLICY "Users can delete own projects"
  ON public.coconut_projects FOR DELETE
  USING (owner_id = auth.uid());

-- Project Versions Policies
CREATE POLICY "Users can view versions of accessible projects"
  ON public.project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coconut_projects
      WHERE id = project_versions.project_id
      AND (
        owner_id = auth.uid()
        OR is_public = TRUE
        OR EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = coconut_projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create versions for editable projects"
  ON public.project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coconut_projects
      WHERE id = project_versions.project_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = coconut_projects.id
          AND user_id = auth.uid()
          AND can_edit = TRUE
        )
      )
    )
  );

-- Comments Policies
CREATE POLICY "Users can view comments on accessible projects"
  ON public.node_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coconut_projects
      WHERE id = node_comments.project_id
      AND (
        owner_id = auth.uid()
        OR is_public = TRUE
        OR EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = coconut_projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comments on projects they can comment on"
  ON public.node_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.coconut_projects
      WHERE id = node_comments.project_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = coconut_projects.id
          AND user_id = auth.uid()
          AND can_comment = TRUE
        )
      )
    )
  );

-- Collaborators Policies
CREATE POLICY "Users can view collaborators of accessible projects"
  ON public.project_collaborators FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.coconut_projects
      WHERE id = project_collaborators.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage collaborators"
  ON public.project_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.coconut_projects
      WHERE id = project_collaborators.project_id
      AND owner_id = auth.uid()
    )
  );

-- ==================== FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_coconut_projects_updated_at
  BEFORE UPDATE ON public.coconut_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_libraries_updated_at
  BEFORE UPDATE ON public.team_libraries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_activity (project_id, user_id, action, details)
  VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'timestamp', NOW()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for activity logging
CREATE TRIGGER log_coconut_project_activity
  AFTER INSERT OR UPDATE ON public.coconut_projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_activity();
