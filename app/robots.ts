import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/company-selection'],
      disallow: ['/dashboard', '/api/'], // Disallow crawling of internal or authenticated routes
    },
    sitemap: 'https://mdsystems.com/sitemap.xml',
  }
}
