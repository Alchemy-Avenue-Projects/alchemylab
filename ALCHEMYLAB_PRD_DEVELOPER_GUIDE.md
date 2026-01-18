# AlchemyLab — Product Requirements Document (Developer Guide)

> **Version:** 1.0  
> **Last Updated:** January 2026  
> **Document Status:** Active  
> **Audience:** Junior Developers

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technical Stack](#2-technical-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [Authentication System](#5-authentication-system)
6. [OAuth Platform Integration](#6-oauth-platform-integration)
7. [Organizations & Multi-Tenancy](#7-organizations--multi-tenancy)
8. [User Roles & Permissions (RBAC)](#8-user-roles--permissions-rbac)
9. [Feature Modules](#9-feature-modules)
10. [API & Edge Functions](#10-api--edge-functions)
11. [Current Implementation Status](#11-current-implementation-status)
12. [Known Issues & Technical Debt](#12-known-issues--technical-debt)
13. [Architecture Improvement Recommendations](#13-architecture-improvement-recommendations) ⭐
14. [Development Phases](#14-development-phases)
15. [Coding Standards](#15-coding-standards)
16. [Testing Guidelines](#16-testing-guidelines)
17. [Deployment](#17-deployment)

> 📖 **Section 13** contains detailed recommendations for improving the codebase based on review of the current implementation and `.cursorrules` requirements.

---

## 1. Project Overview

### 1.1 What is AlchemyLab?

AlchemyLab is a **"Command Center" for digital marketing teams**. Think of it as a unified dashboard where marketers can:

- **Connect** multiple advertising accounts (Facebook, Google, TikTok, LinkedIn)
- **View** all their campaign performance data in one place
- **Get AI-powered insights** on what's working and what's not
- **Generate ad copy** using AI (text now, images/video later)
- **Manage their team** with different permission levels

### 1.2 The Problem We Solve

Marketers typically juggle 5-10 different platforms daily:
- Facebook Ads Manager
- Google Ads
- TikTok Business Center
- Google Analytics
- Various reporting tools

AlchemyLab consolidates all of this into one interface, saving hours of "tab-switching" time.

### 1.3 Target Users

| Persona | Who They Are | What They Need |
|---------|-------------|----------------|
| **Marketing Manager (SMB)** | In-house marketer at a small business | Quick campaign launch, daily AI suggestions |
| **Performance Marketer (Agency)** | Works at an agency, manages multiple clients | Multi-account overview, audit tools |
| **Creative Lead** | Responsible for ad creative | AI ad generation, creative fatigue alerts |
| **Org Admin** | Team lead or business owner | Billing, team management, API keys |

### 1.4 Subscription Tiers

| Tier | Ad Accounts | Users | AI Generations | Price |
|------|-------------|-------|----------------|-------|
| **Starter** | 3 | 3 | 10/month | $49/mo |
| **Pro** | 7 | 10 | 50/month | $99/mo |
| **Enterprise** | Unlimited | Unlimited | Unlimited | $199/mo |

> ⚠️ **Important:** Tier limits must be enforced in BOTH:
> - **Frontend:** Disable "Connect" button when limit reached; show upgrade prompt
> - **Backend:** Edge Function must reject storing new connections if tier limit exceeded

> 📝 **Action Required:** Update `src/components/pricing/pricingData.ts` to reflect the correct ad account limits (Starter: 3, Pro: 7).

---

## 2. Technical Stack

> 📋 **Stack Evaluation (January 2026):** The current stack was reviewed and deemed excellent for AlchemyLab's needs. We're keeping the core stack and adding targeted improvements. See [Section 2.5](#25-proposed-additions-phase-0) for additions.

### 2.1 Frontend (Current — KEEP)

| Technology | Purpose | Version | Status |
|------------|---------|---------|--------|
| **React** | UI Framework | 18.x | ✅ Keep |
| **TypeScript** | Type-safe JavaScript | 5.x | ✅ Keep |
| **Vite** | Build tool & dev server | 5.x | ✅ Keep |
| **React Router** | Client-side routing | 6.x | ✅ Keep |
| **Tailwind CSS** | Utility-first styling | 3.x | ✅ Keep |
| **shadcn/ui** | Pre-built UI components | Latest | ✅ Keep |
| **TanStack Query** | Server state management | 5.x | ✅ Keep |
| **Sonner** | Toast notifications | Latest | ✅ Keep |

**Why we're keeping this stack:**
- React + TypeScript: Industry standard, great Supabase support, easy to hire for
- Vite: Fastest build tool, excellent DX
- Tailwind + shadcn/ui: Best-in-class for rapid, beautiful UI development
- TanStack Query: Perfect for data fetching patterns with Supabase

**Why NOT Next.js:** AlchemyLab is a dashboard app, not a content site. We don't need SSR/SSG. The added complexity isn't worth it.

### 2.2 Backend (Current — KEEP)

| Technology | Purpose | Status |
|------------|---------|--------|
| **Supabase** | Backend-as-a-Service (Auth, Database, Storage) | ✅ Keep |
| **PostgreSQL** | Relational database (via Supabase) | ✅ Keep |
| **Supabase Edge Functions** | Serverless functions (Deno runtime) | ✅ Keep |
| **Row Level Security (RLS)** | Database-level access control | ✅ Keep |

**Why we're keeping Supabase:**
- RLS is perfect for multi-tenant SaaS (data isolation)
- Built-in auth saves development time
- PostgreSQL is rock-solid and standard (easy to migrate if needed)
- Generous free tier for development

### 2.3 External APIs

| Service | Purpose | Priority |
|---------|---------|----------|
| **Facebook Graph API** | Facebook Ads data | P0 (MVP) |
| **Google Ads API** | Google Ads data | P1 |
| **TikTok Marketing API** | TikTok Ads data | P1 |
| **LinkedIn Marketing API** | LinkedIn Ads data | P2 |
| **Google Analytics Data API** | GA4 analytics | P1 |
| **OpenAI API** | AI ad generation & insights | P1 |

### 2.4 Current Libraries

```json
{
  "@supabase/supabase-js": "^2.x",      // Supabase client
  "@tanstack/react-query": "^5.x",       // Data fetching & caching
  "react-router-dom": "^6.x",            // Routing
  "date-fns": "^3.x",                    // Date manipulation
  "lucide-react": "^0.x",                // Icons
  "sonner": "^1.x"                       // Toast notifications
}
```

### 2.5 Proposed Additions (Phase 0)

These libraries should be added to improve the codebase quality and enable key features:

#### 2.5.1 Form Handling & Validation

| Package | Purpose | Priority |
|---------|---------|----------|
| `zod` | Runtime schema validation | 🔴 High |
| `react-hook-form` | Performant form handling | 🔴 High |
| `@hookform/resolvers` | Zod integration for react-hook-form | 🔴 High |

**Install:**
```bash
npm install zod react-hook-form @hookform/resolvers
```

**Why:** Current forms use ad-hoc useState validation. This is error-prone and inconsistent. Zod + react-hook-form provides type-safe, declarative validation.

**Example usage:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productBriefSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(2000).optional(),
  targetAudience: z.string().max(500).optional(),
});

type ProductBriefForm = z.infer<typeof productBriefSchema>;

function ProductBriefForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductBriefForm>({
    resolver: zodResolver(productBriefSchema)
  });
  
  const onSubmit = (data: ProductBriefForm) => {
    // data is fully typed and validated
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <span className="text-red-500">{errors.name.message}</span>}
    </form>
  );
}
```

#### 2.5.2 Dashboard Charts

| Package | Purpose | Priority |
|---------|---------|----------|
| `@tremor/react` | Dashboard-ready chart components | 🟡 Medium |

**Install:**
```bash
npm install @tremor/react
```

**Why:** AlchemyLab is a dashboard app. We need charts for performance visualization. Tremor is Tailwind-native, beautiful, and designed specifically for dashboards.

**Example usage:**
```typescript
import { Card, Title, AreaChart } from '@tremor/react';

const chartData = [
  { date: 'Jan 1', spend: 1200, revenue: 3400 },
  { date: 'Jan 2', spend: 1400, revenue: 3800 },
  // ...
];

function PerformanceChart() {
  return (
    <Card>
      <Title>Campaign Performance</Title>
      <AreaChart
        data={chartData}
        index="date"
        categories={['spend', 'revenue']}
        colors={['blue', 'emerald']}
        valueFormatter={(v) => `$${v.toLocaleString()}`}
      />
    </Card>
  );
}
```

#### 2.5.3 Error Tracking

| Package | Purpose | Priority |
|---------|---------|----------|
| `@sentry/react` | Production error monitoring | 🟡 Medium |

**Install:**
```bash
npm install @sentry/react
```

**Why:** Currently, production errors are invisible. Sentry captures errors, provides stack traces, and helps debug issues users encounter.

**Setup (in `main.tsx`):**
```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
  });
}
```

**Required env var:**
```bash
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### 2.5.4 State Management (Optional)

| Package | Purpose | Priority |
|---------|---------|----------|
| `zustand` | Lightweight client state management | 🟢 Low |

**Install:**
```bash
npm install zustand
```

**Why:** React Context can cause unnecessary re-renders. Zustand is simpler than Redux and more performant than Context for complex UI state. **Only add if Context becomes a performance issue.**

**Example usage:**
```typescript
import { create } from 'zustand';

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));

// Usage in component
function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  // ...
}
```

#### 2.5.5 Background Jobs (Future - Phase 1)

| Package | Purpose | Priority |
|---------|---------|----------|
| `inngest` | Background jobs & scheduled tasks | 🟡 Phase 1 |

**Why:** pg_cron + Edge Functions is workable but limited. Inngest provides:
- Reliable job execution with retries
- Scheduled tasks (cron)
- Event-driven workflows
- Better observability

**Consider adding in Phase 1** when implementing data ingestion.

### 2.6 Updated Dependencies (Target)

After implementing the proposed additions, `package.json` should include:

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.x",
    "@sentry/react": "^8.x",
    "@supabase/supabase-js": "^2.x",
    "@tanstack/react-query": "^5.x",
    "@tremor/react": "^3.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-hook-form": "^7.x",
    "react-router-dom": "^6.x",
    "sonner": "^1.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

### 2.7 Stack Decision Summary

| Category | Decision | Rationale |
|----------|----------|-----------|
| **Framework** | ✅ Keep React + Vite | Modern, fast, well-suited for dashboards |
| **Styling** | ✅ Keep Tailwind + shadcn/ui | Best-in-class DX and aesthetics |
| **State** | ✅ Keep TanStack Query + Context | Works well; add Zustand only if needed |
| **Backend** | ✅ Keep Supabase | RLS is essential; Postgres is standard |
| **Forms** | 🆕 Add Zod + react-hook-form | Structured validation, type safety |
| **Charts** | 🆕 Add Tremor | Dashboard-native, Tailwind-compatible |
| **Monitoring** | 🆕 Add Sentry | Production visibility |
| **Jobs** | 🔮 Consider Inngest (Phase 1) | Better than pg_cron for complex workflows |

**Rejected Alternatives:**
- ❌ Next.js — Unnecessary complexity for a dashboard app
- ❌ Vue/Svelte — Would require complete rewrite, no significant benefit
- ❌ Firebase — More vendor lock-in, NoSQL doesn't fit our data model
- ❌ Redux — Overkill; TanStack Query + Context is sufficient

---

## 3. Project Structure

```
alchemylab/
├── public/                    # Static assets (favicon, images)
├── src/
│   ├── App.tsx               # Main app component with routes
│   ├── main.tsx              # Entry point
│   ├── index.css             # Global styles
│   │
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── layout/           # App shell (Sidebar, Topbar, etc.)
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── settings/         # Settings page components
│   │   ├── campaigns/        # Campaign management components
│   │   ├── pricing/          # Pricing page components
│   │   └── ...
│   │
│   ├── pages/                # Page components (one per route)
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   ├── AIInsights.tsx
│   │   ├── Creator.tsx       # AI Ad Generator
│   │   ├── Team.tsx
│   │   └── ...
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # (via AuthContext)
│   │   ├── useDashboardData.ts
│   │   ├── useTeam.ts
│   │   ├── useAdGenerator.ts
│   │   └── ...
│   │
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.tsx   # User authentication state
│   │   ├── PlatformsContext.tsx  # Connected platforms state
│   │   └── NotificationContext.tsx
│   │
│   ├── services/             # Business logic & API calls
│   │   └── platforms/
│   │       ├── PlatformService.ts      # Base class for all platforms
│   │       ├── FacebookAdsService.ts   # Facebook-specific logic
│   │       ├── GoogleAdsService.ts
│   │       ├── oauth/                  # OAuth helpers
│   │       └── ...
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── database.ts       # Database table types
│   │   ├── platforms.ts      # Platform connection types
│   │   └── roles.ts          # User role types
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client instance
│   │       └── types.ts      # Auto-generated Supabase types
│   │
│   ├── utils/                # Utility functions
│   │   ├── env.ts            # Environment variable access
│   │   └── logger.ts         # Logging utilities
│   │
│   ├── constants/
│   │   └── config.ts         # App-wide constants
│   │
│   └── lib/
│       └── utils.ts          # shadcn/ui utility (cn function)
│
├── supabase/
│   ├── config.toml           # Supabase local config
│   └── functions/            # Edge Functions (Deno)
│       ├── facebook-oauth-callback/
│       ├── oauth-callback/
│       ├── refresh-token/
│       └── invite-team-member/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.local                # Local environment variables (DO NOT COMMIT)
```

### 3.1 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserMenu.tsx` |
| Hooks | camelCase with `use` prefix | `useTeam.ts` |
| Utilities | camelCase | `oauth-utils.ts` |
| Types | PascalCase for interfaces | `PlatformConnection` |
| Constants | SCREAMING_SNAKE_CASE | `AUTH_LOADING_TIMEOUT_MS` |

---

## 4. Database Schema

### 4.1 Entity Relationship Overview

```
┌─────────────────┐       ┌─────────────────┐
│  organizations  │       │    profiles     │
│─────────────────│       │─────────────────│
│ id (PK)         │◄──────│ id (PK)         │
│ name            │       │ organization_id │
│ plan            │       │ email           │
│ trial_expiration│       │ full_name       │
└────────┬────────┘       │ role            │
         │                └─────────────────┘
         │
         │    ┌─────────────────────────┐
         └───►│  platform_connections   │
              │─────────────────────────│
              │ id (PK)                 │
              │ organization_id (FK)    │
              │ platform                │
              │ auth_token (encrypted)  │
              │ refresh_token           │
              │ token_expiry            │
              │ connected_by (FK)       │
              │ connected               │
              └───────────┬─────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│    clients      │               │   ad_accounts   │
│─────────────────│               │─────────────────│
│ id (PK)         │◄──────────────│ id (PK)         │
│ organization_id │               │ client_id (FK)  │
│ name            │               │ platform        │
│ industry        │               │ account_name    │
└────────┬────────┘               │ account_id_on_  │
         │                        │   platform      │
         │                        └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│    campaigns    │               │ analytics_      │
│─────────────────│               │   snapshots     │
│ id (PK)         │◄──────────────│─────────────────│
│ ad_account_id   │               │ campaign_id     │
│ name            │               │ impressions     │
│ status          │               │ clicks          │
│ budget          │               │ spend           │
└────────┬────────┘               │ conversions     │
         │                        │ ctr             │
         ▼                        └─────────────────┘
┌─────────────────┐
│      ads        │
│─────────────────│
│ id (PK)         │
│ campaign_id (FK)│
│ headline        │
│ body_text       │
│ ad_type         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ai_suggestions  │
│─────────────────│
│ id (PK)         │
│ ad_id (FK)      │
│ suggestion_type │
│ suggested_text  │
│ accepted        │
└─────────────────┘
```

### 4.2 Table Details

#### `organizations`
The top-level entity. Every user belongs to one organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Organization name |
| `plan` | ENUM | `trial`, `basic`, `pro`, `enterprise` |
| `trial_expiration` | TIMESTAMP | When trial ends |

#### `profiles`
User profile data. Links to Supabase Auth users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Same as Supabase auth user ID |
| `email` | TEXT | User's email |
| `full_name` | TEXT | Display name |
| `organization_id` | UUID | FK to organizations |
| `role` | ENUM | `admin`, `editor`, `viewer` |

#### `platform_connections`
OAuth tokens for connected platforms. **Tokens are stored server-side only!**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK to organizations |
| `platform` | TEXT | `facebook`, `google`, etc. |
| `auth_token` | TEXT | Access token (encrypted) |
| `refresh_token` | TEXT | Refresh token |
| `token_expiry` | TIMESTAMP | When token expires |
| `connected_by` | UUID | User who connected |
| `connected` | BOOLEAN | Is connection active? |
| `account_name` | TEXT | Display name for UI |

#### `campaigns`
Marketing campaigns from connected ad accounts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `ad_account_id` | UUID | FK to ad_accounts |
| `name` | TEXT | Campaign name |
| `status` | ENUM | `active`, `paused`, `ended` |
| `budget` | NUMERIC | Campaign budget |
| `start_date` | DATE | When campaign started |

#### `ai_learnings`
AI insights stored for "memory" - what works and what doesn't.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `insight_type` | ENUM | `positive` (repeat), `negative` (avoid) |
| `scope` | ENUM | `client`, `organization`, `global` |
| `description` | TEXT | The insight text |
| `learned_from_campaign_id` | UUID | Optional FK |
| `learned_from_ad_id` | UUID | Optional FK |

### 4.3 Key Enums

```sql
-- Ad platforms we support
CREATE TYPE ad_platform AS ENUM (
  'facebook', 'google', 'tiktok', 'linkedin', 
  'taboola', 'pinterest', 'snapchat'
);

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- Organization plans
CREATE TYPE organization_plan AS ENUM ('trial', 'basic', 'pro', 'enterprise');

-- Campaign status
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'ended');

-- AI suggestion types
CREATE TYPE suggestion_type AS ENUM (
  'copy_change', 'asset_swap', 'fatigue_alert', 'localization'
);
```

---

## 5. Authentication System

### 5.1 Overview

AlchemyLab uses **Supabase Auth** for user authentication. This is a wrapper around GoTrue that provides:
- Email/password login
- Session management
- JWT tokens

### 5.2 Auth Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Frontend  │     │  Supabase   │
│             │     │             │     │    Auth     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. Enter email/   │                   │
       │    password       │                   │
       │──────────────────►│                   │
       │                   │                   │
       │                   │ 2. signInWith     │
       │                   │    Password()     │
       │                   │──────────────────►│
       │                   │                   │
       │                   │ 3. Return session │
       │                   │    (JWT + user)   │
       │                   │◄──────────────────│
       │                   │                   │
       │                   │ 4. Store session  │
       │                   │    (localStorage) │
       │                   │                   │
       │ 5. Redirect to    │                   │
       │    /app           │                   │
       │◄──────────────────│                   │
```

### 5.3 AuthContext Code Walkthrough

**Location:** `src/contexts/AuthContext.tsx`

The AuthContext provides these values to all child components:

```typescript
interface AuthContextType {
  user: User | null;           // Supabase auth user
  session: Session | null;     // Current session with JWT
  profile: Profile | null;     // User's profile from 'profiles' table
  isAdmin: boolean;            // Quick check for admin role
  isLoading: boolean;          // Is auth state being determined?
  signIn: (email, password) => Promise;
  signUp: (email, password, fullName) => Promise;
  signOut: () => Promise;
}
```

**Key Implementation Details:**

1. **Session Persistence:**
   ```typescript
   // Check for existing session on app load
   supabase.auth.getSession().then(({ data: { session } }) => {
     setSession(session);
     setUser(session?.user ?? null);
   });
   ```

2. **Auth State Listener:**
   ```typescript
   // Listen for auth changes (login, logout, token refresh)
   supabase.auth.onAuthStateChange((event, session) => {
     setSession(session);
     setUser(session?.user ?? null);
   });
   ```

3. **Profile Fetch:**
   ```typescript
   // After auth, fetch user profile from 'profiles' table
   const { data } = await supabase
     .from('profiles')
     .select('*')
     .eq('id', userId)
     .single();
   ```

### 5.4 Protected Routes

The app uses React Router with conditional rendering:

```tsx
// In App.tsx
<Route path="/app" element={<AppLayout />}>
  {/* These routes require authentication */}
  <Route index element={<Dashboard />} />
  <Route path="settings" element={<Settings />} />
</Route>
```

```tsx
// In AppLayout.tsx or individual pages
const { user, isLoading } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (!user) {
  navigate("/auth?mode=login");
  return null;
}
```

---

## 6. OAuth Platform Integration

### 6.1 Why OAuth?

OAuth allows users to connect their ad accounts (Facebook, Google, etc.) **without giving us their passwords**. Instead:
1. User clicks "Connect Facebook"
2. User is redirected to Facebook
3. User logs in to Facebook and approves our app
4. Facebook redirects back to us with a **code**
5. We exchange the code for an **access token**
6. We can now call Facebook's API on their behalf

### 6.2 OAuth Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Frontend │     │  Edge    │     │ Facebook │
│          │     │          │     │ Function │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Click       │                │                │
     │    "Connect"   │                │                │
     │───────────────►│                │                │
     │                │                │                │
     │                │ 2. Generate OAuth URL          │
     │                │   (with state parameter)       │
     │                │                │                │
     │ 3. Redirect to Facebook                         │
     │◄───────────────│                │                │
     │                │                │                │
     │ 4. Redirect to Facebook ─────────────────────────►
     │                │                │                │
     │ 5. User logs in and approves                    │
     │◄────────────────────────────────────────────────│
     │                │                │                │
     │ 6. Facebook redirects with code + state         │
     │─────────────────────────────────────────────────►
     │                │                │                │
     │                │                │ 7. Validate state
     │                │                │    (check JWT, timestamp)
     │                │                │                │
     │                │                │ 8. Exchange code for token
     │                │                │───────────────►│
     │                │                │                │
     │                │                │ 9. Return access token
     │                │                │◄───────────────│
     │                │                │                │
     │                │                │ 10. Store token in DB
     │                │                │                │
     │                │ 11. Return success              │
     │                │◄───────────────│                │
     │                │                │                │
     │ 12. Show success message                        │
     │◄───────────────│                │                │
```

### 6.3 The `state` Parameter (CRITICAL!)

The `state` parameter is used to:
1. **Prevent CSRF attacks** - Verify the request came from us
2. **Pass data through the OAuth flow** - We encode user info in it

**Our state parameter format:**
```typescript
const state = btoa(JSON.stringify({
  userId: "uuid-of-current-user",
  jwt: "current-supabase-access-token",
  timestamp: Date.now(),
  nonce: "random-uuid-for-uniqueness"
}));
```

> ⚠️ **The state MUST be URL-encoded** because it contains special characters.

### 6.4 Frontend: Starting OAuth

**Location:** `src/services/platforms/oauth/url-generator.ts`

```typescript
export async function generateOAuthUrl(platform: Platform): Promise<string> {
  // 1. Get current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2. Build state parameter
  const stateData = {
    userId: session.user.id,
    jwt: session.access_token,
    timestamp: Date.now(),
    nonce: crypto.randomUUID()
  };
  const state = btoa(JSON.stringify(stateData));
  
  // 3. Build OAuth URL
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: 'https://api.alchemylab.app/facebook-oauth-callback',
    scope: 'ads_read,ads_management,business_management',
    response_type: 'code',
    state: state
  });
  
  return `https://www.facebook.com/v22.0/dialog/oauth?${params}`;
}
```

### 6.5 Backend: Handling the Callback

**Location:** `supabase/functions/facebook-oauth-callback/index.ts`

```typescript
async function handler(req: Request): Promise<Response> {
  // 1. Get code and state from URL
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state");
  
  // 2. Decode and validate state
  const state = JSON.parse(atob(decodeURIComponent(rawState)));
  
  // Check timestamp (must be within 5 minutes)
  if (Date.now() - state.timestamp > 5 * 60 * 1000) {
    return json({ error: "State expired" }, 401);
  }
  
  // 3. Verify JWT with Supabase
  const { data: { user } } = await supabase.auth.getUser(state.jwt);
  if (!user || user.id !== state.userId) {
    return json({ error: "Invalid session" }, 401);
  }
  
  // 4. Get user's organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  
  // 5. Exchange code for access token with Facebook
  const tokenResponse = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `client_secret=${FACEBOOK_APP_SECRET}&` +
    `code=${code}&` +
    `redirect_uri=${REDIRECT_URI}`
  );
  const { access_token, expires_in } = await tokenResponse.json();
  
  // 6. Store in database
  await supabase.from("platform_connections").upsert({
    platform: "facebook",
    organization_id: profile.organization_id,
    auth_token: access_token,  // Should be encrypted!
    token_expiry: new Date(Date.now() + expires_in * 1000),
    connected_by: user.id,
    connected: true
  });
  
  // 7. Return success
  return json({ success: true });
}
```

### 6.6 Security Checklist for OAuth

- [ ] **Never store tokens in localStorage** - Use server-side storage only
- [ ] **Always validate the state parameter** - Check JWT, timestamp, nonce
- [ ] **Encrypt tokens at rest** - Use AES-GCM encryption
- [ ] **Never log token values** - Mask them in logs
- [ ] **Use the exact redirect URI** - Must match what's registered in Facebook
- [ ] **Handle token refresh** - Tokens expire, implement refresh logic

---

## 7. Organizations & Multi-Tenancy

### 7.1 Data Isolation

AlchemyLab is **multi-tenant**, meaning multiple organizations share the same database. Data isolation is achieved through:

1. **`organization_id` Foreign Key:** Most tables have this column
2. **Row Level Security (RLS):** Database-level access control

### 7.2 RLS Policy Example

```sql
-- Users can only see their own organization's data
CREATE POLICY "Users can view own org connections"
ON platform_connections
FOR SELECT
USING (
  organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);
```

### 7.3 Organization-User Relationship

```
Organization "Acme Corp"
├── User A (admin)
├── User B (editor)
└── User C (viewer)

Organization "Beta Inc"
├── User D (admin)
└── User E (viewer)
```

**User A can NOT see data from "Beta Inc"** - RLS enforces this automatically.

### 7.4 Getting Organization ID in Code

```typescript
// In a React component
const { profile } = useAuth();
const organizationId = profile?.organization_id;

// In an Edge Function
const { data: profile } = await supabase
  .from("profiles")
  .select("organization_id")
  .eq("id", userId)
  .single();
const organizationId = profile.organization_id;
```

---

## 8. User Roles & Permissions (RBAC)

### 8.1 Available Roles

| Role | Description | Can Do |
|------|-------------|--------|
| **admin** | Full access | Everything including billing, team management |
| **editor** | Create and modify | Create campaigns, connect platforms, generate ads |
| **viewer** | Read-only | View dashboards, see insights (no edits) |

### 8.2 Checking Roles in Code

```typescript
// In AuthContext
const isAdmin = profile?.role === "admin";

// In a component
const { profile, isAdmin } = useAuth();

if (isAdmin) {
  // Show admin-only features
}

// Or with specific role check
if (profile?.role === "editor" || profile?.role === "admin") {
  // Show feature available to editors and admins
}
```

### 8.3 Role-Based UI Example

```tsx
function TeamPage() {
  const { profile, isAdmin } = useAuth();
  
  return (
    <div>
      <h1>Team Members</h1>
      <TeamList />
      
      {/* Only admins can invite new members */}
      {isAdmin && (
        <Button onClick={() => setShowInviteModal(true)}>
          Invite Team Member
        </Button>
      )}
    </div>
  );
}
```

### 8.4 Future: Object-Level ACL

Phase 2 will add more granular permissions:
- "User A can edit Campaign X but not Campaign Y"
- This is NOT implemented yet

---

## 9. Feature Modules

### 9.1 Dashboard (`/app`)

**Purpose:** Overview of account health and performance.

**Components:**
- `DashboardAlerts` - Shows warnings (stale accounts, low CTR)
- `AISuggestionsList` - AI-generated recommendations
- Performance Overview (placeholder)
- Recent Campaigns (placeholder)

**Data Hook:** `useDashboardData.ts`

```typescript
const {
  suggestionOfTheDay,
  activeCampaigns,
  campaignAnalytics,
  alerts: { lowCtrCampaigns, staleAccounts }
} = useDashboardData();
```

### 9.2 AI Insights (`/app/ai-insights`)

**Purpose:** View AI-generated insights about what's working and what's not.

**Features:**
- Filter by scope (Global, Organization, Client)
- Filter by type (Positive, Negative, Warning)
- View insights linked to specific campaigns/ads

**Data Hook:** `useAILearnings.ts`

**Database Table:** `ai_learnings`

### 9.3 AI Ad Creator (`/app/creator`)

**Purpose:** Generate ad copy using AI.

**Workflow:**
1. Select a Product Brief (pre-defined product info)
2. Select target platforms (Meta, Google, TikTok, etc.)
3. Optionally set angle (urgency, curiosity, etc.)
4. Select language
5. Click "Generate"
6. View and copy generated ad variations

**Data Hook:** `useAdGenerator.ts`

**Current Status:** Mock implementation - needs OpenAI integration.

### 9.4 Settings (`/app/settings`)

**Tabs:**
- **Profile** - User's personal info
- **Integrations** - Connect/disconnect platforms
- **Product Brief** - Define products for ad generation
- **Company Brief** - Organization info
- **Notifications** - Notification preferences
- **Security** - Password, 2FA (future)
- **Billing** - Subscription management

### 9.5 Team Management (`/app/team`)

**Purpose:** Manage organization members.

**Features:**
- View team members
- Change member roles (admin only)
- Invite new members (admin only)

**Data Hook:** `useTeam.ts`

**Edge Function:** `invite-team-member`

### 9.6 Platform Integrations

**Purpose:** Connect advertising and analytics platforms.

**Supported Platforms:**

| Platform | Auth Type | Status |
|----------|-----------|--------|
| Facebook Ads | OAuth | ✅ Implemented |
| Google Ads | OAuth | 🔲 Not started |
| TikTok Ads | OAuth | 🔲 Not started |
| LinkedIn Ads | OAuth | 🔲 Not started |
| Google Analytics | OAuth | 🔲 Not started |
| Mixpanel | API Key | 🔲 Not started |
| Amplitude | API Key | 🔲 Not started |
| OpenAI | API Key | 🔲 Not started |

**Context:** `PlatformsContext.tsx`

---

## 10. API & Edge Functions

### 10.1 What are Edge Functions?

Edge Functions are serverless functions that run on Supabase's edge network. They're written in TypeScript/Deno and can:
- Handle OAuth callbacks
- Process webhooks
- Send emails
- Perform server-side validation

### 10.2 Available Edge Functions

| Function | Purpose | Endpoint |
|----------|---------|----------|
| `facebook-oauth-callback` | Handle Facebook OAuth | `/facebook-oauth-callback` |
| `oauth-callback` | Generic OAuth handler | `/oauth-callback` |
| `refresh-token` | Refresh expired tokens | `/refresh-token` |
| `invite-team-member` | Send invitation emails | `/invite-team-member` |

### 10.3 Calling Edge Functions

```typescript
// From frontend
const { data, error } = await supabase.functions.invoke('refresh-token', {
  body: {
    platform: 'facebook',
    refreshToken: 'xxx'
  }
});
```

### 10.4 Edge Function Structure

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  
  // 2. Get environment variables
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  // 3. Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // 4. Your logic here
    const body = await req.json();
    
    // 5. Return response
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

---

## 11. Current Implementation Status

### 11.1 What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ Complete | Email/password login via Supabase |
| User Profile | ✅ Complete | Auto-created on first login |
| Platform Connections UI | ✅ Complete | Connect/disconnect buttons |
| Dashboard Layout | ✅ Complete | Sidebar, topbar, responsive |
| AI Insights Page | ✅ Complete | View insights with filters |
| Team Management | ✅ Complete | List, invite, change roles |
| Pricing Page | ✅ Complete | Public pricing display |
| Landing Pages | ✅ Complete | Homepage, Features, Pricing |

### 11.2 What's In Progress

| Feature | Status | What's Left |
|---------|--------|-------------|
| **Facebook OAuth** | 🟡 Attempted | Flow exists but not yet successful end-to-end |
| AI Ad Generator | 🟡 Partial | OpenAI API integration needed (currently mock data) |
| Dashboard Widgets | 🟡 Partial | Placeholders need real data |
| Data Ingestion | 🟡 Partial | Architecture defined but not implemented |

### 11.3 What's Not Started

| Feature | Priority | Notes |
|---------|----------|-------|
| Google Ads OAuth | P1 | Google Cloud project exists |
| TikTok Ads OAuth | P1 | Need TikTok developer account |
| LinkedIn Ads OAuth | P2 | Lower priority |
| GA4 Integration | P1 | OAuth needed |
| Account Audit | P2 | Agency feature, scoring TBD |
| Stripe Billing | P3 | Needed for paid tiers |
| GDPR Export/Delete | P3 | Compliance requirement |
| Tier Limit Enforcement | P2 | Currently not enforced anywhere |
| Audit Logging | P2 | Required for SOC2 |
| Data Sync Cron | P1 | Near-real-time data pulls |

---

## 12. Known Issues & Technical Debt

### 12.1 Schema Alignment Issue

**Problem:** There's a mismatch between `platform_connections` and `ad_accounts` tables.

- `platform_connections` stores OAuth tokens per organization
- `ad_accounts` stores individual ad accounts per client
- `product_brief_accounts` references `ad_accounts` but code uses `platform_connections`

**Current Workaround:** The Facebook OAuth callback creates both a `platform_connection` AND an `ad_account` record.

**Recommended Fix:** See `SCHEMA_ALIGNMENT_NOTES.md` for options.

### 12.2 Token Encryption

**Problem:** Tokens should be encrypted at rest, but encryption is optional (depends on `ENCRYPTION_KEY` env var).

**Fix:** Ensure `ENCRYPTION_KEY` is set in production.

### 12.3 OAuth State Inconsistency

**Problem:** `oauth-callback` (generic) expects state to be the platform name, but `facebook-oauth-callback` expects JSON state.

**Fix:** Update `oauth-callback` to decode JSON state consistently.

### 12.4 Mock Data in Ad Generator

**Problem:** `useAdGenerator.ts` returns mock data instead of calling OpenAI.

**Fix:** Implement actual OpenAI API call or create an Edge Function for it.

---

## 13. Architecture Improvement Recommendations

> 💡 **This section contains suggestions for improving the codebase.** These are not bugs, but opportunities to make the system more robust, maintainable, and production-ready.

### 13.1 Database Schema Improvements

#### 13.1.1 Rename `plan` Enum Values

**Current:** `trial`, `basic`, `pro`, `enterprise`  
**Recommended:** `trial`, `starter`, `pro`, `enterprise`

The UI uses "Starter" but the database has "basic". Align these:

```sql
-- Migration
ALTER TYPE organization_plan RENAME VALUE 'basic' TO 'starter';
```

#### 13.1.2 Clarify `platform_connections` vs `ad_accounts`

**Problem:** These two tables have overlapping purposes, causing confusion.

**Current Architecture:**
```
platform_connections → OAuth tokens (org-level, one per platform)
ad_accounts → Individual ad accounts (client-level, multiple per platform)
```

**Recommended Architecture:**
```
oauth_connections (renamed from platform_connections)
├── Stores OAuth tokens only
├── One per organization+platform combination
└── Used for API authentication

ad_accounts
├── Created AFTER fetching from platform API
├── Multiple per oauth_connection (one user can have many FB ad accounts)
├── Links to oauth_connection_id (new FK)
└── Used for data display and selection
```

**New Schema:**
```sql
-- Rename for clarity
ALTER TABLE platform_connections RENAME TO oauth_connections;

-- Add relationship
ALTER TABLE ad_accounts 
ADD COLUMN oauth_connection_id UUID REFERENCES oauth_connections(id);
```

**Workflow:**
1. User connects Facebook → creates `oauth_connection`
2. System calls Facebook API to list ad accounts → creates `ad_accounts` records
3. User selects which ad accounts to sync → updates `ad_accounts.is_active`

#### 13.1.3 Add Missing Tables for Production

**`audit_logs` - Required for SOC2:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,           -- 'oauth.connect', 'team.invite', 'settings.update'
  resource_type TEXT,             -- 'platform_connection', 'campaign', 'user'
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  correlation_id UUID,            -- Link related actions
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);
```

**`data_sync_runs` - Track ingestion:**
```sql
CREATE TABLE data_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  oauth_connection_id UUID REFERENCES oauth_connections(id),
  ad_account_id UUID REFERENCES ad_accounts(id),
  platform TEXT NOT NULL,
  status TEXT NOT NULL,           -- 'running', 'success', 'failed', 'rate_limited'
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  records_fetched INTEGER,
  records_created INTEGER,
  records_updated INTEGER,
  error_message TEXT,
  error_details JSONB,
  correlation_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**`ai_generations` - Track AI usage:**
```sql
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  generation_type TEXT NOT NULL,  -- 'ad_copy', 'insight', 'audit_report'
  input_prompt TEXT,              -- Sanitized (no secrets!)
  output_content JSONB,
  model_used TEXT,                -- 'gpt-4o', 'dall-e-3'
  tokens_used INTEGER,
  latency_ms INTEGER,
  status TEXT,                    -- 'success', 'failed', 'filtered'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_gen_org_date ON ai_generations(organization_id, created_at DESC);
```

**`oauth_nonces` - Prevent replay attacks:**
```sql
CREATE TABLE oauth_nonces (
  nonce UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false
);

-- Auto-cleanup old nonces
CREATE INDEX idx_oauth_nonces_expires ON oauth_nonces(expires_at);
```

#### 13.1.4 Add `ai_insights` Table (Separate from `ai_learnings`)

**Reasoning:** The current `ai_learnings` table stores historical patterns. We also need `ai_insights` for actionable, time-bound recommendations.

```sql
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  client_id UUID REFERENCES clients(id),
  
  -- Scope
  platform TEXT,
  ad_account_id UUID REFERENCES ad_accounts(id),
  campaign_id UUID REFERENCES campaigns(id),
  ad_id UUID REFERENCES ads(id),
  
  -- Content
  insight_type TEXT NOT NULL,     -- 'anomaly', 'fatigue', 'budget_pacing', 'opportunity'
  severity TEXT,                  -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommended_action TEXT,
  
  -- Metadata
  confidence DECIMAL(3,2),        -- 0.00 to 1.00
  data_window_start TIMESTAMPTZ,
  data_window_end TIMESTAMPTZ,
  source_metrics JSONB,           -- The data that triggered this insight
  
  -- Lifecycle
  status TEXT DEFAULT 'active',   -- 'active', 'dismissed', 'actioned'
  actioned_at TIMESTAMPTZ,
  actioned_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 13.2 Security Improvements

#### 13.2.1 Make Token Encryption Mandatory

**Current:** Encryption is optional (only if `ENCRYPTION_KEY` is set).  
**Recommended:** Fail deployment if `ENCRYPTION_KEY` is missing.

```typescript
// In Edge Function
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is required in production');
}
```

#### 13.2.2 Add Nonce Verification for OAuth

**Current:** Nonce is generated but never verified.  
**Recommended:** Store nonces in DB, verify on callback.

```typescript
// When generating OAuth URL
const nonce = crypto.randomUUID();
await supabase.from('oauth_nonces').insert({
  nonce,
  user_id: session.user.id,
  platform: 'facebook',
  expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 min
});

// In callback
const { data: nonceRecord } = await supabase
  .from('oauth_nonces')
  .select('*')
  .eq('nonce', state.nonce)
  .eq('used', false)
  .single();

if (!nonceRecord || new Date(nonceRecord.expires_at) < new Date()) {
  return json({ error: 'Invalid or expired nonce' }, 401);
}

// Mark as used
await supabase
  .from('oauth_nonces')
  .update({ used: true })
  .eq('nonce', state.nonce);
```

#### 13.2.3 Add Rate Limiting

**Recommended:** Add rate limiting to Edge Functions to prevent abuse.

```typescript
// Simple in-memory rate limit (for single instance)
// For production, use Redis or Supabase cache
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimits.get(key);
  
  if (!record || record.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}
```

---

### 13.3 Missing Features from Requirements

Based on `.cursorrules`, these features are required but not implemented:

#### 13.3.1 Tier Limit Enforcement

**Frontend (disable button):**
```typescript
// In IntegrationsTab.tsx
const { connections } = usePlatforms();
const { profile } = useAuth();

const tierLimits = {
  starter: 1,
  pro: 5,
  enterprise: Infinity
};

const currentPlan = profile?.organization?.plan || 'starter';
const limit = tierLimits[currentPlan];
const canConnect = connections.filter(c => c.connected).length < limit;

// In render
<Button 
  onClick={() => handleConnect(platform)}
  disabled={!canConnect}
>
  {canConnect ? 'Connect' : 'Upgrade to connect more'}
</Button>
```

**Backend (reject in Edge Function):**
```typescript
// In OAuth callback
const { count } = await supabase
  .from('oauth_connections')
  .select('*', { count: 'exact' })
  .eq('organization_id', orgId)
  .eq('connected', true);

const { data: org } = await supabase
  .from('organizations')
  .select('plan')
  .eq('id', orgId)
  .single();

const limits = { starter: 1, pro: 5, enterprise: Infinity };
if (count >= limits[org.plan]) {
  return json({ 
    error: 'Tier limit reached',
    message: `Your ${org.plan} plan allows ${limits[org.plan]} connected accounts. Please upgrade.`
  }, 403);
}
```

#### 13.3.2 GDPR Endpoints

**Required by compliance:**

```typescript
// Edge Function: gdpr-export
// GET /gdpr/export
async function exportUserData(userId: string, orgId: string) {
  const data = {
    profile: await supabase.from('profiles').select('*').eq('id', userId).single(),
    campaigns: await supabase.from('campaigns').select('*').eq('organization_id', orgId),
    ai_suggestions: await supabase.from('ai_suggestions').select('*')
      .in('ad_id', /* ads belonging to org */),
    // ... all user-related data
  };
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="alchemylab-export.json"'
    }
  });
}

// Edge Function: gdpr-delete
// DELETE /gdpr/account
async function deleteUserData(userId: string) {
  // 1. Anonymize PII (don't delete for audit trail)
  await supabase.from('profiles').update({
    email: `deleted_${userId}@anonymized.local`,
    full_name: 'Deleted User'
  }).eq('id', userId);
  
  // 2. Delete actual content
  // ... cascade deletes based on your retention policy
  
  // 3. Log the deletion (for audit)
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'gdpr.delete',
    resource_type: 'user',
    resource_id: userId
  });
}
```

#### 13.3.3 Structured Logging

**Current:** `console.log` with inconsistent format.  
**Recommended:** Structured JSON logs.

```typescript
// utils/logger.ts (Edge Function version)
interface LogContext {
  correlationId?: string;
  orgId?: string;
  userId?: string;
  platform?: string;
  action?: string;
}

function log(level: 'info' | 'warn' | 'error', message: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };
  console.log(JSON.stringify(entry));
}

// Usage
log('info', 'OAuth callback started', {
  correlationId: crypto.randomUUID(),
  platform: 'facebook',
  userId: user.id,
  action: 'oauth.callback'
});
```

---

### 13.4 Tool & Library Suggestions

#### 13.4.1 Add Form Validation Library

**Current:** Ad-hoc validation.  
**Recommended:** Use Zod + React Hook Form consistently.

```bash
npm install zod react-hook-form @hookform/resolvers
```

```typescript
// Example: ProductBriefForm
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productBriefSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(2000).optional(),
  targetAudience: z.string().max(500).optional(),
  targetLocations: z.string().max(200).optional()
});

type ProductBriefForm = z.infer<typeof productBriefSchema>;

function ProductBriefForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductBriefForm>({
    resolver: zodResolver(productBriefSchema)
  });
  
  // ...
}
```

#### 13.4.2 Add Error Tracking (Sentry)

**Current:** Errors only in console.  
**Recommended:** Sentry for production error tracking.

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1
  });
}
```

#### 13.4.3 Consider Zustand for Complex State

**Current:** React Context for everything.  
**Issue:** Context causes unnecessary re-renders.  
**Recommended:** Keep Context for auth, use Zustand for complex UI state.

```bash
npm install zustand
```

```typescript
// stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null })
}));
```

---

### 13.5 Data Ingestion Architecture

**The `.cursorrules` specifies a 3-layer approach:**

```
Layer 1: Raw Ingestion Tables
├── Store original API responses
├── Keep full payload as JSONB
└── Used for debugging and reprocessing

