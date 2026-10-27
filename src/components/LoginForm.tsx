'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function sendLink() {
    if (!email.trim()) {
      setStatus('error')
      setMessage('メールアドレスを入力してください。')
      return
    }

    setStatus('sending')
    setMessage('')

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      })

      if (error) throw error

      setStatus('sent')
    } catch {
      setStatus('error')
      setMessage(
        'メールを送信できませんでした。アドレスを確認して、もう一度お試しください。',
      )
    }
  }

  if (status === 'sent') {
    return (
      <div className="card p-7">
        <p className="eyebrow">送信しました</p>
        <h2 className="mt-3 text-lg font-bold tracking-tightest">
          メールを確認してください
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          <span className="font-mono">{email}</span>{' '}
          宛にログイン用のリンクを送りました。リンクを開くとログインが完了します。
        </p>
        <p className="mt-4 text-xs text-ink-faint">
          届かない場合は迷惑メールフォルダをご確認ください。リンクの有効期限は60分です。
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="btn-secondary mt-6 w-full"
        >
          別のアドレスで送り直す
        </button>
      </div>
    )
  }

  return (
    <div className="card p-7">
      <label
        htmlFor="email"
        className="font-mono text-[11px] uppercase tracking-[0.16em] text-ledger"
      >
        メールアドレス
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') sendLink()
        }}
        placeholder="you@example.com"
        className="mt-2 w-full rounded border border-paper-rule bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint/70 focus:border-ledger"
      />

      <button
        type="button"
        onClick={sendLink}
        disabled={status === 'sending'}
        className="btn-primary mt-4 w-full"
      >
        {status === 'sending' ? '送信中…' : 'ログインリンクを送る'}
      </button>

      {status === 'error' ? (
        <p className="mt-3 text-sm text-alert">{message}</p>
      ) : null}

      <p className="mt-5 text-xs leading-relaxed text-ink-faint">
        パスワードはありません。届いたメールのリンクを開くだけでログインできます。
        初めての方は、この操作でアカウントが作成されます。
      </p>
    </div>
  )
}
