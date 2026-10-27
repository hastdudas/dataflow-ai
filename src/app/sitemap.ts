import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const paths = ['', '/faq', '/company', '/terms', '/privacy', '/tokushoho']

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }))
}
