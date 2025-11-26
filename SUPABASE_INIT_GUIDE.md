# Guide d'Initialisation Supabase pour MiabeSite

Ce guide vous aide à configurer complètement votre nouveau projet Supabase pour MiabeSite.

## 📋 Prérequis

- ✅ Nouveau projet Supabase créé sur https://supabase.com
- ✅ Clés API récupérées (voir ci-dessous)
- ✅ Variables d'environnement configurées dans `.env.local`

## 🔐 Étape 1: Récupérer les Clés Supabase

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Cliquez sur **Settings** (⚙️) en bas à gauche
4. Allez à l'onglet **API**
5. Copiez:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Exemple `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://feksshchmoilswpzdjrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Étape 2: Initialiser les Tables et Schéma

### Option A: Via Script Node.js (Recommandé)

```powershell
# Installer les dépendances si nécessaire
pnpm install

# Exécuter le script d'initialisation
pnpm node scripts/init-supabase.js
```

Si le script affiche "RPC non disponible", continuez à l'Option B.

### Option B: Manuellement via Supabase Dashboard (Alternative)

1. Allez sur https://app.supabase.com → Votre Projet
2. Cliquez sur **SQL Editor** (volet gauche)
3. Cliquez **+ New Query**
4. Ouvrez le fichier `scripts/init-supabase.sql` (bloc-notes)
5. Copiez **tout son contenu**
6. Collez-le dans l'éditeur SQL
7. Cliquez **Run** (ou Ctrl+Enter)
8. Attendez la confirmation "Success"

### Que fait l'initialisation?

Le script crée:
- ✅ **Profiles** - Profils utilisateurs avec `username`, `phone_number`, etc.
- ✅ **Sites** - Sites web créés par les utilisateurs
- ✅ **Communities** - Communautés avec membres et invitations
- ✅ **Messages** - Messagerie dans les communautés
- ✅ **AI Video Access** - Accès aux vidéos IA avec quotas
- ✅ **Coin Transactions** - Transactions de points/coins
- ✅ **Push Subscriptions** - Abonnements aux notifications
- ✅ **WhatsApp Users** - Intégration WhatsApp
- ✅ **Updates** - Système de notifications
- ✅ **Storage Buckets** - `profile-pictures` et `site-assets`
- ✅ **Politiques RLS** - Sécurité row-level
- ✅ **Triggers** - Mises à jour automatiques de `updated_at`

## 🔐 Étape 3: Configurer l'Authentification

### Redirect URLs

1. Allez à **Authentication** → **Settings**
2. Sous "Redirect URLs":
   - Ajoutez `http://localhost:3000` (développement)
   - Ajoutez `http://localhost:3000/auth/callback`
   - Ajoutez votre domaine production (ex: `https://miabesite.com`)

### Email Configuration

1. Allez à **Authentication** → **Email**
2. Vérifiez que "Confirm email" est activé (recommandé)
3. Pour les e-mails transactionnels:
   - Si vous utilisez un fournisseur (SendGrid, Mailgun):
     - Allez à **SMTP Settings**
     - Configurez les coordonnées du serveur SMTP
   - Sinon, Supabase utilise son service d'e-mail par défaut

### OAuth Providers (Google, Facebook)

1. Allez à **Authentication** → **Providers**
2. Pour **Google**:
   - Activez le switch
   - Allez à https://console.cloud.google.com
   - Créez un nouveau projet
   - Allez à **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Configurez comme "Web application"
   - Sous "Authorized redirect URIs", ajoutez:
     - `https://feksshchmoilswpzdjrs.supabase.co/auth/v1/callback?provider=google`
   - Copiez le "Client ID" et "Client Secret"
   - Collez-les dans Supabase
