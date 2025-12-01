# Supabase Setup Guide

This guide walks you through setting up Supabase for Rocketmentor.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click **New Project**
3. Choose your organization (or create one)
4. Enter project details:
   - **Name**: `rocketmentor` (or your preferred name)
   - **Database Password**: Generate a strong password and save it somewhere safe
   - **Region**: Choose the closest to your users
5. Click **Create new project** and wait for it to be ready (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

## 3. Configure Environment Variables

Create a `.env` file in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit your `.env` file to git!

## 4. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see "Success. No rows returned" - this means the schema was created.

## 5. Verify Setup

Check that tables were created:
1. Go to **Table Editor** in the sidebar
2. You should see these tables:
   - `users`
   - `onboarding_data`
   - `manager_canvas`
   - `promotion_path`
   - `week_plans`
   - `wins`
   - `chat_messages`

## 6. Configure Authentication (Optional)

By default, Supabase uses email/password authentication. To customize:

1. Go to **Authentication** → **Providers**
2. **Email**: Enabled by default
   - You can toggle "Confirm email" off for development
3. **OAuth providers** (optional): Enable Google, GitHub, etc.

### Disable Email Confirmation (Development Only)

For easier development, you can disable email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle off **Confirm email**

⚠️ Re-enable this for production!

## 7. Start the App

```bash
npm run dev
```

Navigate to `http://localhost:5173` and try signing up!

## Troubleshooting

### "Invalid API key"
- Double-check your `.env` file values
- Make sure you're using the **anon public** key, not the service_role key
- Restart the dev server after changing `.env`

### "User profile not found after signup"
- The database trigger might not have been created
- Re-run the migration SQL
- Check Supabase logs for errors

### "Row Level Security policy violation"
- Make sure you ran the complete migration with all policies
- Check that the user is properly authenticated

## Database Schema Overview

```
users (extends auth.users)
├── onboarding_data (1:1)
├── manager_canvas (1:1)
├── promotion_path (1:1)
├── week_plans (1:many)
├── wins (1:many)
└── chat_messages (1:many)
```

All tables have Row Level Security (RLS) enabled - users can only access their own data.

## Next Steps

Once Supabase is set up:
1. Sign up for an account in the app
2. Complete the onboarding flow
3. The AI coach feature will work with mock responses (OpenAI integration coming soon)

