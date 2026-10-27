import { createAdminClient } from '@/lib/supabase/admin'
import { PLAN_LIMITS } from '@/lib/env'
import type { Plan, Profile, UsageLog } from '@/lib/types'

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export type AccountState = {
  profile: Profile
  plan: Plan
  limit: number
  used: number
  remaining: number
  periodLabel: string
}

/** First day of the current calendar month, in UTC. */
function periodStart(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export async function getProfile(
  userId: string,
  email: string | null,
): Promise<Profile> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('profiles')
    .select(
      'id, email, plan, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (data) return data as Profile

  // The DB trigger normally creates this row; recreate it defensively.
  const { data: inserted, error: insertError } = await admin
    .from('profiles')
    .insert({ id: userId, email })
    .select(
      'id, email, plan, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end',
    )
    .single()

  if (insertError) throw new Error(insertError.message)
  return inserted as Profile
}

export function planOf(profile: Profile): Plan {
  const status = profile.subscription_status ?? ''
  return profile.plan === 'pro' && ACTIVE_STATUSES.has(status) ? 'pro' : 'free'
}

export async function getAccountState(
  userId: string,
  email: string | null,
): Promise<AccountState> {
  const profile = await getProfile(userId, email)
  const plan = planOf(profile)
  const limit = plan === 'pro' ? PLAN_LIMITS.pro : PLAN_LIMITS.free

  const admin = createAdminClient()
  const { count, error } = await admin
    .from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'succeeded')
    .gte('created_at', periodStart().toISOString())

  if (error) throw new Error(error.message)

  const used = count ?? 0
  const now = new Date()

  return {
    profile,
    plan,
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    periodLabel: `${now.getFullYear()}年${now.getMonth() + 1}月`,
  }
}

export async function listUsage(
  userId: string,
  limit = 50,
): Promise<UsageLog[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('usage_logs')
    .select('id, user_id, kind, file_name, file_size, status, summary, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as UsageLog[]
}

export async function recordUsage(entry: {
  userId: string
  kind: UsageLog['kind']
  fileName: string
  fileSize: number
  status: UsageLog['status']
  summary: string | null
}): Promise<void> {
  const admin = createAdminClient()
  await admin.from('usage_logs').insert({
    user_id: entry.userId,
    kind: entry.kind,
    file_name: entry.fileName,
    file_size: entry.fileSize,
    status: entry.status,
    summary: entry.summary,
  })
}
