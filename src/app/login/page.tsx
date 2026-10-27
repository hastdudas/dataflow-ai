import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { LoginForm } from '@/components/LoginForm'
import { LEGAL_LINKS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'ログイン',
  description:
    'メールアドレスだけでログインできます。パスワードは不要です。',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link: 'リンクが正しくありません。もう一度お試しください。',
  expired_link:
    'リンクの有効期限が切れています。新しいリンクを送信してください。',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next =
    params.next && params.next.startsWith('/') ? params.next : '/dashboard'
  const error = params.error ? ERROR_MESSAGES[params.error] : undefined

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-page gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="eyebrow">ログイン / 新規登録</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tightest">
            メールアドレスだけで
            <br />
            はじめられます。
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            パスワードの管理は不要です。入力したアドレスにワンタイムのログインリンクを送ります。
            無料プランではクレジットカードの登録もいりません。
          </p>
          <ul className="mt-8 space-y-2 font-mono text-xs text-ink-faint">
            <li>— 無料で月3回まで処理</li>
            <li>— PDF / PNG / JPG / CSV に対応</li>
            <li>— ファイルの中身はサーバーに残しません</li>
          </ul>
        </div>

        <div className="lg:pt-10">
          {error ? (
            <p className="mb-4 rounded border border-alert/30 bg-alert/5 px-4 py-3 text-sm text-alert">
              {error}
            </p>
          ) : null}

          <LoginForm next={next} />

          <p className="mt-5 text-center text-xs leading-relaxed text-ink-faint">
            続行することで
            {LEGAL_LINKS.slice(0, 2).map((link, index) => (
              <span key={link.href}>
                <Link href={link.href} className="text-ledger underline">
                  {link.label}
                </Link>
                {index === 0 ? 'と' : ''}
              </span>
            ))}
            に同意したものとみなされます。
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
