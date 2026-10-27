import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/account'
import { getStripe } from '@/lib/stripe'
import { siteUrl } from '@/lib/env'
import { anonId, log } from '@/lib/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 })
  }

  try {
    const profile = await getProfile(user.id, user.email ?? null)
    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'お支払い情報がまだありません。まずはプランをご購入ください。' },
        { status: 400 },
      )
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl()}/dashboard/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    log.error('portal.error', {
      user: anonId(user.id),
      reason: error instanceof Error ? error.name : 'unknown',
    })
    return NextResponse.json(
      { error: 'お支払い管理ページを開けませんでした。' },
      { status: 500 },
    )
  }
}
