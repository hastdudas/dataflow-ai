import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireEnv } from '@/lib/env'
import { anonId, log } from '@/lib/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>([
  'active',
  'trialing',
])

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

/** Finds the Supabase user id for a subscription, by metadata or customer id. */
async function resolveUserId(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.supabase_user_id
  if (fromMetadata) return fromMetadata

  const customerId = idOf(subscription.customer)
  if (!customerId) return null

  const { data } = await createAdminClient()
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  return data?.id ?? null
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(subscription)
  if (!userId) {
    log.warn('webhook.user_not_found', { subscription: subscription.id })
    return
  }

  const isActive = ACTIVE_STATUSES.has(subscription.status)

  await createAdminClient()
    .from('profiles')
    .update({
      plan: isActive ? 'pro' : 'free',
      stripe_customer_id: idOf(subscription.customer),
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_end: new Date(
        subscription.current_period_end * 1000,
      ).toISOString(),
    })
    .eq('id', userId)

  log.info('webhook.subscription_synced', {
    user: anonId(userId),
    status: subscription.status,
  })
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    // Signature verification - rejects any request not signed by Stripe.
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      requireEnv('STRIPE_WEBHOOK_SECRET'),
    )
  } catch {
    log.warn('webhook.invalid_signature', {})
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  try {
    const stripe = getStripe()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const subscriptionId = idOf(session.subscription)
        const userId = session.client_reference_id
        const customerId = idOf(session.customer)

        if (userId && customerId) {
          await createAdminClient()
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId)
        }

        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId)
          if (userId && !subscription.metadata?.supabase_user_id) {
            await stripe.subscriptions.update(subscriptionId, {
              metadata: { supabase_user_id: userId },
            })
            subscription.metadata = {
              ...subscription.metadata,
              supabase_user_id: userId,
            }
          }
          await syncSubscription(subscription)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(event.data.object)
        break
      }

      case 'invoice.payment_failed':
      case 'invoice.paid': {
        // The subscription reference lives on the invoice; its exact shape
        // varies between API versions, so read it defensively.
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null
        }
        const subscriptionId = idOf(invoice.subscription ?? null)
        if (subscriptionId) {
          await syncSubscription(
            await stripe.subscriptions.retrieve(subscriptionId),
          )
        }
        break
      }

      default:
        break
    }
  } catch (error) {
    log.error('webhook.handler_error', {
      type: event.type,
      reason: error instanceof Error ? error.name : 'unknown',
    })
    // 500 makes Stripe retry the event.
    return NextResponse.json({ error: 'handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
