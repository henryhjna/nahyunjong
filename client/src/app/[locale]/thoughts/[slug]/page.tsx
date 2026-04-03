import { Metadata } from 'next';
import ThoughtDetailClient from './ThoughtDetailClient';
import { siteConfig } from '@/lib/metadata';
import type { Locale } from '@/lib/i18n/config';

interface ThoughtData {
  title: string;
  title_en: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_en: string | null;
  content: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

async function getThought(slug: string): Promise<ThoughtData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';
    const res = await fetch(`${apiUrl}/api/thoughts/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const thought = await getThought(slug);

  if (!thought) {
    return { title: locale === 'ko' ? '글을 찾을 수 없습니다' : 'Post not found' };
  }

  const isKo = locale === 'ko';
  const title = isKo ? thought.title : (thought.title_en || thought.title);
  const description = isKo
    ? (thought.excerpt || thought.title)
    : (thought.excerpt_en || thought.excerpt || thought.title_en || thought.title);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${siteConfig.url}/${locale}/thoughts/${slug}`,
      publishedTime: thought.published_at || undefined,
      images: thought.cover_image_url ? [{ url: thought.cover_image_url }] : undefined,
    },
    alternates: {
      languages: {
        ko: `${siteConfig.url}/ko/thoughts/${slug}`,
        en: `${siteConfig.url}/en/thoughts/${slug}`,
      },
    },
  };
}

export default async function ThoughtDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  return <ThoughtDetailClient slug={slug} />;
}