3. Pour **Facebook**:
   - Activez le switch
   - Allez à https://developers.facebook.com
   - Créez une app Facebook
   - Allez à **Settings** → **Basic** et **App Domains**
   - Ajoutez votre domaine
   - Allez à **Products** → **Facebook Login** → **Settings**
   - Sous "Valid OAuth Redirect URIs", ajoutez:
     - `https://feksshchmoilswpzdjrs.supabase.co/auth/v1/callback?provider=facebook`
   - Copiez l'App ID et App Secret
   - Collez-les dans Supabase

## 🚀 Étape 4: Tester l'Application

```powershell
# Démarrer le serveur de développement
pnpm dev
```

Ouvrez http://localhost:3000 et testez:
1. ✅ Page d'inscription
2. ✅ Entrée du username, téléphone, email, mot de passe
3. ✅ Création du compte dans Supabase Auth
4. ✅ Création du profil automatique
5. ✅ Email de confirmation reçu (ou vérification du compte)
6. ✅ Redirection vers `/auth/email-sent`

## 📊 Vérifier la Base de Données

### Via Dashboard Supabase

1. Allez à **Table Editor**
2. Vous devriez voir les tables:
   - `profiles`
   - `sites`
   - `communities`
   - `messages`
   - etc.

### Via SQL (optionnel)

Exécutez cette requête dans le SQL Editor pour vérifier:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

Résultat attendu:
```
ai_video_access
coin_transactions
communities
community_invitations
community_members
messages
profiles
push_subscriptions
sites
updates
whatsapp_users
```

## 🔧 Troubleshooting

### Erreur: "RPC function not found"
→ C'est normal. Utilisez l'Option B (Supabase Dashboard SQL Editor) pour exécuter manuellement.

### Erreur: "UNIQUE constraint violation on username"
→ L'utilisateur existe déjà. Supprimez l'utilisateur dans Auth et réessayez.

### Les données ne s'affichent pas après inscription
→ Vérifiez que:
1. Le trigger `on_auth_user_created` a bien créé le profil (Table Editor → profiles)
2. Les politiques RLS permettent la lecture
3. Rafraîchissez la page (Ctrl+Shift+R)

### L'email de confirmation n'arrive pas
→ Vérifiez:
1. Le dossier SPAM
2. La configuration SMTP dans Supabase (ou activez "Auto Confirm" en dev)
3. Les logs de Supabase (Dashboard → Auth → Logs)

## 📝 Schéma de Base de Données

### Profiles
```sql
id (uuid)                  -- Référence à auth.users
username (text, unique)    -- Nom d'utilisateur unique
phone_number (text)        -- Numéro de téléphone (+228...)
email (via auth.users)     -- Email d'authentification
full_name (text)           -- Nom complet
avatar_url (text)          -- URL de l'avatar
referral_code (text)       -- Code de parrainage
coin_points (integer)      -- Points/coins acumulés
role (text)                -- 'user' | 'admin' | 'super_admin'
created_at, updated_at
```

### Sites
```sql
id (uuid)
user_id (uuid)            -- Propriétaire du site
subdomain (text, unique)  -- URL du site (ex: "mon-site")
site_data (jsonb)         -- Configuration du site
status (text)             -- 'draft' | 'published' | 'archived'
is_public (boolean)       -- Visibilité publique
created_at, updated_at
```

## ✅ Checklist d'Initialisation

- [ ] Clés Supabase récupérées
- [ ] Variables d'environnement dans `.env.local`
- [ ] Script d'initialisation exécuté (ou SQL manuel)
- [ ] Tables créées et visibles dans Table Editor
- [ ] Redirect URLs configurées
- [ ] Email/OAuth configurés (optionnel)
- [ ] Application testée (inscription/login)
- [ ] Profil créé automatiquement après inscription

## 📞 Besoin d'Aide?

- Docs Supabase: https://supabase.com/docs
- Supabase Dashboard: https://app.supabase.com
- Support: https://github.com/supabase/supabase/discussions

---

**Fait! Votre base de données Supabase est prête pour la production!** 🎉
