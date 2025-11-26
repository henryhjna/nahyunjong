import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahyunjong.com';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lab`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/education`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // 동적 페이지 - books
  try {
    const booksRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341'}/api/books`, {
      next: { revalidate: 3600 },
    });
    if (booksRes.ok) {
      const books = await booksRes.json();
      const bookPages: MetadataRoute.Sitemap = books.map((book: { id: number; updated_at?: string }) => ({
        url: `${baseUrl}/book/${book.id}`,
        lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
      staticPages.push(...bookPages);
    }
  } catch {
    // API 호출 실패 시 무시
  }

  // 동적 페이지 - news
  try {
    const newsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341'}/api/news`, {
      next: { revalidate: 3600 },
    });
    if (newsRes.ok) {
      const news = await newsRes.json();
      const newsPages: MetadataRoute.Sitemap = news.map((item: { slug: string; updated_at?: string }) => ({
        url: `${baseUrl}/news/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }));
      staticPages.push(...newsPages);
    }
  } catch {
    // API 호출 실패 시 무시
  }

  return staticPages;
}
