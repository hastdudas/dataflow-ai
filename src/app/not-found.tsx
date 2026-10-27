import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[50vh] max-w-page flex-col items-start justify-center px-5 py-24">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tightest">
          このページは見つかりませんでした
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          URLが変わったか、削除された可能性があります。
        </p>
        <Link href="/" className="btn-primary mt-8">
          トップへ戻る
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