Layer 2: Normalized Metrics Tables
├── Standard schema across platforms
├── Columns: spend, impressions, clicks, conversions, ctr, cpc, cpm
└── Used for cross-platform comparison

Layer 3: Aggregated Views
├── Materialized views or summary tables
├── Pre-computed daily/weekly/monthly aggregates
└── Used for fast dashboard queries
```

**Recommended Tables:**

```sql
-- Layer 1: Raw data
CREATE TABLE raw_platform_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_run_id UUID REFERENCES data_sync_runs(id),
  platform TEXT NOT NULL,
  ad_account_id UUID REFERENCES ad_accounts(id),
  entity_type TEXT NOT NULL,      -- 'campaign', 'adset', 'ad', 'insights'
  entity_id TEXT NOT NULL,        -- Platform's ID
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Layer 2: Normalized metrics (already exists as analytics_snapshots)
-- Consider adding these columns:
ALTER TABLE analytics_snapshots ADD COLUMN cpc DECIMAL(10,4);
ALTER TABLE analytics_snapshots ADD COLUMN cpm DECIMAL(10,4);
ALTER TABLE analytics_snapshots ADD COLUMN frequency DECIMAL(10,4);
ALTER TABLE analytics_snapshots ADD COLUMN reach INTEGER;

-- Layer 3: Aggregated view
CREATE MATERIALIZED VIEW daily_metrics_summary AS
SELECT 
  date_trunc('day', date) as day,
  organization_id,
  platform,
  SUM(cost) as total_spend,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  SUM(conversions) as total_conversions,
  SUM(cost) / NULLIF(SUM(clicks), 0) as avg_cpc,
  SUM(clicks)::float / NULLIF(SUM(impressions), 0) * 100 as avg_ctr
