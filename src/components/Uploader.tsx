'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBytes } from '@/lib/format'
import type { ProcessResult } from '@/lib/types'

const ACCEPTED = ['.pdf', '.png', '.jpg', '.jpeg', '.csv']

type State =
  | { phase: 'idle' }
  | { phase: 'working'; fileName: string }
  | { phase: 'done'; result: ProcessResult }
  | { phase: 'error'; message: string; upgrade?: boolean }

export function Uploader({
  remaining,
  maxUploadMb,
}: {
  remaining: number
  maxUploadMb: number
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [state, setState] = useState<State>({ phase: 'idle' })

  const exhausted = remaining <= 0

  const upload = useCallback(
    async (file: File) => {
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
      if (!ACCEPTED.includes(ext)) {
        setState({
          phase: 'error',
          message: '対応形式は PDF / PNG / JPG / CSV です。',
        })
        return
      }
      if (file.size > maxUploadMb * 1024 * 1024) {
        setState({
          phase: 'error',
          message: `ファイルサイズが上限（${maxUploadMb}MB）を超えています。`,
        })
        return
      }

      setState({ phase: 'working', fileName: file.name })

      try {
        const body = new FormData()
        body.append('file', file)
        const response = await fetch('/api/process', { method: 'POST', body })
        const payload = await response.json()

        if (!response.ok) {
          setState({
            phase: 'error',
            message: payload.error ?? '処理に失敗しました。',
            upgrade: payload.upgrade === true,
          })
          return
        }

        setState({ phase: 'done', result: payload.result as ProcessResult })
        router.refresh()
      } catch {
        setState({
          phase: 'error',
          message: '通信に失敗しました。接続を確認して、もう一度お試しください。',
        })
      }
    },
    [maxUploadMb, router],
  )

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (exhausted) return
    const file = event.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  function download(result: ProcessResult) {
    const blob = new Blob([result.content], { type: result.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.outputName
    link.click()
    URL.revokeObjectURL(url)
  }

  if (state.phase === 'done') {
    const { result } = state
    return (
      <div className="card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">処理が終わりました</p>
          <span className="font-mono text-[11px] text-ink-faint">
            {result.outputName}
          </span>
        </div>
        <p className="mt-3 text-sm text-ink">{result.summary}</p>

        <dl className="ledger-row mt-5 grid gap-x-6 gap-y-1.5 rounded border border-paper-rule p-4 font-mono text-[11px] sm:grid-cols-2">
          {Object.entries(result.stats).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4">
              <dt className="text-ink-faint">{key}</dt>
              <dd className="truncate text-ink">{String(value)}</dd>
            </div>
          ))}
        </dl>

        <pre className="mt-5 max-h-64 overflow-auto rounded border border-paper-rule bg-white p-4 font-mono text-[11px] leading-relaxed text-ink-soft">
          {result.content.slice(0, 4000)}
          {result.content.length > 4000 ? '\n…' : ''}
        </pre>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => download(result)}
            className="btn-primary"
          >
            ダウンロード
          </button>
          <button
            type="button"
            onClick={() => setState({ phase: 'idle' })}
            className="btn-secondary"
          >
            次のファイルを処理する
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!exhausted) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`card flex flex-col items-center justify-center px-6 py-14 text-center transition-colors ${
          dragging ? 'border-ledger bg-ledger-soft' : ''
        } ${exhausted ? 'opacity-60' : ''}`}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-7 w-7 text-ledger"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" strokeLinecap="square" />
          <path d="M3.5 15v3.5A1.5 1.5 0 0 0 5 20h14a1.5 1.5 0 0 0 1.5-1.5V15" />
        </svg>

        {state.phase === 'working' ? (
          <>
            <p className="mt-4 text-sm font-bold text-ink">処理しています…</p>
            <p className="mt-1 font-mono text-[11px] text-ink-faint">
              {state.fileName}
            </p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-faint">
              画像のOCRは、初回のみ辞書の読み込みで時間がかかることがあります。
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm font-bold text-ink">
              {exhausted
                ? '今月の利用回数を使い切りました'
                : 'ここにファイルをドラッグ＆ドロップ'}
            </p>
            <p className="mt-1.5 text-xs text-ink-faint">
              PDF / PNG / JPG / CSV・1ファイル {maxUploadMb}MB まで
            </p>
            <button
              type="button"
              disabled={exhausted}
              onClick={() => inputRef.current?.click()}
              className="btn-secondary mt-5"
            >
              ファイルを選ぶ
            </button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) upload(file)
            event.target.value = ''
          }}
        />
      </div>

      {state.phase === 'error' ? (
        <div className="mt-3 rounded border border-alert/30 bg-alert/5 px-4 py-3">
          <p className="text-sm text-alert">{state.message}</p>
          {state.upgrade ? (
            <p className="mt-1 text-xs text-ink-soft">
              アカウント画面からProに切り替えると、月50回までご利用いただけます。
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 font-mono text-[11px] text-ink-faint">
        最大 {formatBytes(maxUploadMb * 1024 * 1024)} / 処理後にファイルの中身は破棄されます
      </p>
    </div>
  )
}
