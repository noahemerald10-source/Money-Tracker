import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MoneyTrack',
    short_name: 'MoneyTrack',
    description: 'Personal finance tracker — income, expenses, and savings goals',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#050505',
    theme_color: '#10B981',
    icons: [
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
