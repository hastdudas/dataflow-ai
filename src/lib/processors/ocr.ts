import type { ProcessResult } from '@/lib/types'

/**
 * Runs OCR over a PNG / JPG image (Japanese + English).
 *
 * tesseract.js downloads its language data on first use, so the first
 * request in a cold container is noticeably slower than later ones.
 */
export async function processImage(
  buffer: Buffer,
  fileName: string,
): Promise<ProcessResult> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker(['jpn', 'eng'])

  try {
    const { data } = await worker.recognize(buffer)
    const text = data.text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

    if (text.length === 0) {
      throw new Error(
        '画像から文字を検出できませんでした。解像度を上げるか、傾きを補正して再度お試しください。',
      )
    }

    const confidence = Math.round(data.confidence)
    const outputName = fileName.replace(/\.(png|jpe?g)$/i, '') + '_ocr.txt'

    return {
      kind: 'ocr',
      fileName,
      outputName,
      mimeType: 'text/plain;charset=utf-8',
      content: text,
      summary: `${text.length.toLocaleString('ja-JP')} 文字を認識（信頼度 ${confidence}%）`,
      stats: {
        文字数: text.length,
        行数: text.split('\n').length,
        信頼度: `${confidence}%`,
      },
    }
  } finally {
    await worker.terminate()
  }
}
