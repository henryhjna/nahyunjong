'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';
import type { Thought } from '@/lib/types';

export default function ThoughtDetailClient({ slug }: { slug: string }) {
  const { dictionary, locale } = useDictionary();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThought = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thoughts/${slug}`);
        if (res.ok) setThought(await res.json());
      } catch (error) {
        console.error('Failed to fetch thought:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchThought();
  }, [slug]);

  const getTitle = () =>
    locale === 'en' && thought?.title_en ? thought.title_en : thought?.title;

  const getContent = () =>
    locale === 'en' && thought?.content_en ? thought.content_en : thought?.content;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {loading ? (
          <div className="space-y-4">
            <div className="h-10 w-2/3 bg-surface-hover rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-surface-hover rounded animate-pulse" />
            <div className="h-64 bg-surface-hover rounded animate-pulse mt-8" />
          </div>
        ) : !thought ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">{dictionary.common.notFound}</p>
            <Link href={`/${locale}/thoughts`} className="text-accent-blue hover:underline">
              {dictionary.common.backToHome}
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
              href={`/${locale}/thoughts`}
              className="text-sm text-text-secondary hover:text-text-primary mb-8 inline-block"
            >
              ← {dictionary.nav.thoughts}
            </Link>

            {/* Header */}
            <header className="mb-8">
              {thought.category && (
                <span className="text-sm text-accent-blue mb-3 inline-block">{thought.category}</span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
                {getTitle()}
              </h1>
              {thought.published_at && (
                <time className="text-sm text-text-tertiary">
                  {new Date(thought.published_at).toLocaleDateString(
                    locale === 'ko' ? 'ko-KR' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </time>
              )}
            </header>

            {/* Cover image */}
            {thought.cover_image_url && (
              <img
                src={thought.cover_image_url}
                alt=""
                className="w-full rounded-xl mb-8 object-cover max-h-96"
              />
            )}

            {/* Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: getContent() || '' }}
            />
          </motion.article>
        )}
      </main>
    </div>
  );
}
