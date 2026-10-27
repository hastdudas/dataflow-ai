import type { Metadata } from 'next'
import { DocPage } from '@/components/DocPage'
import { FaqList } from '@/components/FaqList'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'よくある質問',
  description:
    'Shuketterの対応形式、無料プランの回数、ファイルの取り扱い、解約方法についてのよくある質問。',
  alternates: { canonical: '/faq' },
}

export default function FaqPage() {
  return (
    <DocPage eyebrow="Support" title="よくある質問">
      <FaqList />
      <p className="mt-8 text-sm">
        解決しない場合は{' '}
        <a href={`mailto:${SITE.company.email}`}>{SITE.company.email}</a>{' '}
        までご連絡ください。
      </p>
    </DocPage>
  )
}