FROM analytics_snapshots
JOIN campaigns ON campaigns.id = analytics_snapshots.campaign_id
JOIN ad_accounts ON ad_accounts.id = campaigns.ad_account_id
JOIN clients ON clients.id = ad_accounts.client_id
GROUP BY 1, 2, 3;

-- Refresh daily
-- REFRESH MATERIALIZED VIEW daily_metrics_summary;
```

---

### 13.6 Recommendations Summary

| Category | Priority | Effort | Impact |
|----------|----------|--------|--------|
| Tier limit enforcement | 🔴 High | Medium | Prevents revenue leakage |
| Token encryption mandatory | 🔴 High | Low | Security requirement |
| Audit logging | 🔴 High | Medium | SOC2 requirement |
| Schema alignment (oauth/accounts) | 🟡 Medium | High | Reduces confusion |
| Nonce verification | 🟡 Medium | Low | Security improvement |
| GDPR endpoints | 🟡 Medium | Medium | Compliance requirement |
| Structured logging | 🟡 Medium | Low | Debugging improvement |
| Sentry integration | 🟢 Low | Low | Better error visibility |
| Zod/RHF standardization | 🟢 Low | Medium | Code quality |
| Zustand for UI state | 🟢 Low | Medium | Performance |

---

### 13.7 AI Memory System Implementation

The `.cursorrules` requires AI to have "memory" - learning from past insights to avoid repeating mistakes and reinforce good patterns.

**Recommended Approach:**

```typescript
// When generating new insights
async function generateInsightsWithMemory(orgId: string, campaignData: any) {
  // 1. Fetch recent insights for this org
  const { data: recentInsights } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  // 2. Separate good vs bad patterns
  const goodPatterns = recentInsights
    .filter(i => i.insight_type === 'positive')
    .map(i => i.description);
  
  const badPatterns = recentInsights
    .filter(i => i.insight_type === 'negative')
    .map(i => i.description);
  
  // 3. Include context in prompt
  const prompt = `
    Analyze this campaign data: ${JSON.stringify(campaignData)}
    
    IMPORTANT CONTEXT:
    - Things that have worked well for this org: ${goodPatterns.join('; ')}
    - Things to avoid (learned from past mistakes): ${badPatterns.join('; ')}
    
    Generate actionable insights. Do NOT repeat known bad patterns.
  `;
  
  // 4. Call OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  });
  
  return response;
}
```

---

### 13.8 Account Audit Feature Design

The Account Audit feature is for agency pre-sales - allowing quick assessment of a prospect's ad account health.

#### Audit Categories

| Category | Weight | Checks |
|----------|--------|--------|
| **Campaign Structure** | 20% | Naming conventions, campaign count, ad group structure |
| **Budget Management** | 20% | Budget utilization, pacing, daily vs lifetime |
| **Creative Health** | 20% | Ad fatigue score, creative diversity, asset quality |
| **Targeting** | 15% | Audience overlap, geographic coverage, demographic spread |
| **Tracking** | 15% | Pixel/conversion setup, attribution gaps |
| **Performance** | 10% | CTR benchmarks, CPA trends, ROAS |

#### Audit Output Structure

```typescript
interface AccountAudit {
  id: string;
  organization_id: string;
  ad_account_id: string;
  
