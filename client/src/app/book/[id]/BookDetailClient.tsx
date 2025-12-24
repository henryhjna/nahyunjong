'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

interface BookDetail {
  id: number;
  title: string;
  subtitle: string | null;
  authors: string;
  publisher: string | null;
  published_date: string | null;
  isbn: string | null;
  cover_image_url: string | null;
  description: string | null;
  table_of_contents: string | null;
  purchase_url: string | null;
}

interface BookDetailClientProps {
  id: string;
}

export default function BookDetailClient({ id }: BookDetailClientProps) {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBook(id);
    }
  }, [id]);

  const fetchBook = async (bookId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('도서를 찾을 수 없습니다.');
        }
        throw new Error('Failed to fetch book');
      }
      const data = await response.json();
      setBook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-status-error text-lg mb-4">{error || '도서를 찾을 수 없습니다.'}</p>
            <Link
              href="/book"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              도서 목록으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/book"
          className="inline-flex items-center text-accent-blue hover:text-accent-blue/80 mb-8 font-medium"
        >
          ← 도서 목록
        </Link>

        <div className="bg-surface rounded-xl shadow-card overflow-hidden border border-border">
          <div className="md:flex">
            <div className="md:w-1/3 bg-background-secondary p-8">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="aspect-[3/4] bg-background-tertiary rounded-lg flex items-center justify-center">
                  <span className="text-9xl">📖</span>
                </div>
              )}
            </div>

            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-xl text-text-secondary mb-4">{book.subtitle}</p>
              )}

              <div className="space-y-2 mb-6">
                <p className="text-text-secondary">
                  <span className="font-medium">저자:</span> {book.authors}
                </p>
                {book.publisher && (
                  <p className="text-text-secondary">
                    <span className="font-medium">출판사:</span> {book.publisher}
                  </p>
                )}
                {book.published_date && (
                  <p className="text-text-secondary">
                    <span className="font-medium">출간일:</span> {formatDate(book.published_date)}
                  </p>
                )}
                {book.isbn && (
                  <p className="text-text-secondary">
                    <span className="font-medium">ISBN:</span> {book.isbn}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  href={`/book/${id}/storybook`}
                  className="inline-flex items-center px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors font-medium"
                >
                  미리보기
                </Link>
                {book.purchase_url && (
                  <a
                    href={book.purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    구매하기 →
                  </a>
                )}
              </div>

              {book.description && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-text-primary mb-3">책 소개</h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none text-text-secondary whitespace-pre-wrap">
                    {book.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {book.table_of_contents && (
            <div className="border-t border-border p-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">목차</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none text-text-secondary whitespace-pre-wrap">
                {book.table_of_contents}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
