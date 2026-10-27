import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccountState } from '@/lib/account'
import { PortalButton, UpgradeButton } from '@/components/BillingButtons'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'アカウント',
  robots: { index: false, follow: false },
}

const STATUS_LABEL: Record<string, string> = {
  active: '有効',
  trialing: 'トライアル中',
  past_due: 'お支払い確認中',
  canceled: '解約済み',
  unpaid: '未払い',
  incomplete: '手続き中',
  incomplete_expired: '手続き期限切れ',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/dashboard/account')

  const account = await getAccountState(user.id, user.email ?? null)
  const { profile, plan } = account

  const rows: [string, string][] = [
    ['メールアドレス', user.email ?? '—'],
    ['プラン', plan === 'pro' ? 'Pro（月額980円・税込）' : 'Free'],
    ['今月の利用', `${account.used} / ${account.limit} 回`],
  ]

  if (plan === 'pro') {
    rows.push([
      '契約状態',
      STATUS_LABEL[profile.subscription_status ?? ''] ??
        profile.subscription_status ??
        '—',
    ])
    rows.push(['次回更新日', formatDate(profile.current_period_end)])
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="eyebrow">アカウント</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tightest">
          プランとお支払い
        </h1>
      </div>

      <dl className="card divide-y divide-paper-rule">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4"
          >
            <dt className="font-mono text-xs text-ledger">{label}</dt>
            <dd className="text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {plan === 'pro' ? (
        <section className="card p-6">
          <h2 className="text-base font-bold tracking-tightest">
            お支払い方法・解約
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            カード情報の変更、請求書・領収書のダウンロード、解約の手続きはお支払い管理ページで行えます。
            解約すると、次回の更新日以降は課金されません。お支払い済みの期間が終わるまではProのままご利用いただけます。
          </p>
          <div className="mt-5">
            <PortalButton />
          </div>
        </section>
      ) : (
        <section className="card p-6">
          <h2 className="text-base font-bold tracking-tightest">
            Proに切り替える
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            月額980円（税込）で毎月50回まで処理できます。最低契約期間はなく、いつでも解約できます。
          </p>
          <div className="mt-5">
            <UpgradeButton />
          </div>
          {profile.stripe_customer_id ? (
            <div className="mt-4">
              <PortalButton
                label="過去の請求を見る"
                className="btn-quiet px-0 text-sm"
              />
            </div>
          ) : null}
        </section>
      )}

      <section className="card p-6">
        <h2 className="text-base font-bold tracking-tightest">
          アカウントの削除
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          アカウントと処理履歴の削除をご希望の場合は、
          <a
            href={`mailto:${SITE.company.email}`}
            className="text-ledger underline underline-offset-2"
          >
            {SITE.company.email}
          </a>
          までご連絡ください。有料プランをご利用中の場合は、先に解約手続きをお願いします。
        </p>
      </section>
    </div>
  )
}
