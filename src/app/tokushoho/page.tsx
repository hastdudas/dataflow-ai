import type { Metadata } from 'next'
import { DocPage } from '@/components/DocPage'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
  description: `${SITE.name}の特定商取引法に基づく表記です。`,
  alternates: { canonical: '/tokushoho' },
}

const ROWS: [string, string][] = [
  ['販売事業者', SITE.company.name],
  ['運営責任者', SITE.company.representative],
  ['所在地', SITE.company.address],
  [
    '電話番号',
    `${SITE.company.phone}（お問い合わせはメールにて承ります。ご請求があれば遅滞なく開示します）`,
  ],
  ['メールアドレス', SITE.company.email],
  ['販売価格', `月額 ${SITE.price.toLocaleString('ja-JP')} 円（税込）`],
  [
    '商品代金以外の必要料金',
    'インターネット接続に必要な通信料はお客様のご負担となります。',
  ],
  ['お支払い方法', 'クレジットカード決済（Stripe）'],
  ['支払時期', 'お申し込み時に初回課金、以降は毎月同日に自動更新・課金'],
  [
    'サービス提供時期',
    'クレジットカード決済の完了後、ただちにご利用いただけます。',
  ],
  [
    '返品・キャンセル',
    'デジタルサービスの性質上、決済後の返金は承っておりません。解約はダッシュボードのアカウント画面からいつでも可能で、解約後は次回以降の課金が停止します。お支払い済みの期間終了までは引き続きご利用いただけます。',
  ],
  [
    '動作環境',
    '最新版の Google Chrome / Safari / Microsoft Edge / Firefox',
  ],
]

export default function TokushohoPage() {
  return (
    <DocPage eyebrow="Legal" title="特定商取引法に基づく表記">
      <dl className="border-y border-paper-rule">
        {ROWS.map(([label, value]) => (
          <div
            key={label}
            className="ledger-row grid gap-1 border-b border-paper-rule px-4 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
          >
            <dt className="font-mono text-xs text-ledger">{label}</dt>
            <dd className="text-sm leading-relaxed text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </DocPage>
  )
}
