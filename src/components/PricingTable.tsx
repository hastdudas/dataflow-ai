import Link from 'next/link'
import { SITE } from '@/lib/site'

const FREE_FEATURES = [
  '月3回まで処理',
  'PDF・PNG・JPG・CSV に対応',
  '1ファイル10MBまで',
  '処理履歴の閲覧',
]

const PRO_FEATURES = [
  '月50回まで処理',
  'PDF・PNG・JPG・CSV に対応',
  '1ファイル10MBまで',
  '処理履歴の閲覧',
  'いつでも解約可能',
]

function Check() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-[5px] h-3.5 w-3.5 shrink-0 text-ledger"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 8.5l3.2 3.2L13 5" strokeLinecap="square" />
    </svg>
  )
}

export function PricingTable() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-7">
        <p className="eyebrow">Free</p>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tightest">0</span>
          <span className="text-sm text-ink-faint">円 / 月</span>
        </p>
        <p className="mt-2 text-sm text-ink-faint">
          まず試したい方へ。登録のみで使えます。
        </p>
        <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
          {FREE_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2.5">
              <Check />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link href="/login" className="btn-secondary mt-7 w-full">
          無料ではじめる
        </Link>
      </div>

      <div className="card relative border-ledger p-7">
        <span className="absolute -top-2.5 left-7 rounded-sm bg-ledger px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white">
          Standard
        </span>
        <p className="eyebrow">Pro</p>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tightest">
            {SITE.price.toLocaleString('ja-JP')}
          </span>
          <span className="text-sm text-ink-faint">円 / 月（税込）</span>
        </p>
        <p className="mt-2 text-sm text-ink-faint">
          毎日の書類仕事をまとめて片付けたい方へ。
        </p>
        <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2.5">
              <Check />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link href="/login" className="btn-primary mt-7 w-full">
          Proをはじめる
        </Link>
        <p className="mt-3 text-center text-xs text-ink-faint">
          解約はダッシュボードからいつでも
        </p>
      </div>
    </div>
  )
}
