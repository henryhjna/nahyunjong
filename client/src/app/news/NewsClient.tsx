'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-cyan" />
            <span className="text-sm text-text-secondary">Media Coverage</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">News</span>
          </h1>
          <p className="text-xl text-text-secondary">언론 보도 및 미디어 활동</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary animate-pulse" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <p className="text-status-error mb-4">{error}</p>
            <button onClick={fetchNews} className="btn-glow">
              다시 시도
            </button>
          </motion.div>
        ) : news.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <svg
              className="w-16 h-16 mx-auto mb-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <p className="text-text-secondary text-lg">아직 등록된 뉴스가 없습니다.</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {news.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card overflow-hidden group"
              >
                <div className="flex flex-col md:flex-row">
                  {item.image_url && (
                    <div className="md:w-72 md:flex-shrink-0">
                      <div className="aspect-video md:aspect-auto md:h-full bg-background-secondary overflow-hidden relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 md:block hidden" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {item.source && (
                        <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm font-medium border border-accent-blue/30">
                          {item.source}
                        </span>
                      )}
                      <span className="text-text-tertiary text-sm flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(item.published_at)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent-blue transition-colors">
                      {item.source_url ? (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      ) : (
                        <Link href={`/news/${item.slug}`}>{item.title}</Link>
                      )}
                    </h2>

                    {item.content && (
                      <p className="text-text-secondary mb-4 line-clamp-2">{item.content}</p>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex gap-3">
                        {item.source_url ? (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all text-sm font-medium"
                          >
                            원문 보기
                            <svg
                              className="w-4 h-4"
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
                        ) : (
                          <Link
                            href={`/news/${item.slug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all text-sm font-medium"
                          >
                            자세히 보기
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        )}
                      </div>

                      {item.related_news && item.related_news.length > 0 && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-accent-purple hover:bg-accent-purple/10 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-accent-purple/30"
                        >
                          <span>관련 뉴스 {item.related_news.length}건</span>
                          <motion.svg
                            animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </motion.svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === item.id && item.related_news && item.related_news.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border bg-surface px-6 py-5">
                        <h3 className="text-sm font-medium text-text-tertiary mb-4 flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          관련 뉴스
                        </h3>
                        <div className="space-y-3">
                          {item.related_news.map((related) => (
                            <div
                              key={related.id}
                              className="flex items-start gap-4 p-4 bg-background rounded-xl border border-border hover:border-accent-purple/30 transition-colors group/related"
                            >
                              {related.image_url && (
                                <div className="w-20 h-20 flex-shrink-0 bg-background-secondary rounded-lg overflow-hidden">
                                  <img
                                    src={related.image_url}
                                    alt={related.title}
                                    className="w-full h-full object-cover group-hover/related:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {related.source && (
                                    <span className="text-xs text-accent-blue font-medium">
                                      {related.source}
                                    </span>
                                  )}
                                  <span className="text-xs text-text-muted">
                                    {formatShortDate(related.published_at)}
                                  </span>
                                </div>
                                {related.source_url ? (
                                  <a
                                    href={related.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-text-primary hover:text-accent-blue line-clamp-2 transition-colors"
                                  >
                                    {related.title}
                                  </a>
                                ) : (
                                  <Link
                                    href={`/news/${related.slug}`}
                                    className="text-sm font-medium text-text-primary hover:text-accent-blue line-clamp-2 transition-colors"
                                  >
                                    {related.title}
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            ))}
          </motion.div>
        )}
      </main>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-text-tertiary text-sm">
          <p>© 2025 LABA · Hanyang University Business School</p>
        </div>
      </footer>
    </div>
  );
}
