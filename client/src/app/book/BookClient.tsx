'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
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

function BookCard({ book, index }: { book: Book; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      onMouseMove={handleMouseMove}
      className="relative group rounded-2xl overflow-hidden bg-surface border border-border transition-all duration-300 hover:border-border-hover"
      style={
        {
          '--mouse-x': `${mousePosition.x}%`,
          '--mouse-y': `${mousePosition.y}%`,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1), transparent 40%)`,
        }}
      />

      <div className="aspect-[3/4] bg-gradient-to-br from-background-secondary to-background-tertiary overflow-hidden relative">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-24 h-24 text-text-muted"
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative p-6">
        <h2 className="text-xl font-bold text-text-primary mb-1 group-hover:text-accent-blue transition-colors line-clamp-2">
          {book.title}
        </h2>
        {book.subtitle && (
          <p className="text-text-secondary text-sm mb-2 line-clamp-1">{book.subtitle}</p>
        )}
        <p className="text-text-tertiary text-sm mb-1">{book.authors}</p>
        <p className="text-text-muted text-sm mb-4">
          {book.publisher && `${book.publisher} · `}
          {formatDate(book.published_date)}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/book/${book.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all text-sm font-medium"
          >
            자세히 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          {book.purchase_url && (
            <a
              href={book.purchase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-status-success/20 text-status-success border border-status-success/30 rounded-lg hover:bg-status-success/30 transition-all text-sm font-medium"
            >
              구매하기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function BookClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
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
            <span className="w-2 h-2 rounded-full bg-accent-teal" />
            <span className="text-sm text-text-secondary">Publications</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Books</span>
          </h1>
          <p className="text-xl text-text-secondary">출판 도서</p>
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
            <button onClick={fetchBooks} className="btn-glow">
              다시 시도
            </button>
          </motion.div>
        ) : books.length === 0 ? (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-text-secondary text-lg">아직 등록된 도서가 없습니다.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </div>
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
