export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-[2px]">
      <span
        className={`text-lg font-bold tracking-tightest ${
          light ? 'text-white' : 'text-ink'
        }`}
      >
        Shuketter
      </span>
      <span
        aria-hidden
        className="mb-[3px] inline-block h-[6px] w-[6px] rounded-[1px] bg-ledger"
      />
    </span>
  )
}
