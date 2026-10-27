export type Plan = 'free' | 'pro'

export type JobKind = 'pdf' | 'ocr' | 'csv'

export type JobStatus = 'succeeded' | 'failed'

export type Profile = {
  id: string
  email: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  current_period_end: string | null
}

export type UsageLog = {
  id: string
  user_id: string
  kind: JobKind
  file_name: string
  file_size: number
  status: JobStatus
  summary: string | null
  created_at: string
}

export type ProcessResult = {
  kind: JobKind
  fileName: string
  outputName: string
  mimeType: string
  content: string
  summary: string
  stats: Record<string, string | number>
}
