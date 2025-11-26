'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

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
          throw new Error('뉴스를 찾을 수 없습니다.');
        }
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-red-600 text-lg mb-4">{error || '뉴스를 찾을 수 없습니다.'}</p>
            <Link
              href="/news"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              뉴스 목록으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/news"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          ← 뉴스 목록
        </Link>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {news.image_url && (
            <div className="aspect-video bg-gray-100">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              {news.source && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {news.source}
                </span>
              )}
              <span className="text-gray-500">
                {formatDate(news.published_at)}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {news.title}
            </h1>

            {news.content && (
              <div className="prose prose-lg max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
                {news.content}
              </div>
            )}

            {news.source_url && (
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                원문 기사 보기 →
              </a>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
