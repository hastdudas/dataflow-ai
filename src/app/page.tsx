import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { LedgerStrip } from '@/components/LedgerStrip'
import { PricingTable } from '@/components/PricingTable'
import { FAQ_ITEMS, FaqList } from '@/components/FaqList'
import { SITE } from '@/lib/site'
import { siteUrl } from '@/lib/env'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const CAPABILITIES = [
  {
    label: 'CSV',
    title: '表を整える',
    body: '重複行をまとめ、前後の空白と空行を落とし、バラバラな列名を統一します。そのままExcelで開けるUTF-8で書き出します。',
    detail: '重複削除 / 空白削除 / 列名統一',
  },
  {
    label: 'PDF',
    title: '文字を取り出す',
    body: 'PDFに埋め込まれたテキストをページ順に抽出します。契約書や請求書から必要な部分を探す手間がなくなります。',
    detail: 'テキスト抽出 / ページ数・文字数',
  },
  {
    label: 'PNG / JPG',
    title: '画像を読む',
    body: '写真やスクリーンショットの文字をOCRで読み取ります。日本語と英語が混ざった紙資料にも対応します。',
    detail: '日本語 + 英語 OCR',
  },
]

const STEPS = [
  {
    title: 'ファイルを置く',
    body: 'ドラッグ＆ドロップ、またはクリックして選択。PDF・PNG・JPG・CSV、1ファイル10MBまで。',
  },
  {
    title: '形式を見て処理する',
    body: '拡張子から自動で判定し、CSVなら整形、PDFなら抽出、画像ならOCRを実行します。',
  },
  {
    title: '結果を受け取る',
    body: '画面で確認して、そのままダウンロード。ファイルの中身はサーバーに残りません。',
  },
]

function jsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: SITE.name,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: siteUrl(),
        description: SITE.description,
        offers: {
          '@type': 'Offer',
          price: String(SITE.price),
          priceCurrency: 'JPY',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-page px-5 pb-16 pt-16 sm:pt-24">
          <div className="max-w-3xl animate-rise-in">
            <p className="eyebrow">PDF / PNG / JPG / CSV</p>
            <h1 className="mt-4 text-[2.1rem] font-bold leading-[1.25] tracking-tightest sm:text-[3rem]">
              書類とデータを、
              <br className="hidden sm:block" />
              整えて返す。
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              置くだけで、CSVの重複と空白を落とし、PDFから文字を抜き、
              画像の文字を読み取ります。整った結果をそのまま持ち帰れます。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn-primary">
                無料で3回試す
              </Link>
              <Link href="#pricing" className="btn-secondary">
                料金を見る
              </Link>
              <span className="font-mono text-xs text-ink-faint">
                月額 {SITE.price} 円 / クレジットカード不要で開始
              </span>
            </div>
          </div>

          <div className="mt-14">
            <LedgerStrip />
          </div>
        </section>

        {/* Capabilities */}
        <section id="features" className="mx-auto max-w-page px-5 py-16">
          <p className="eyebrow">できること</p>
          <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tightest sm:text-[1.75rem]">
            形式ごとに、やるべき処理は決まっている。
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <article key={item.title} className="card flex flex-col p-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ledger">
                  {item.label}
                </span>
                <h3 className="mt-3 text-lg font-bold tracking-tightest">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {item.body}
                </p>
                <p className="mt-5 border-t border-paper-rule pt-3 font-mono text-[11px] text-ink-faint">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Steps - a real sequence, so the rows are numbered like ledger lines */}
        <section className="border-y border-paper-rule bg-white">
          <div className="mx-auto max-w-page px-5 py-16">
            <p className="eyebrow">使い方</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tightest sm:text-[1.75rem]">
              3手で終わります。
            </h2>

            <ol className="mt-9">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="ledger-row grid gap-2 border-b border-paper-rule px-4 py-5 sm:grid-cols-[3rem_14rem_1fr] sm:items-baseline sm:gap-6"
                >
                  <span className="font-mono text-xs text-ledger">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-bold tracking-tightest">
                    {step.title}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-soft">
                    {step.body}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-page px-5 py-16">
          <p className="eyebrow">料金</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tightest sm:text-[1.75rem]">
            月額 {SITE.price.toLocaleString('ja-JP')} 円。それだけです。
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            従量課金も、最低契約期間もありません。まず無料で
            {SITE.freeLimit}回お試しください。
          </p>

          <div className="mt-10">
            <PricingTable />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-page px-5 py-16">
          <p className="eyebrow">よくある質問</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tightest sm:text-[1.75rem]">
            先に知っておきたいこと。
          </h2>
          <div className="mt-9">
            <FaqList />
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-page px-5 pb-8">
          <div className="rounded bg-ink px-7 py-12 text-center sm:px-12">
            <h2 className="text-xl font-bold tracking-tightest text-white sm:text-2xl">
              手元のファイルで、いま試せます。
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
              メールアドレスだけで登録できます。クレジットカードの登録は、
              Proに切り替えるときまで必要ありません。
            </p>
            <Link
              href="/login"
              className="btn mt-7 bg-white px-6 py-3 text-ink hover:bg-ledger-soft"
            >
              無料ではじめる
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