  overall_score: number;  // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  categories: {
    campaign_structure: CategoryScore;
    budget_management: CategoryScore;
    creative_health: CategoryScore;
    targeting: CategoryScore;
    tracking: CategoryScore;
    performance: CategoryScore;
  };
  
  critical_issues: AuditIssue[];
  recommendations: AuditRecommendation[];
  
  generated_at: string;
  data_range: { start: string; end: string };
}

interface CategoryScore {
  score: number;
  weight: number;
  findings: string[];
  suggestions: string[];
}
```

---

## 14. Development Phases

### Phase 0: Foundation Hardening (Current)

**Goal:** Get the core platform working reliably and add essential tooling.

#### Phase 0a: Tooling & Dependencies

| Task | Status | Command/Notes |
|------|--------|---------------|
| Install Zod | 🔲 Not started | `npm install zod` |
| Install react-hook-form | 🔲 Not started | `npm install react-hook-form @hookform/resolvers` |
| Install Tremor charts | 🔲 Not started | `npm install @tremor/react` |
| Install Sentry | 🔲 Not started | `npm install @sentry/react` |
| Configure Sentry | 🔲 Not started | Add `VITE_SENTRY_DSN` env var |
| Update pricingData.ts | 🔲 Not started | Change ad account limits to 3/7/∞ |

**One-liner to install all:**
```bash
npm install zod react-hook-form @hookform/resolvers @tremor/react @sentry/react
```

#### Phase 0b: Core Functionality

| Task | Status | Notes |
|------|--------|-------|
| Facebook OAuth flow | 🟡 In Progress | Attempted but not yet successful |
| Organization linking | ✅ Done | Users linked to orgs |
| Schema alignment | 🔲 Not started | See Section 13.1.2 |
| Token encryption mandatory | 🔲 Not started | See Section 13.2.1 |
| Basic error handling | 🟡 Partial | Needs consistency |
| Audit logging table | 🔲 Not started | See Section 13.1.3 |

**Exit Criteria:**
- [ ] All new packages installed and configured
- [ ] Sentry capturing errors in production
- [ ] A user can successfully connect a Facebook ad account
- [ ] Connection is stored encrypted in database
- [ ] User can see the connection in Settings
- [ ] User can disconnect
- [ ] At least one form refactored to use Zod + react-hook-form

### Phase 1: Multi-Platform + AI Foundation

**Goal:** Connect additional platforms and enable basic AI features.

| Task | Priority | Dependency |
|------|----------|------------|
| Google Ads OAuth | P1 | Phase 0 complete |
| GA4 OAuth | P1 | Phase 0 complete |
| TikTok Ads OAuth | P1 | Phase 0 complete |
| Tier limit enforcement | P1 | None |
| OpenAI ad generation | P1 | API key storage |
| Daily AI insight cron | P2 | Data ingestion |
| Data sync architecture | P1 | Platform connections |

**Exit Criteria:**
- [ ] 3+ platforms connectable
- [ ] Real ad copy generated via OpenAI
- [ ] Tier limits enforced (can't exceed plan limits)

### Phase 2: Data & Insights

**Goal:** Pull real data and surface actionable insights.

| Task | Priority | Dependency |
|------|----------|------------|
| Data ingestion (Layer 1-3) | P1 | Platform connections |
| Cross-platform dashboard | P1 | Data ingestion |
| AI insights generation | P1 | Data + OpenAI |
| Account Audit MVP | P2 | Data ingestion |
| GDPR endpoints | P2 | Audit logging |
| Creative fatigue detection | P2 | Data ingestion |

**Exit Criteria:**
- [ ] Dashboard shows real metrics from connected accounts
- [ ] AI generates relevant insights based on actual data
- [ ] User can export their data (GDPR)

### Phase 3: Advanced Features & Monetization

**Goal:** Production-ready with billing.

| Task | Priority | Dependency |
|------|----------|------------|
| Stripe billing integration | P1 | Tier enforcement |
| Image generation (DALL-E 3) | P2 | Text generation working |
| Video generation placeholder | P3 | Research needed |
| ASO module | P3 | Backlog |
| Creative Library | P2 | Asset storage |
| SOC-2 documentation | P1 | Audit logging |
| Usage tracking & analytics | P1 | AI generations table |

**Exit Criteria:**
- [ ] Users can subscribe and pay
- [ ] System tracks usage against limits
- [ ] SOC-2 audit checklist documented

### Recommended Phase 0 Priorities

Based on the current state, here's a suggested order for Phase 0:

1. **Install new packages** - Zod, react-hook-form, Tremor, Sentry
2. **Debug Facebook OAuth** - Get one integration working end-to-end
3. **Make encryption mandatory** - Can't launch without this
4. **Add audit logging** - Start tracking early
5. **Implement tier limits** - Prevent feature creep issues
6. **Clean up schema** - While codebase is small
7. **Refactor one form with Zod** - Establish the pattern

---

## 15. Coding Standards

### 15.1 TypeScript

```typescript
// ✅ DO: Use explicit types
function getUser(userId: string): Promise<User | null> {
  // ...
}

