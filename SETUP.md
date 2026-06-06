# Writelyf HealthOS — Setup Guide

## Prerequisites

- Node.js 18+ (install from https://nodejs.org)
- A Supabase account (free at https://supabase.com)
- An OpenAI account (for AI features, at https://platform.openai.com)

---

## Step 1: Install Dependencies

```bash
cd writelyf-healthos
npm install
```

---

## Step 2: Set Up Supabase

1. Go to https://supabase.com → New Project
2. Name it `writelyf-healthos`
3. Note your **Project URL** and **anon key** from Settings → API

### Run the Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

### Set Up Storage

1. Go to **Storage** → Create new bucket
2. Name: `health-records`
3. **Public**: OFF (private)
4. Go to **Storage Policies** and add:

**Insert policy** (users upload to own folder):
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

**Select policy** (users read own files):
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

**Delete policy** (users delete own files):
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

### Enable Google Auth (optional)

1. Supabase → Authentication → Providers → Google
2. Add your Google OAuth client ID and secret
3. Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

---

## Step 3: Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Run the App

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 5: Test the App

1. Sign up at `/signup`
2. Add a family member at `/family/new`
3. Upload a lab report at `/vault/upload`
4. View the AI summary on the record page
5. Create an emergency card at `/emergency-card`
6. Generate a doctor summary at `/doctor-summary`

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Add all `.env.local` variables to Vercel's environment settings.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, forgot password
│   ├── (app)/           # Protected app pages
│   │   ├── dashboard/
│   │   ├── family/
│   │   ├── vault/
│   │   ├── timeline/
│   │   ├── doctor-summary/
│   │   ├── emergency-card/
│   │   └── settings/
│   ├── emergency/       # Public emergency card view
│   ├── api/             # API routes (AI, doctor summary)
│   ├── pricing/
│   ├── legal/
│   └── page.tsx         # Landing page
├── components/
│   ├── layout/          # Sidebar, TopBar
│   └── ui/              # Shared UI components
├── lib/
│   ├── supabase/        # Client & server Supabase instances
│   └── utils.ts         # Helper functions
└── types/
    └── index.ts         # TypeScript interfaces
```

---

## Features Built

- [x] Authentication (email/password + Google OAuth)
- [x] Family Profiles (CRUD, health readiness score)
- [x] Health Vault (upload, filter, search, delete)
- [x] AI Report Reader (GPT-4o-mini, structured output)
- [x] Health Timeline (grouped by month, filterable)
- [x] Doctor-Ready Summary (AI-generated, PDF download)
- [x] Emergency QR Card (public page, QR code, toggle active)
- [x] Health Readiness Score (7-point scoring)
- [x] Landing page, Pricing, Legal pages
- [x] Full Supabase RLS on all tables
- [x] Private storage with signed URLs

## AI Safety

All AI outputs:
- Use cautious language ("may", "could", "requires review")
- Never diagnose or prescribe
- Always include medical disclaimer
- Are stored separately from original records
