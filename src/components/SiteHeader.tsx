import Link from 'next/link'
import { NAV_LINKS, SITE } from '@/lib/site'
import { Wordmark } from '@/components/Wordmark'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-paper-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between px-5">
        <Link href="/" aria-label={`${SITE.name} ホーム`}>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft transition-colors hover:text-ledger"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-quiet text-sm">
            ログイン
          </Link>
          <Link href="/login" className="btn-primary px-4 py-2 text-sm">
            無料で試す
          </Link>
        </div>
      </div>
    </header>
  )
}
