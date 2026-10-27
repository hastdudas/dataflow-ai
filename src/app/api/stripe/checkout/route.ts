import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/account'
import { getStripe } from '@/lib/stripe'
import { requireEnv, siteUrl } from '@/lib/env'
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
    const stripe = getStripe()
    const profile = await getProfile(user.id, user.email ?? null)

    let customerId = profile.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await createAdminClient()
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const origin = siteUrl()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: requireEnv('STRIPE_PRICE_ID'), quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
    })

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL')
    }

    log.info('checkout.created', { user: anonId(user.id) })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    log.error('checkout.error', {
      user: anonId(user.id),
      reason: error instanceof Error ? error.name : 'unknown',
    })
    return NextResponse.json(
      { error: '決済ページを開けませんでした。時間をおいて再度お試しください。' },
      { status: 500 },
    )
  }
}
