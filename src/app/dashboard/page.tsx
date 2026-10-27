import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccountState, listUsage } from '@/lib/account'
import { maxUploadMb } from '@/lib/env'
import { UsageMeter } from '@/components/UsageMeter'
import { Uploader } from '@/components/Uploader'
import { HistoryTable } from '@/components/HistoryTable'
import { UpgradeButton } from '@/components/BillingButtons'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ダッシュボード',
  robots: { index: false, follow: false },
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/dashboard')

  const account = await getAccountState(user.id, user.email ?? null)
  const recent = (await listUsage(user.id, 5)).slice(0, 5)
  const uploadLimitMb = maxUploadMb()

  return (
    <div className="space-y-8">
      {params.checkout === 'success' ? (
        <p className="rounded border border-ledger/40 bg-ledger-soft px-4 py-3 text-sm text-ledger-deep">
          Proのお支払いが完了しました。今月から月{account.limit}
          回までご利用いただけます。
        </p>
      ) : null}
      {params.checkout === 'cancelled' ? (
        <p className="rounded border border-paper-rule bg-white px-4 py-3 text-sm text-ink-soft">
          決済は完了していません。無料プランのままご利用いただけます。
        </p>
      ) : null}

      <div>
        <p className="eyebrow">ファイルを処理する</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tightest">
          今日は何を整えますか。
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Uploader remaining={account.remaining} maxUploadMb={uploadLimitMb} />

        <div className="space-y-4">
          <UsageMeter
            used={account.used}
            limit={account.limit}
            remaining={account.remaining}
            plan={account.plan}
            periodLabel={account.periodLabel}
          />

          {account.plan === 'free' ? (
            <div className="card p-6">
              <p className="eyebrow">Pro</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                月額980円（税込）で、毎月50回まで処理できます。いつでも解約できます。
              </p>
              <div className="mt-5">
                <UpgradeButton className="btn-primary w-full" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <section>
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">最近の処理</p>
          <Link
            href="/dashboard/history"
            className="text-sm text-ink-soft hover:text-ledger"
          >
            すべて見る
          </Link>
        </div>
        <div className="mt-4">
          <HistoryTable rows={recent} />
        </div>
      </section>
    </div>
  )
}
