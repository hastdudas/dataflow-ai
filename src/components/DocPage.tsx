import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export function DocPage({
  eyebrow,
  title,
  updatedAt,
  children,
}: {
  eyebrow: string
  title: string
  updatedAt?: string
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest">{title}</h1>
        {updatedAt ? (
          <p className="mt-3 font-mono text-xs text-ink-faint">
            最終更新日: {updatedAt}
          </p>
        ) : null}
        <div className="prose-doc mt-10">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}
