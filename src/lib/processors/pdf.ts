import type { ProcessResult } from '@/lib/types'

/**
 * Extracts text from a PDF.
 *
 * pdf-parse's package entry point runs a demo block when it thinks it is
 * being executed directly, which breaks under bundlers - importing the
 * library file directly avoids it.
 */
export async function processPdf(
  buffer: Buffer,
  fileName: string,
): Promise<ProcessResult> {
  const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js')
  const parsed = await pdfParse(buffer)

  const text = parsed.text.replace(/\n{3,}/g, '\n\n').trim()

  if (text.length === 0) {
    throw new Error(
      'このPDFからは文字を抽出できませんでした。スキャン画像のみのPDFの可能性があります。ページを画像として書き出し、OCRをお試しください。',
    )
  }

  const outputName = fileName.replace(/\.pdf$/i, '') + '_text.txt'

  return {
    kind: 'pdf',
    fileName,
    outputName,
    mimeType: 'text/plain;charset=utf-8',
    content: text,
    summary: `${parsed.numpages}ページから ${text.length.toLocaleString('ja-JP')} 文字を抽出`,
    stats: {
      ページ数: parsed.numpages,
      文字数: text.length,
      行数: text.split('\n').length,
    },
  }
}
