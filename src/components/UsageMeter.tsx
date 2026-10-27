import type { Plan } from '@/lib/types'

export function UsageMeter({
  used,
  limit,
  remaining,
  plan,
  periodLabel,
}: {
  used: number
  limit: number
  remaining: number
  plan: Plan
  periodLabel: string
}) {
  const cells = Array.from({ length: limit }, (_, i) => i < used)
  const low = remaining <= Math.max(1, Math.floor(limit * 0.2))

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow">{periodLabel}の残り</p>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          {plan === 'pro' ? 'Pro' : 'Free'}
        </span>
      </div>

      <p className="mt-3 flex items-baseline gap-1.5">
        <span
          className={`text-4xl font-bold tracking-tightest ${
            low ? 'text-signal' : 'text-ink'
          }`}
        >
          {remaining}
        </span>
        <span className="text-sm text-ink-faint">/ {limit} 回</span>
      </p>

      {/* One tick per available run - the meter is the ledger's tally column. */}
      <div className="mt-5 flex flex-wrap gap-[3px]">
        {cells.map((spent, index) => (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-[1px] ${
              spent ? 'bg-paper-rule' : 'bg-ledger'
            }`}
          />
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        今月 {used} 回使用しました。回数は毎月1日にリセットされます。
      </p>
    </div>
  )
}
