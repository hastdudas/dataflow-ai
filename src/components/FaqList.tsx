export type FaqItem = { q: string; a: string }

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'アップロードしたファイルは保存されますか？',
    a: 'いいえ。ファイルの中身は処理が終わった時点でサーバーから消えます。保存するのはファイル名・容量・処理結果の要約だけで、履歴画面に表示するために使います。',
  },
  {
    q: '無料プランでどこまで試せますか？',
    a: '毎月3回まで、有料プランと同じ機能をお使いいただけます。回数は毎月1日にリセットされます。',
  },
  {
    q: '対応しているファイル形式を教えてください。',
    a: 'PDF・PNG・JPG・CSV に対応しています。1ファイルあたり10MBまでです。',
  },
  {
    q: 'スキャンしたPDFからも文字を取り出せますか？',
    a: '文字情報を持たないスキャンPDFはそのままでは抽出できません。ページを画像（PNG / JPG）として書き出してからアップロードすると、OCRで読み取れます。',
  },
  {
    q: '解約するとどうなりますか？',
    a: 'お支払い済みの期間が終わるまでProのまま使えます。期間終了後は自動で無料プランに戻り、料金は発生しません。ダッシュボードのアカウント画面からいつでも手続きできます。',
  },
  {
    q: '領収書は発行できますか？',
    a: 'お支払い管理画面から、毎月の請求書と領収書をダウンロードできます。',
  },
]

export function FaqList({ items = FAQ_ITEMS }: { items?: FaqItem[] }) {
  return (
    <div className="divide-y divide-paper-rule border-y border-paper-rule">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span
              aria-hidden
              className="mt-1 font-mono text-ledger transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  )
}
