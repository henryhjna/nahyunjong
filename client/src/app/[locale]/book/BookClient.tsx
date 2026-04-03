'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';

interface Book {
  id: number;
  title: string;
  subtitle: string | null;
  authors: string;
  publisher: string | null;
  published_date: string | null;
  isbn: string | null;
  cover_image_url: string | null;
  description: string | null;
  purchase_url: string | null;
}

function formatDate(dateString: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
}

export default function BookClient() {
  const { dictionary, locale } = useDictionary();
  const t = dictionary.books;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books`);
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">{t.title}</h1>
          <p className="text-text-secondary mb-12">{t.subtitle}</p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl bg-surface-hover animate-pulse h-40" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 rounded-xl bg-surface border border-border text-center">
              <p className="text-status-error mb-4">{error}</p>
              <button
                onClick={fetchBooks}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary hover:border-border-hover transition-all duration-200"
              >
                Retry
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="p-12 rounded-xl bg-surface border border-border text-center">
              <p className="text-text-secondary">{t.noBooks}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/${locale}/book/${book.id}`}
                  className="flex gap-5 p-5 rounded-xl bg-surface border border-border hover:border-border-hover transition-all duration-200"
                >
                  <div className="w-[120px] flex-shrink-0">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-lg bg-surface-hover flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-text-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2">
                      {book.title}
                    </h2>
                    {book.subtitle && (
                      <p className="text-text-secondary text-sm mb-2 line-clamp-1">{book.subtitle}</p>
                    )}
                    <p className="text-text-tertiary text-sm mb-1">{book.authors}</p>
                    <p className="text-text-muted text-sm">
                      {book.publisher && `${book.publisher}`}
                      {book.publisher && book.published_date && ' · '}
                      {formatDate(book.published_date)}
                    </p>
                    {book.description && (
                      <p className="text-text-tertiary text-sm mt-3 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                    {book.purchase_url && (
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(book.purchase_url!, '_blank', 'noopener,noreferrer');
                        }}
                        className="inline-block mt-3 text-sm text-accent-blue hover:underline"
                      >
                        {t.purchaseLink}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
