import Link from 'next/link'
import { LEGAL_LINKS, NAV_LINKS, SITE } from '@/lib/site'
import { Wordmark } from '@/components/Wordmark'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-paper-rule bg-white">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <Wordmark />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-faint">
            {SITE.description}
          </p>
        </div>

        <div>
          <p className="eyebrow">サービス</p>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink-soft hover:text-ledger"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">規約</p>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink-soft hover:text-ledger"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-paper-rule">
        <div className="mx-auto flex max-w-page flex-col gap-2 px-5 py-5 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">© {new Date().getFullYear()} {SITE.company.name}</p>
          <p>shuketter.com</p>
        </div>
      </div>
    </footer>
  )
}
