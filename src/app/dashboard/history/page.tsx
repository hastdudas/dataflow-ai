import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listUsage } from '@/lib/account'
import { HistoryTable } from '@/components/HistoryTable'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '処理履歴',
  robots: { index: false, follow: false },
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/dashboard/history')

  const rows = await listUsage(user.id, 100)

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">処理履歴</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tightest">
          これまでに処理したファイル
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          記録しているのはファイル名・容量・処理の種類・結果の要約だけです。
          ファイルの中身は保存していないため、ここから再ダウンロードはできません。
        </p>
      </div>

      <HistoryTable rows={rows} />
    </div>
  )
}
