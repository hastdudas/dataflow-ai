'use client'

import { useState } from 'react'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function signOut() {
    setLoading(true)
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="text-sm text-ink-faint transition-colors hover:text-ledger"
    >
      {loading ? 'ログアウト中…' : 'ログアウト'}
    </button>
  )
}
