import { formatBytes, formatDateTime, KIND_LABEL } from '@/lib/format'
import type { UsageLog } from '@/lib/types'

export function HistoryTable({ rows }: { rows: UsageLog[] }) {
  if (rows.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="text-sm font-bold text-ink">まだ履歴がありません</p>
        <p className="mt-2 text-sm text-ink-faint">
          ファイルを1つ処理すると、ここに記録されます。
        </p>
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-paper-rule">
            {['日時', '処理', 'ファイル', 'サイズ', '結果'].map((header) => (
              <th
                key={header}
                className="px-4 py-3 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-ledger"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="ledger-row border-b border-paper-rule">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-ink-faint">
                {formatDateTime(row.created_at)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink">
                {KIND_LABEL[row.kind] ?? row.kind}
              </td>
              <td className="max-w-[16rem] truncate px-4 py-3 text-ink-soft">
                {row.file_name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-ink-faint">
                {formatBytes(row.file_size)}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {row.status === 'succeeded' ? (
                  row.summary ?? '完了'
                ) : (
                  <span className="text-alert">失敗</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
