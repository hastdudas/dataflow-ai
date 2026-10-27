export const SITE = {
  name: 'Shuketter',
  tagline: '書類とデータを、整えて返す。',
  description:
    'PDF・画像・CSVをアップロードするだけ。文字を抜き出し、表を整えて、そのまま使える形で返します。月額980円、無料で3回お試しいただけます。',
  price: 980,
  freeLimit: 3,
  proLimit: 50,
  company: {
    name: '合同会社Shuketterun',
    representative: '武藏祐輝',
    address: '東京都港区北青山1-3-1 アールキューブ青山3階',
    phone: '090-5404-3528',
    email: 'hastdudas@gmail.com',
    // TODO: 登記簿の設立年月に差し替えてください。
    founded: '（設立年月）',
  },
} as const

export const NAV_LINKS = [
  { href: '/#features', label: 'できること' },
  { href: '/#pricing', label: '料金' },
  { href: '/faq', label: 'よくある質問' },
  { href: '/company', label: '会社概要' },
]

export const LEGAL_LINKS = [
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/tokushoho', label: '特定商取引法に基づく表記' },
]
