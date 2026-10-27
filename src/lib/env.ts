/**
 * Central place for environment access.
 *
 * NEXT_PUBLIC_* variables are read with static member access because that is
 * the only form Next.js inlines into the client bundle.
 *
 * Server-only values are read lazily so a missing variable fails at request
 * time with a clear message instead of breaking `next build`.
 */

function present(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined
}

export const PUBLIC_ENV = {
  supabaseUrl: present(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  siteUrl: present(process.env.NEXT_PUBLIC_SITE_URL),
  maxUploadMb: present(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB),
}

export function requireEnv(name: string): string {
  const value = present(process.env[name])
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. See .env.example and the README.`,
    )
  }
  return value
}

export function optionalEnv(name: string, fallback: string): string {
  return present(process.env[name]) ?? fallback
}

export function requirePublic(
  key: 'supabaseUrl' | 'supabaseAnonKey',
  name: string,
): string {
  const value = PUBLIC_ENV[key]
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. See .env.example and the README.`,
    )
  }
  return value
}

export function siteUrl(): string {
  if (PUBLIC_ENV.siteUrl) return PUBLIC_ENV.siteUrl.replace(/\/$/, '')
  const vercel = present(process.env.VERCEL_URL)
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

export function maxUploadMb(): number {
  const value = Number(PUBLIC_ENV.maxUploadMb ?? '10')
  return Number.isFinite(value) && value > 0 ? value : 10
}

export function maxUploadBytes(): number {
  return maxUploadMb() * 1024 * 1024
}

export const PLAN_LIMITS = {
  get free(): number {
    return Number(optionalEnv('FREE_MONTHLY_LIMIT', '3'))
  },
  get pro(): number {
    return Number(optionalEnv('PRO_MONTHLY_LIMIT', '50'))
  },
}
