import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { requirePublic } from '@/lib/env'
import type { CookieToSet } from '@/lib/supabase/cookies'

/** Supabase client bound to the caller's session cookies. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    requirePublic('supabaseUrl', 'NEXT_PUBLIC_SUPABASE_URL'),
    requirePublic('supabaseAnonKey', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component: middleware refreshes the
            // session instead, so this can be safely ignored.
          }
        },
      },
    },
  )
}
