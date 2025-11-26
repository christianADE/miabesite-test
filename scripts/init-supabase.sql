-- ============================================================================
-- INITIALISATION COMPLÈTE SUPABASE POUR MIABESITE
-- Ce fichier crée toutes les tables, politiques RLS, et storage nécessaires
-- ============================================================================

-- ============================================================================
-- 1. NETTOYAGE DES TABLES ET POLITIQUES EXISTANTES
-- ============================================================================

-- Supprimer les politiques RLS existantes
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Sites are viewable by owner or if public." ON public.sites;
DROP POLICY IF EXISTS "Users can insert their own sites." ON public.sites;
DROP POLICY IF EXISTS "Users can update their own sites." ON public.sites;
DROP POLICY IF EXISTS "Users can delete their own sites." ON public.sites;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.sites;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.sites;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.sites;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.sites;
DROP POLICY IF EXISTS "Public communities are viewable by everyone." ON public.communities;
DROP POLICY IF EXISTS "Users can insert communities." ON public.communities;
DROP POLICY IF EXISTS "Community owners can update their communities." ON public.communities;
DROP POLICY IF EXISTS "Community owners can delete their communities." ON public.communities;

-- Supprimer les tables existantes en cascade
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.ai_video_access CASCADE;
DROP TABLE IF EXISTS public.coin_transactions CASCADE;
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.community_invitations CASCADE;
DROP TABLE IF EXISTS public.updates CASCADE;
DROP TABLE IF EXISTS public.whatsapp_users CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.sites CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- 2. CRÉATION TABLE PROFILES
-- ============================================================================

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  first_name text,
  last_name text,
  date_of_birth date,
  phone_number text,
  whatsapp_number text,
  expertise text,
  avatar_url text,
  referral_code text UNIQUE,
  referral_count integer DEFAULT 0,
  coin_points integer DEFAULT 0,
  referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- ============================================================================
-- 3. CRÉATION TABLE SITES
-- ============================================================================

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
  ON public.sites FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own sites."
  ON public.sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites."
  ON public.sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites."
  ON public.sites FOR DELETE
  USING (auth.uid() = user_id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_sites_subdomain ON public.sites(subdomain);
CREATE INDEX idx_sites_status ON public.sites(status);

-- ============================================================================
-- 4. CRÉATION TABLE COMMUNITIES
-- ============================================================================

CREATE TABLE public.communities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  utility text,
  positioning_domain text,
  template_1 text,
  template_2 text,
  category text,
  is_public boolean DEFAULT true,
  join_code text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public communities are viewable by everyone."
  ON public.communities FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can insert communities."
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Community owners can update their communities."
  ON public.communities FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Community owners can delete their communities."
  ON public.communities FOR DELETE
  USING (auth.uid() = owner_id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_communities_owner_id ON public.communities(owner_id);
CREATE INDEX idx_communities_join_code ON public.communities(join_code);

-- ============================================================================
-- 5. CRÉATION TABLE COMMUNITY_MEMBERS
-- ============================================================================

CREATE TABLE public.community_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view community members of public communities or their own communities."
  ON public.community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE communities.id = community_members.community_id
      AND (communities.is_public = true OR communities.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can join communities."
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Community admins can update members."
  ON public.community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE communities.id = community_members.community_id
      AND communities.owner_id = auth.uid()
    )
  );

-- Index pour améliorer les requêtes
CREATE INDEX idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX idx_community_members_user_id ON public.community_members(user_id);

-- ============================================================================
-- 6. CRÉATION TABLE COMMUNITY_INVITATIONS
-- ============================================================================

CREATE TABLE public.community_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  invited_user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  invited_by_user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(community_id, invited_user_id)
);

ALTER TABLE public.community_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations sent to them."
  ON public.community_invitations FOR SELECT
  USING (auth.uid() = invited_user_id OR auth.uid() = invited_by_user_id);

CREATE POLICY "Community members can invite users."
  ON public.community_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_members.community_id = community_invitations.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Index pour améliorer les requêtes
CREATE INDEX idx_community_invitations_community_id ON public.community_invitations(community_id);
CREATE INDEX idx_community_invitations_invited_user_id ON public.community_invitations(invited_user_id);

