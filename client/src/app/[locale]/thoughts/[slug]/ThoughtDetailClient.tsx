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

  const getCategory = () =>
    locale === 'en' && thought?.category_en ? thought.category_en : thought?.category;

  const getSubcategory = () =>
    locale === 'en' && thought?.subcategory_en ? thought.subcategory_en : thought?.subcategory;

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
              {(thought.category || thought.subcategory) && (
                <div className="flex items-center gap-2 mb-3 text-sm">
                  {thought.category && <span className="text-accent-blue">{getCategory()}</span>}
                  {thought.subcategory && (
                    <>
                      <span className="text-text-tertiary">·</span>
                      <span className="text-text-tertiary">{getSubcategory()}</span>
                    </>
                  )}
                </div>
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

            {/* Attachments */}
            {thought.attachments && thought.attachments.length > 0 && (
              <div className="mt-8 p-5 rounded-xl bg-surface border border-border">
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  {locale === 'ko' ? '관련 자료' : 'Related Materials'}
                </h3>
                <div className="space-y-2">
                  {thought.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-text-primary hover:text-accent-blue transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {att.type === 'file' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        )}
                      </svg>
                      {locale === 'en' && att.title_en ? att.title_en : (att.title || att.url)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Prev/Next Navigation */}
            {(thought.prev_thought || thought.next_thought) && (
              <nav className="mt-12 pt-8 border-t border-border flex items-stretch gap-4">
                {thought.prev_thought ? (
                  <Link
                    href={`/${locale}/thoughts/${thought.prev_thought.slug}`}
                    className="flex-1 p-4 rounded-xl border border-border hover:border-border-hover transition-colors group text-left"
                  >
                    <span className="text-xs text-text-tertiary">
                      {dictionary.thoughts.prevPost}
                    </span>
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors mt-1">
                      ← {locale === 'en' && thought.prev_thought.title_en ? thought.prev_thought.title_en : thought.prev_thought.title}
                    </p>
                  </Link>
                ) : <div className="flex-1" />}
                {thought.next_thought ? (
                  <Link
                    href={`/${locale}/thoughts/${thought.next_thought.slug}`}
                    className="flex-1 p-4 rounded-xl border border-border hover:border-border-hover transition-colors group text-right"
                  >
                    <span className="text-xs text-text-tertiary">
                      {dictionary.thoughts.nextPost}
                    </span>
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors mt-1">
                      {locale === 'en' && thought.next_thought.title_en ? thought.next_thought.title_en : thought.next_thought.title} →
                    </p>
                  </Link>
                ) : <div className="flex-1" />}
              </nav>
            )}
          </motion.article>
        )}
      </main>
    </div>
  );
}
