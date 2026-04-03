'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import type { Thought } from '@/lib/types';

export default function ThoughtsClient() {
  const { dictionary, locale } = useDictionary();
  const t = dictionary.thoughts;
  const [allThoughts, setAllThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchThoughts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thoughts`);
        if (res.ok) setAllThoughts(await res.json());
      } catch (error) {
        console.error('Failed to fetch thoughts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchThoughts();
  }, []);

  // Locale-aware getters
  const getTitle = (thought: Thought) =>
    locale === 'en' && thought.title_en ? thought.title_en : thought.title;
  const getExcerpt = (thought: Thought) =>
    locale === 'en' && thought.excerpt_en ? thought.excerpt_en : thought.excerpt;
  const getCategory = (thought: Thought) =>
    locale === 'en' && thought.category_en ? thought.category_en : thought.category;
  const getSubcategory = (thought: Thought) =>
    locale === 'en' && thought.subcategory_en ? thought.subcategory_en : thought.subcategory;

  // Derive categories and subcategories from data
  const categories = Array.from(new Set(allThoughts.map((t) => t.category).filter(Boolean))) as string[];
  const subcategories = selectedCategory
    ? (Array.from(new Set(
        allThoughts
          .filter((t) => t.category === selectedCategory)
          .map((t) => t.subcategory)
          .filter(Boolean)
      )) as string[])
    : [];

  // Build locale-aware label maps for filter buttons
  const categoryLabelMap: Record<string, string> = {};
  for (const cat of categories) {
    const sample = allThoughts.find((t) => t.category === cat);
    categoryLabelMap[cat] = sample ? getCategory(sample) || cat : cat;
  }
  const subcategoryLabelMap: Record<string, string> = {};
  for (const sub of subcategories) {
    const sample = allThoughts.find((t) => t.subcategory === sub);
    subcategoryLabelMap[sub] = sample ? getSubcategory(sample) || sub : sub;
  }

  // Filter thoughts
  const thoughts = allThoughts.filter((t) => {
    if (selectedCategory && t.category !== selectedCategory) return false;
    if (selectedSubcategory && t.subcategory !== selectedSubcategory) return false;
    return true;
  });

  const handleCategoryClick = (cat: string | null) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">{t.title}</h1>
          <p className="text-text-secondary">{t.subtitle}</p>
        </motion.div>

        {/* Category Filter (대분류) */}
        {categories.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  !selectedCategory
                    ? 'bg-accent-blue text-white'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {t.allCategories}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategory === cat
                      ? 'bg-accent-blue text-white'
                      : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {categoryLabelMap[cat]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategory Filter (중분류) */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  !selectedSubcategory
                    ? 'bg-text-primary text-background'
                    : 'bg-surface border border-border text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {t.allCategories}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    selectedSubcategory === sub
                      ? 'bg-text-primary text-background'
                      : 'bg-surface border border-border text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  {subcategoryLabelMap[sub]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No subcategory filter gap */}
        {subcategories.length === 0 && categories.length > 0 && <div className="mb-8" />}

        {/* Thoughts List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-surface-hover animate-pulse" />
            ))}
          </div>
        ) : thoughts.length === 0 ? (
          <p className="text-text-secondary text-center py-16">{t.empty}</p>
        ) : (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {thoughts.map((thought) => (
              <motion.article key={thought.id} variants={itemVariants}>
                <Link
                  href={`/${locale}/thoughts/${thought.slug}`}
                  className="block p-6 rounded-xl bg-surface border border-border hover:border-border-hover transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {thought.category && (
                          <span className="text-xs text-accent-blue">{getCategory(thought)}</span>
                        )}
                        {thought.subcategory && (
                          <>
                            <span className="text-xs text-text-tertiary">·</span>
                            <span className="text-xs text-text-tertiary">{getSubcategory(thought)}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-text-primary group-hover:text-accent-blue transition-colors mb-2">
                        {getTitle(thought)}
                      </h2>
                      {getExcerpt(thought) && (
                        <p className="text-text-secondary text-sm line-clamp-2">{getExcerpt(thought)}</p>
                      )}
                      <p className="text-xs text-text-tertiary mt-3">
                        {thought.published_at
                          ? new Date(thought.published_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : ''}
                      </p>
                    </div>
                    {thought.cover_image_url && (
                      <img
                        src={thought.cover_image_url}
                        alt=""
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
