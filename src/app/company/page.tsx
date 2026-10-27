import type { Metadata } from 'next'
import { DocPage } from '@/components/DocPage'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: '会社概要',
  description: `${SITE.name}を運営する${SITE.company.name}の会社概要です。`,
  alternates: { canonical: '/company' },
}

const ROWS: [string, string][] = [
  ['会社名', SITE.company.name],
  ['代表者', SITE.company.representative],
  ['所在地', SITE.company.address],
  ['設立', SITE.company.founded],
  ['事業内容', 'ソフトウェアの企画・開発・運営'],
  ['お問い合わせ', SITE.company.email],
]

export default function CompanyPage() {
  return (
    <DocPage eyebrow="Company" title="会社概要">
      <dl className="border-y border-paper-rule">
        {ROWS.map(([label, value]) => (
          <div
            key={label}
            className="ledger-row grid gap-1 border-b border-paper-rule px-4 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
          >
            <dt className="font-mono text-xs text-ledger">{label}</dt>
            <dd className="text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <h2>ミッション</h2>
      <p>
        書類やデータを整える作業は、誰がやっても同じ結果になるのに、毎回人の時間を奪います。
        {SITE.name}
        は、その決まりきった手順をソフトウェアに任せ、判断が必要な仕事に時間を戻すために作られました。
      </p>
    </DocPage>
  )
}