-- ============================================================================
-- 7. CRÉATION TABLE MESSAGES
-- ============================================================================

CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  community_id uuid REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in communities they are members of."
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_members.community_id = messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can insert messages."
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_members.community_id = messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Index pour améliorer les requêtes
CREATE INDEX idx_messages_community_id ON public.messages(community_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================================================
-- 8. CRÉATION TABLE AI_VIDEO_ACCESS
-- ============================================================================

CREATE TABLE public.ai_video_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  access_level text DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'enterprise')),
  monthly_quota integer DEFAULT 5,
  used_quota integer DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ai_video_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI video access."
  ON public.ai_video_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI video access."
  ON public.ai_video_access FOR UPDATE
  USING (auth.uid() = user_id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_ai_video_access_user_id ON public.ai_video_access(user_id);

-- ============================================================================
-- 9. CRÉATION TABLE COIN_TRANSACTIONS
-- ============================================================================

CREATE TABLE public.coin_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'referral')),
  amount integer NOT NULL,
  description text,
  reference_id text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coin transactions."
  ON public.coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON public.coin_transactions(created_at DESC);

-- ============================================================================
-- 10. CRÉATION TABLE PUSH_SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subscription jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push subscriptions."
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions."
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- ============================================================================
-- 11. CRÉATION TABLE WHATSAPP_USERS
-- ============================================================================

CREATE TABLE public.whatsapp_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  whatsapp_number text UNIQUE NOT NULL,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.whatsapp_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WhatsApp info."
  ON public.whatsapp_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp info."
  ON public.whatsapp_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_whatsapp_users_user_id ON public.whatsapp_users(user_id);
CREATE INDEX idx_whatsapp_users_whatsapp_number ON public.whatsapp_users(whatsapp_number);

-- ============================================================================
-- 12. CRÉATION TABLE UPDATES (Notifications/System)
-- ============================================================================

CREATE TABLE public.updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  update_type text DEFAULT 'info' CHECK (update_type IN ('info', 'warning', 'success', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own updates."
  ON public.updates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their own updates as read."
  ON public.updates FOR UPDATE
  USING (auth.uid() = user_id);

-- Index pour améliorer les requêtes
CREATE INDEX idx_updates_user_id ON public.updates(user_id);
CREATE INDEX idx_updates_is_read ON public.updates(is_read);
CREATE INDEX idx_updates_created_at ON public.updates(created_at DESC);

-- ============================================================================
-- 13. CRÉATION DES BUCKETS DE STORAGE
-- ============================================================================

-- Supprimer les buckets existants avec leurs objets
DELETE FROM storage.objects WHERE bucket_id = 'profile-pictures';
DELETE FROM storage.objects WHERE bucket_id = 'site-assets';
DELETE FROM storage.buckets WHERE id IN ('profile-pictures', 'site-assets');

-- Créer les buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour storage
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload site assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update site assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to site assets" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow authenticated users to update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow public read access to profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Allow authenticated users to upload site assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'site-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow authenticated users to update site assets" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'site-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow public read access to site assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

-- ============================================================================
-- 14. CRÉATION TRIGGER POUR METTRE À JOUR updated_at
-- ============================================================================

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les tables pertinentes
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_sites_updated_at ON public.sites;
CREATE TRIGGER handle_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_communities_updated_at ON public.communities;
CREATE TRIGGER handle_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_messages_updated_at ON public.messages;
CREATE TRIGGER handle_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_ai_video_access_updated_at ON public.ai_video_access;
CREATE TRIGGER handle_ai_video_access_updated_at
  BEFORE UPDATE ON public.ai_video_access
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER handle_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_whatsapp_users_updated_at ON public.whatsapp_users;
CREATE TRIGGER handle_whatsapp_users_updated_at
  BEFORE UPDATE ON public.whatsapp_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 15. CRÉATION FONCTION POUR CRÉER PROFILE À LA CRÉATION D'UN USER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,  -- Utiliser l'email comme username initial
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIN DE L'INITIALISATION
-- ============================================================================

-- Vérification : afficher les tables créées
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
