'use client'

import { useState } from 'react'

async function open(endpoint: string): Promise<string> {
  const response = await fetch(endpoint, { method: 'POST' })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error ?? '処理に失敗しました。')
  return payload.url as string
}

function useRedirect(endpoint: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function go() {
    setLoading(true)
    setError('')
    try {
      window.location.href = await open(endpoint)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '処理に失敗しました。')
      setLoading(false)
    }
  }

  return { loading, error, go }
}

export function UpgradeButton({
  label = 'Proにアップグレード',
  className = 'btn-primary',
}: {
  label?: string
  className?: string
}) {
  const { loading, error, go } = useRedirect('/api/stripe/checkout')

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className={className}
      >
        {loading ? '決済ページを開いています…' : label}
      </button>
      {error ? <p className="mt-2 text-sm text-alert">{error}</p> : null}
    </div>
  )
}

export function PortalButton({
  label = 'お支払い・解約の管理',
  className = 'btn-secondary',
}: {
  label?: string
  className?: string
}) {
  const { loading, error, go } = useRedirect('/api/stripe/portal')

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className={className}
      >
        {loading ? '開いています…' : label}
      </button>
      {error ? <p className="mt-2 text-sm text-alert">{error}</p> : null}
    </div>
  )
}
