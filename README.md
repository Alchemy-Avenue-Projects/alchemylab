# AlchemyLab

AlchemyLab is a marketing platform that allows you to manage and analyze your ad campaigns across multiple platforms (Facebook, TikTok, LinkedIn, Google).

## Features

- **Multi-platform Integration**: Connect and sync ads from Facebook, TikTok, LinkedIn, and Google.
- **Analytics Dashboard**: Visualize campaign performance with charts and metrics.
- **AI Suggestions**: Get AI-powered recommendations to optimize your ad copy and targeting.
- **Campaign Management**: Create, edit, and manage campaigns directly from the platform.
- **Team Collaboration**: Invite team members and manage permissions.

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons, Recharts
- **State Management**: React Query (TanStack Query), React Context
- **Backend/Auth**: Supabase (Auth, Database, Edge Functions)

## Development

### Prerequisites

- Node.js 20+ (managed via `.nvmrc`)
- npm

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory based on `.env.example` (if available) or ask a team member for the keys.  
   Required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

### Code Quality

- **Linting**: `npm run lint`
- **Type Checking**: `npm run typecheck`
- **Testing**: `npm run test` (placeholder)

## Project Structure

- `/src/components`: Reusable UI components and feature-specific components
- `/src/pages`: Main application pages (Dashboard, Campaigns, Settings, etc.)
- `/src/hooks`: Custom React hooks (including consolidated toast hooks)
- `/src/services`: API service layers and integrations
- `/src/utils`: Utility functions (logging, formatting, environmental vars)
- `/src/contexts`: React Context providers (Auth, Platforms)
- `/supabase`: Supabase configuration and Edge Functions

## Deployment

The application is deployed via Supabase. Edge functions can be deployed using the Supabase CLI:

```bash
supabase functions deploy <function-name>
```
