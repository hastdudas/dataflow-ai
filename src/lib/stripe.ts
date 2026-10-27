import Stripe from 'stripe'
import { requireEnv } from '@/lib/env'

let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
      typescript: true,
      appInfo: { name: 'Shuketter', url: 'https://shuketter.com' },
    })
  }
  return cached
}
