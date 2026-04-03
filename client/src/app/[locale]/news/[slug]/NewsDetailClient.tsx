'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';

interface NewsDetail {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

interface NewsDetailClientProps {
  slug: string;
}

export default function NewsDetailClient({ slug }: NewsDetailClientProps) {
  const { dictionary, locale } = useDictionary();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchNews(slug);
    }
  }, [slug]);

  const fetchNews = async (newsSlug: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${newsSlug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(dictionary.common.notFound);
        }
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : dictionary.common.error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 w-24 bg-surface-hover rounded animate-pulse" />
            <div className="h-8 w-2/3 bg-surface-hover rounded animate-pulse mt-4" />
            <div className="h-4 w-1/3 bg-surface-hover rounded animate-pulse" />
            <div className="h-64 bg-surface-hover rounded-xl animate-pulse mt-4" />
          </div>
        ) : !news ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">{error || dictionary.common.notFound}</p>
            <Link href={`/${locale}/about`} className="text-accent-blue hover:underline">
              {dictionary.about.news}
            </Link>
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back link */}
            <Link
              href={`/${locale}/about`}
              className="text-sm text-text-secondary hover:text-text-primary mb-8 inline-block"
            >
              &larr; {dictionary.about.news}
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-bold text-text-primary mb-4 leading-tight">
              {news.title}
            </h1>

            {/* Date and source */}
            <div className="flex items-center gap-3 text-sm text-text-tertiary mb-8">
              <time>{formatDate(news.published_at)}</time>
              {news.source && (
                <>
                  <span>·</span>
                  <span>{news.source}</span>
                </>
              )}
            </div>

            {/* Image */}
            {news.image_url && (
              <img
                src={news.image_url}
                alt=""
                className="w-full rounded-xl mb-8 object-cover max-h-96"
              />
            )}

            {/* Content */}
            {news.content && (
              <div className="text-text-primary leading-relaxed whitespace-pre-wrap mb-8">
                {news.content}
              </div>
            )}

            {/* Source link */}
            {news.source_url && (
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-accent-blue hover:underline"
              >
                {dictionary.about.viewArticle} &rarr;
              </a>
            )}
          </motion.article>
        )}
      </main>
    </div>
  );
}