// ❌ DON'T: Use 'any'
function getUser(userId: any): any {
  // ...
}
```

### 15.2 Form Handling (NEW PATTERN)

**All new forms should use Zod + react-hook-form.** This is the standard pattern:

```typescript
// ✅ DO: Use Zod schema + react-hook-form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// 1. Define schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  budget: z.number().min(0, 'Budget must be positive').optional(),
});

// 2. Infer type from schema
type FormValues = z.infer<typeof formSchema>;

// 3. Create form component
function MyForm({ onSubmit }: { onSubmit: (data: FormValues) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

```typescript
// ❌ DON'T: Use ad-hoc useState for form handling
function BadForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const handleSubmit = () => {
    // Manual validation logic scattered everywhere
    if (!name) setNameError('Required');
    if (!email.includes('@')) setEmailError('Invalid');
    // ...this doesn't scale
  };
}
```

### 15.3 Error Handling

```typescript
// ✅ DO: Handle errors with user-friendly messages
try {
  await connectPlatform(platform);
} catch (error) {
  console.error('Platform connection failed:', error);
  Sentry.captureException(error); // Report to Sentry
  toast.error('Connection Failed', {
    description: `Unable to connect to ${platform}. Please try again.`
  });
}

// ❌ DON'T: Swallow errors silently
try {
  await connectPlatform(platform);
} catch (error) {
  // Silent failure - user has no idea what happened
}
```

### 15.4 Component Structure

```tsx
// ✅ DO: Keep components focused
function UserAvatar({ user }: { user: User }) {
  return <Avatar src={user.avatarUrl} alt={user.name} />;
}

function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <UserAvatar user={user} />
      <h3>{user.name}</h3>
    </Card>
  );
}

// ❌ DON'T: Create god components that do everything
function UserEverything({ user, campaigns, insights, settings, ... }) {
  // 500 lines of code
}
```

### 15.5 Hooks

```typescript
// ✅ DO: Create custom hooks for reusable logic
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

// ❌ DON'T: Duplicate logic across components
```

### 15.6 API Calls

```typescript
// ✅ DO: Use TanStack Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['campaigns', organizationId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data;
  },
  enabled: !!organizationId
});

// ❌ DON'T: Use useEffect + useState for data fetching
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchData().then(setData).finally(() => setLoading(false));
}, []);
```

---

## 16. Testing Guidelines

### 16.1 What to Test

| Priority | What | How |
|----------|------|-----|
| **High** | OAuth flows | Manual testing with real accounts |
| **High** | Authentication | Unit tests for auth context |
| **Medium** | Data fetching hooks | Mock Supabase, test queries |
| **Medium** | UI components | React Testing Library |
| **Low** | Utility functions | Jest unit tests |

### 16.2 Manual Testing Checklist

Before deploying, verify:

- [ ] Can sign up with new email
- [ ] Can sign in with existing account
- [ ] Can sign out
- [ ] Can connect Facebook (OAuth flow)
- [ ] Can disconnect Facebook
- [ ] Can view dashboard after login
- [ ] Can navigate all pages without errors
- [ ] Can invite team member (admin only)
- [ ] Proper error messages on failures

---

## 17. Deployment

### 17.1 Environment Variables

**Frontend (`.env.local`):**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_FACEBOOK_APP_ID=xxx
VITE_FACEBOOK_REDIRECT_URI=https://api.alchemylab.app/facebook-oauth-callback
```

**Edge Functions (Supabase Dashboard → Settings → Edge Functions):**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx  # ⚠️ NEVER expose this!
FACEBOOK_REDIRECT_URI=https://api.alchemylab.app/facebook-oauth-callback
ENCRYPTION_KEY=base64-encoded-32-byte-key
```

### 17.2 Build & Deploy

```bash
# Build the frontend
npm run build

# The build output goes to dist/
# Deploy to your hosting (Nginx, Vercel, etc.)
```

### 17.3 Supabase Edge Functions Deployment

```bash
# Deploy a specific function
supabase functions deploy facebook-oauth-callback

# Deploy all functions
supabase functions deploy
```

---

## Glossary

| Term | Definition |
|------|------------|
| **RLS** | Row Level Security - Database-level access control |
| **JWT** | JSON Web Token - Encoded token for authentication |
| **OAuth** | Open Authorization - Protocol for third-party access |
| **Edge Function** | Serverless function running on Supabase's edge network |
| **RBAC** | Role-Based Access Control |
| **Multi-tenant** | Multiple organizations sharing the same infrastructure |
| **CTR** | Click-Through Rate |
| **ROAS** | Return On Ad Spend |
| **ASO** | App Store Optimization |

---

## Getting Help

1. **Check this document first** - Most common questions are answered here
2. **Search the codebase** - Use `grep` or IDE search
3. **Check Supabase docs** - [supabase.com/docs](https://supabase.com/docs)
4. **Ask your team lead** - For architecture decisions

---

*Document maintained by the AlchemyLab team. Last updated January 2026.*
