import { createClient } from '@supabase/supabase-js'
import { requireEnv, requirePublic } from '@/lib/env'

/**
 * Service-role client. Bypasses RLS - use only in trusted server code
 * (Stripe webhook, usage accounting). Never import from a Client Component.
 */
export function createAdminClient() {
  return createClient(
    requirePublic('supabaseUrl', 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
