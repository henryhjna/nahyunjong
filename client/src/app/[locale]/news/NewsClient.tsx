'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';

interface RelatedNews {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string;
  created_at: string;
  related_news: RelatedNews[];
}

export default function NewsClient() {
  const { dictionary } = useDictionary();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">News</h1>
          <p className="text-text-secondary mb-12">Media coverage and press</p>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl bg-surface-hover animate-pulse h-24" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-status-error mb-4">{error}</p>
              <button
                onClick={fetchNews}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:border-border-hover transition-all duration-200"
              >
                Retry
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center">
              <p className="text-text-secondary">No news articles yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <a
                  key={item.id}
                  href={item.source_url || `/news/${item.slug}`}
                  target={item.source_url ? '_blank' : undefined}
                  rel={item.source_url ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-border-hover transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-semibold text-text-primary truncate group-hover:text-accent-blue transition-colors">
                        {item.title}
                      </h2>
                      {item.related_news && item.related_news.length > 0 && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium text-text-tertiary bg-surface-hover rounded">
                          +{item.related_news.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-tertiary">
                      {item.source && <span>{item.source}</span>}
                      {item.source && <span>·</span>}
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                  </div>

                  {item.image_url && (
                    <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-surface-hover">
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <svg
                    className="flex-shrink-0 w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
