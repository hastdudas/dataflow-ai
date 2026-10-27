import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Wordmark } from '@/components/Wordmark'
import { SignOutButton } from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

const TABS = [
  { href: '/dashboard', label: 'ホーム' },
  { href: '/dashboard/history', label: '処理履歴' },
  { href: '/dashboard/account', label: 'アカウント' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/dashboard')

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-paper-rule bg-white">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between px-5">
          <Link href="/dashboard" aria-label="ダッシュボード">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-5">
            <span className="hidden font-mono text-[11px] text-ink-faint sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>

        <nav className="mx-auto flex max-w-page gap-6 px-5">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="-mb-px border-b-2 border-transparent py-3 text-sm text-ink-soft transition-colors hover:border-ledger hover:text-ledger"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-page px-5 py-10">{children}</main>
    </div>
  )
}
