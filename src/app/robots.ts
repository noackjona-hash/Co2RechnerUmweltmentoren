import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/school/', '/api/'],
    },
    sitemap: 'https://umweltmentoren.de/sitemap.xml',
  };
}
