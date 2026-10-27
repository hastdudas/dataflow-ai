const BEFORE = {
  headers: ['　顧客名 ', 'Mail Address', '金額（円）', ''],
  rows: [
    ['山田 太郎', 'taro@example.com', ' 12,000', ''],
    ['山田 太郎', 'taro@example.com', ' 12,000', ''],
    ['', '', '', ''],
    ['佐藤　花子 ', 'hanako@example.com ', '8,400 ', ''],
  ],
  flags: ['', '重複', '空行', ''],
}

const AFTER = {
  headers: ['顧客名', 'mail_address', '金額_円'],
  rows: [
    ['山田 太郎', 'taro@example.com', '12,000'],
    ['佐藤 花子', 'hanako@example.com', '8,400'],
  ],
}

function Panel({
  label,
  caption,
  children,
}: {
  label: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-paper-rule px-4 py-2.5">
        <span className="eyebrow">{label}</span>
        <span className="font-mono text-[11px] text-ink-faint">{caption}</span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function LedgerStrip() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel label="Before" caption="input.csv">
        <table className="w-full min-w-[380px] font-mono text-[12px]">
          <thead>
            <tr className="text-left text-ink-faint">
              {BEFORE.headers.map((header, i) => (
                <th key={i} className="whitespace-pre px-4 py-2 font-normal">
                  {header || '\u00A0'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BEFORE.rows.map((row, i) => (
              <tr key={i} className="ledger-row">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="whitespace-pre px-4 py-2 text-ink-soft"
                  >
                    {cell || '\u00A0'}
                  </td>
                ))}
                <td className="px-3 py-2 text-right text-[10px] text-alert">
                  {BEFORE.flags[i]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel label="After" caption="input_cleaned.csv">
        <table className="w-full min-w-[380px] font-mono text-[12px]">
          <thead>
            <tr className="text-left text-ledger">
              {AFTER.headers.map((header) => (
                <th key={header} className="px-4 py-2 font-normal">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AFTER.rows.map((row, i) => (
              <tr key={i} className="ledger-row">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-ink">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td
                colSpan={3}
                className="px-4 py-2 text-[11px] text-ink-faint"
              >
                4行 → 2行（重複 1 / 空行 1 を削除）
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </div>
  )
}
