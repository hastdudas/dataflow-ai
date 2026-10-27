import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // These packages must stay outside the bundler (native / worker based).
  serverExternalPackages: ['pdf-parse', 'tesseract.js'],
  /**
   * The previous site was static HTML on GitHub Pages. These 308s keep the
   * old indexed URLs and any external links working after the migration.
   */
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/terms.html', destination: '/terms', permanent: true },
      { source: '/privacy.html', destination: '/privacy', permanent: true },
      { source: '/tokusho.html', destination: '/tokushoho', permanent: true },
      // The legal page was named /tokusho on the old site; keep both spellings.
      { source: '/tokusho', destination: '/tokushoho', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
