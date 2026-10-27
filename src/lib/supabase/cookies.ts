import type { CookieOptions } from '@supabase/ssr'

/**
 * The shape @supabase/ssr hands to `setAll`.
 *
 * The library types its `cookies` option as a union of adapter interfaces,
 * which defeats contextual typing of the callback parameters under
 * `strict`. Annotating the parameter explicitly restores it.
 */
export type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}
