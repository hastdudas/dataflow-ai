import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAccountState, recordUsage } from '@/lib/account'
import { maxUploadBytes } from '@/lib/env'
import { processCsv } from '@/lib/processors/csv'
import { processPdf } from '@/lib/processors/pdf'
import { processImage } from '@/lib/processors/ocr'
import { anonId, log } from '@/lib/log'
import type { JobKind, ProcessResult } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const KIND_BY_EXTENSION: Record<string, JobKind> = {
  pdf: 'pdf',
  png: 'ocr',
  jpg: 'ocr',
  jpeg: 'ocr',
  csv: 'csv',
}

function detectKind(fileName: string): JobKind | null {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return KIND_BY_EXTENSION[ext] ?? null
}

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return fail('ログインが必要です。', 401)

  const userRef = anonId(user.id)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail('ファイルを読み取れませんでした。もう一度お試しください。', 400)
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return fail('ファイルが選択されていません。', 400)
  }

  const limitBytes = maxUploadBytes()
  if (file.size > limitBytes) {
    return fail(
      `ファイルサイズが上限（${Math.round(limitBytes / 1024 / 1024)}MB）を超えています。`,
      413,
    )
  }
  if (file.size === 0) {
    return fail('ファイルが空です。', 400)
  }

  const kind = detectKind(file.name)
  if (!kind) {
    return fail('対応形式は PDF / PNG / JPG / CSV です。', 415)
  }

  const account = await getAccountState(user.id, user.email ?? null)
  if (account.remaining <= 0) {
    return NextResponse.json(
      {
        error:
          account.plan === 'free'
            ? '今月の無料利用回数を使い切りました。プランをアップグレードすると月50回までご利用いただけます。'
            : '今月の利用回数の上限に達しました。翌月1日にリセットされます。',
        upgrade: account.plan === 'free',
      },
      { status: 402 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let result: ProcessResult
  try {
    if (kind === 'csv') {
      result = processCsv(buffer.toString('utf8'), file.name)
    } else if (kind === 'pdf') {
      result = await processPdf(buffer, file.name)
    } else {
      result = await processImage(buffer, file.name)
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '処理中にエラーが発生しました。'
    // Log the failure without the file name or its contents.
    log.warn('process.failed', { user: userRef, kind, size: file.size })
    await recordUsage({
      userId: user.id,
      kind,
      fileName: file.name,
      fileSize: file.size,
      status: 'failed',
      summary: null,
    })
    return fail(message, 422)
  }

  await recordUsage({
    userId: user.id,
    kind,
    fileName: file.name,
    fileSize: file.size,
    status: 'succeeded',
    summary: result.summary,
  })

  log.info('process.succeeded', { user: userRef, kind, size: file.size })

  return NextResponse.json({
    result,
    remaining: Math.max(account.remaining - 1, 0),
    limit: account.limit,
  })
}
