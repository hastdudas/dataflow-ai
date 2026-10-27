'use client'

import { createBrowserClient } from '@supabase/ssr'
import { requirePublic } from '@/lib/env'

export function createClient() {
  return createBrowserClient(
    requirePublic('supabaseUrl', 'NEXT_PUBLIC_SUPABASE_URL'),
    requirePublic('supabaseAnonKey', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  )
}
