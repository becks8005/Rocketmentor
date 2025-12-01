-- Rocketmentor Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- This table extends Supabase Auth users with app-specific data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  getting_started_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- ONBOARDING DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_level TEXT,
  firm_type TEXT,
  location TEXT DEFAULT '',
  timezone TEXT DEFAULT '',
  manager_stress_trigger TEXT,
  manager_praise_trigger TEXT,
  manager_style TEXT,
  target_level TEXT,
  promotion_horizon TEXT,
  competency_assessments JSONB DEFAULT '[]'::jsonb,
  weekly_check_in_day TEXT DEFAULT 'Monday',
  weekly_check_in_time TEXT DEFAULT '08:30',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding data" ON public.onboarding_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data" ON public.onboarding_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data" ON public.onboarding_data
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- MANAGER CANVAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.manager_canvas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_impact INTEGER DEFAULT 3,
  profitability INTEGER DEFAULT 3,
  teamwork INTEGER DEFAULT 3,
  internal_contributions INTEGER DEFAULT 3,
  optics INTEGER DEFAULT 3,
  style TEXT DEFAULT '',
  key_behaviors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.manager_canvas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own manager canvas" ON public.manager_canvas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own manager canvas" ON public.manager_canvas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manager canvas" ON public.manager_canvas
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PROMOTION PATH TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_path (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_level TEXT NOT NULL,
  target_date TEXT NOT NULL,
  focus_areas JSONB DEFAULT '[]'::jsonb,
  competencies JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.promotion_path ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own promotion path" ON public.promotion_path
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own promotion path" ON public.promotion_path
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own promotion path" ON public.promotion_path
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- WEEK PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.week_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start_date TEXT NOT NULL,
  cards JSONB DEFAULT '[]'::jsonb,
  career_moves JSONB DEFAULT '[]'::jsonb,
  reviewed BOOLEAN DEFAULT FALSE,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE public.week_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own week plans" ON public.week_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own week plans" ON public.week_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own week plans" ON public.week_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own week plans" ON public.week_plans
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- WINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.wins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  raw_text TEXT,
  project TEXT,
  competency_tags TEXT[] DEFAULT '{}',
  date TEXT NOT NULL,
  week_id TEXT,
  source_type TEXT NOT NULL,
  source_id TEXT,
  metric TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wins" ON public.wins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wins" ON public.wins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wins" ON public.wins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wins" ON public.wins
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, first_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_onboarding_data_updated_at
  BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_manager_canvas_updated_at
  BEFORE UPDATE ON public.manager_canvas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_promotion_path_updated_at
  BEFORE UPDATE ON public.promotion_path
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_week_plans_updated_at
  BEFORE UPDATE ON public.week_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_wins_updated_at
  BEFORE UPDATE ON public.wins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

