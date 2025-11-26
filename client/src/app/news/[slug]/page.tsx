import { Metadata } from 'next';
import NewsDetailClient from './NewsDetailClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/lib/metadata';

interface NewsData {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string;
}

async function getNews(slug: string): Promise<NewsData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';
    const response = await fetch(`${apiUrl}/api/news/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) {
    return {
      title: '뉴스를 찾을 수 없습니다',
      description: '요청하신 뉴스를 찾을 수 없습니다.',
    };
  }

  const description = news.content
    ? news.content.slice(0, 160) + (news.content.length > 160 ? '...' : '')
    : `${news.title} - ${news.source || '뉴스'}`;

  return {
    title: news.title,
    description,
    openGraph: {
      title: news.title,
      description,
      type: 'article',
      url: `${siteConfig.url}/news/${slug}`,
      publishedTime: news.published_at,
      images: news.image_url ? [{ url: news.image_url, alt: news.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description,
      images: news.image_url ? [news.image_url] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);

  const newsSchema = news ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    datePublished: news.published_at,
    image: news.image_url,
    description: news.content,
    publisher: news.source ? {
      '@type': 'Organization',
      name: news.source,
    } : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/news/${slug}`,
    },
    about: {
      '@type': 'Person',
      name: siteConfig.name,
    },
  } : null;

  return (
    <>
      {newsSchema && <JsonLd data={newsSchema} />}
      <NewsDetailClient slug={slug} />
    </>
  );
}
