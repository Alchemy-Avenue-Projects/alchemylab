/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly BASE_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_FACEBOOK_APP_ID?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_LINKEDIN_CLIENT_ID?: string
  readonly VITE_TIKTOK_CLIENT_ID?: string
  readonly VITE_SUPABASE_FUNCTION_URL?: string
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
