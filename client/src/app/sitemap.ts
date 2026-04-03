import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahyunjong.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';

  const staticPaths = [
    { path: '', priority: 1.0, changeFrequency: 'monthly' as const },
    { path: '/thoughts', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/lab', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/research', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/book', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  const pages: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of locales) {
    for (const { path, priority, changeFrequency } of staticPaths) {
      pages.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${path}`])
          ),
        },
      });
    }
  }

  // Dynamic pages - books
  try {
    const booksRes = await fetch(`${apiUrl}/api/books`, { next: { revalidate: 3600 } });
    if (booksRes.ok) {
      const books = await booksRes.json();
      for (const book of books) {
        for (const locale of locales) {
          pages.push({
            url: `${baseUrl}/${locale}/book/${book.id}`,
            lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      }
    }
  } catch {}

  // Dynamic pages - news
  try {
    const newsRes = await fetch(`${apiUrl}/api/news`, { next: { revalidate: 3600 } });
    if (newsRes.ok) {
      const news = await newsRes.json();
      for (const item of news) {
        for (const locale of locales) {
          pages.push({
            url: `${baseUrl}/${locale}/news/${item.slug}`,
            lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
          });
        }
      }
    }
  } catch {}

  // Dynamic pages - thoughts
  try {
    const thoughtsRes = await fetch(`${apiUrl}/api/thoughts`, { next: { revalidate: 3600 } });
    if (thoughtsRes.ok) {
      const thoughts = await thoughtsRes.json();
      for (const thought of thoughts) {
        for (const locale of locales) {
          pages.push({
            url: `${baseUrl}/${locale}/thoughts/${thought.slug}`,
            lastModified: thought.updated_at ? new Date(thought.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch {}

  return pages;
}
