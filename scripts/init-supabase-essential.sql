-- ============================================================================
-- INITIALISATION ESSENTIELLE SUPABASE - VERSION COURTE
-- Créé le 26 novembre 2025
-- ============================================================================

-- ============================================================================
-- 1. CRÉATION TABLE PROFILES (ESSENTIELLES POUR AUTH)
-- ============================================================================
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  phone_number text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  coin_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE INDEX idx_profiles_username ON public.profiles(username);

-- ============================================================================
-- 2. CRÉATION TABLE SITES
-- ============================================================================
DROP TABLE IF EXISTS public.sites CASCADE;

CREATE TABLE public.sites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subdomain text UNIQUE NOT NULL,
  site_data jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  template_type text DEFAULT 'default',
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sites are viewable by owner or if public."
  ON public.sites FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own sites."
  ON public.sites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites."
  ON public.sites FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites."
  ON public.sites FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_sites_subdomain ON public.sites(subdomain);

-- ============================================================================
-- 3. CRÉATION TABLE COMMUNITIES
-- ============================================================================
DROP TABLE IF EXISTS public.communities CASCADE;

CREATE TABLE public.communities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  join_code text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public communities are viewable by everyone."
  ON public.communities FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can insert communities."
  ON public.communities FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Community owners can update their communities."
  ON public.communities FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Community owners can delete their communities."
  ON public.communities FOR DELETE USING (auth.uid() = owner_id);

CREATE INDEX idx_communities_owner_id ON public.communities(owner_id);

-- ============================================================================
-- 4. CRÉATION TABLE COMMUNITY_MEMBERS
-- ============================================================================
DROP TABLE IF EXISTS public.community_members CASCADE;

CREATE TABLE public.community_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view community members of public communities."
  ON public.community_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.communities 
      WHERE communities.id = community_members.community_id
      AND (communities.is_public = true OR communities.owner_id = auth.uid()))
  );

CREATE POLICY "Users can join communities."
  ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_community_members_community_id ON public.community_members(community_id);

-- ============================================================================
-- 5. CRÉATION TABLE MESSAGES
-- ============================================================================
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  community_id uuid REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in communities they are members of."
  ON public.messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.community_members
      WHERE community_members.community_id = messages.community_id
      AND community_members.user_id = auth.uid())
  );

CREATE POLICY "Community members can insert messages."
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.community_members
      WHERE community_members.community_id = messages.community_id
      AND community_members.user_id = auth.uid())
  );

CREATE INDEX idx_messages_community_id ON public.messages(community_id);

-- ============================================================================
-- 6. CRÉATION TABLE COIN_TRANSACTIONS
-- ============================================================================
DROP TABLE IF EXISTS public.coin_transactions CASCADE;

CREATE TABLE public.coin_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'referral')),
  amount integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coin transactions."
  ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_coin_transactions_user_id ON public.coin_transactions(user_id);

-- ============================================================================
-- 7. CRÉATION TABLE AI_VIDEO_ACCESS
-- ============================================================================
DROP TABLE IF EXISTS public.ai_video_access CASCADE;

CREATE TABLE public.ai_video_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  access_level text DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'enterprise')),
  monthly_quota integer DEFAULT 5,
  used_quota integer DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ai_video_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI video access."
  ON public.ai_video_access FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_ai_video_access_user_id ON public.ai_video_access(user_id);

-- ============================================================================
-- 8. CRÉATION TABLE PUSH_SUBSCRIPTIONS
-- ============================================================================
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;

CREATE TABLE public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subscription jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push subscriptions."
  ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions."
  ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- ============================================================================
-- 9. FONCTION POUR METTRE À JOUR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_sites_updated_at ON public.sites;
CREATE TRIGGER handle_sites_updated_at
  BEFORE UPDATE ON public.sites FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_communities_updated_at ON public.communities;
CREATE TRIGGER handle_communities_updated_at
  BEFORE UPDATE ON public.communities FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_ai_video_access_updated_at ON public.ai_video_access;
CREATE TRIGGER handle_ai_video_access_updated_at
  BEFORE UPDATE ON public.ai_video_access FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER handle_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 10. FONCTION POUR CRÉER PROFILE À LA CRÉATION D'UN USER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 11. CRÉATION BUCKETS DE STORAGE (OPTIONNEL)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
