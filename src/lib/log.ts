/**
 * Logging helper.
 *
 * Rule: never write personally identifiable information (email addresses,
 * raw file contents, original file names, access tokens) to the log.
 * User references are hashed to a short, non-reversible-in-practice id.
 */
import { createHash } from 'node:crypto'

export function anonId(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 10)
}

type Fields = Record<string, string | number | boolean | undefined>

function emit(level: 'info' | 'warn' | 'error', event: string, fields: Fields) {
  const line = { level, event, ...fields, at: new Date().toISOString() }
  const text = JSON.stringify(line)
  if (level === 'error') console.error(text)
  else if (level === 'warn') console.warn(text)
  else console.log(text)
}

export const log = {
  info: (event: string, fields: Fields = {}) => emit('info', event, fields),
  warn: (event: string, fields: Fields = {}) => emit('warn', event, fields),
  error: (event: string, fields: Fields = {}) => emit('error', event, fields),
}
