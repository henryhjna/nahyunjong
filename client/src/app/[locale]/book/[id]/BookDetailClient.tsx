'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';

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
  author_note: string | null;
  author_note_en: string | null;
}

interface BookDetailClientProps {
  id: string;
}

export default function BookDetailClient({ id }: BookDetailClientProps) {
  const { dictionary, locale } = useDictionary();
  const t = dictionary.books;
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
          throw new Error(dictionary.common.notFound);
        }
        throw new Error('Failed to fetch book');
      }
      const data = await response.json();
      setBook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : dictionary.common.error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAuthorNote = () => {
    if (locale === 'en' && book?.author_note_en) return book.author_note_en;
    return book?.author_note || book?.author_note_en || null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 w-24 bg-surface-hover rounded animate-pulse" />
            <div className="bg-surface border border-border rounded-xl p-8 mt-4">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-48 h-64 bg-surface-hover rounded-xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 w-2/3 bg-surface-hover rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-surface-hover rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-surface-hover rounded animate-pulse" />
                  <div className="h-4 w-1/4 bg-surface-hover rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : !book ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">{error || dictionary.common.notFound}</p>
            <Link href={`/${locale}/book`} className="text-accent-blue hover:underline">
              {t.title}
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back link */}
            <Link
              href={`/${locale}/book`}
              className="text-sm text-text-secondary hover:text-text-primary mb-8 inline-block"
            >
              &larr; {t.title}
            </Link>

            {/* Book info card */}
            <div className="bg-surface border border-border rounded-xl p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Cover image */}
                <div className="shrink-0">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-48 rounded-lg"
                    />
                  ) : (
                    <div className="w-48 aspect-[3/4] bg-surface-hover rounded-lg" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-text-primary mb-1">
                    {book.title}
                  </h1>
                  {book.subtitle && (
                    <p className="text-lg text-text-secondary mb-4">{book.subtitle}</p>
                  )}

                  <div className="space-y-1 text-sm text-text-secondary mb-6">
                    <p>{book.authors}</p>
                    {book.publisher && <p>{book.publisher}</p>}
                    {book.published_date && <p>{formatDate(book.published_date)}</p>}
                    {book.isbn && <p>ISBN {book.isbn}</p>}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/${locale}/book/${id}/storybook`}
                      className="inline-flex items-center px-5 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors text-sm font-medium"
                    >
                      {locale === 'ko' ? '미리보기' : 'Preview'}
                    </Link>
                    {book.purchase_url && (
                      <a
                        href={book.purchase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-5 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-hover transition-colors text-sm font-medium"
                      >
                        {t.purchaseLink}
                      </a>
                    )}
                  </div>

                  {/* Author note */}
                  {getAuthorNote() && (
                    <div className="mt-6 p-4 rounded-xl bg-surface-hover border border-border">
                      <h3 className="text-sm font-medium text-text-secondary mb-2">{t.authorNote}</h3>
                      <p className="text-sm text-text-secondary italic leading-relaxed">
                        &ldquo;{getAuthorNote()}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="bg-surface border border-border rounded-xl p-8 mt-6">
                <h2 className="text-lg font-bold text-text-primary mb-3">
                  {locale === 'ko' ? '책 소개' : 'Description'}
                </h2>
                <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </div>
              </div>
            )}

            {/* Table of Contents */}
            {book.table_of_contents && (
              <div className="bg-surface border border-border rounded-xl p-8 mt-6">
                <h2 className="text-lg font-bold text-text-primary mb-3">{t.tableOfContents}</h2>
                <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {book.table_of_contents}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
