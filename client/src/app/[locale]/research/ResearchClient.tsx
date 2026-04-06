'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';

interface Publication {
  id: number;
  title: string | null;
  title_en: string | null;
  authors: string;
  authors_en: string | null;
  journal: string | null;
  journal_en: string | null;
  journal_tier: string | null;
  publication_type: 'paper' | 'report';
  year: number;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  abstract: string | null;
  abstract_en: string | null;
  pdf_url: string | null;
  categories: string[];
}

const tierColors: Record<string, string> = {
  SSCI: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
  SCI: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
  SCIE: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
  KCI: 'bg-accent-teal/20 text-accent-teal border-accent-teal/30',
  Other: 'bg-surface border-border text-text-secondary',
};

export default function ResearchClient() {
  const { dictionary, locale } = useDictionary();
  const t = dictionary.research;
  const l = (ko: string | null | undefined, en: string | null | undefined) => locale === 'en' && en ? en : ko;

  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications`);
      if (!response.ok) {
        throw new Error('Failed to fetch publications');
      }
      const data = await response.json();
      setPublications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const toggleAbstract = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const years = [...new Set(publications.map((p) => p.year))].sort((a, b) => b - a);
  const tiers = [...new Set(publications.map((p) => p.journal_tier).filter(Boolean))];
  const categories = [...new Set(publications.flatMap((p) => p.categories || []))].sort();

  const filteredPublications = publications.filter((p) => {
    if (selectedYear !== 'all' && p.year !== parseInt(selectedYear)) return false;
    if (selectedTier !== 'all' && p.journal_tier !== selectedTier) return false;
    if (selectedType !== 'all' && p.publication_type !== selectedType) return false;
    if (selectedCategory !== 'all' && !(p.categories || []).includes(selectedCategory)) return false;
    return true;
  });

  const groupedByYear = filteredPublications.reduce(
    (acc, pub) => {
      const year = pub.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(pub);
      return acc;
    },
    {} as Record<number, Publication[]>
  );

  const chipActive = 'bg-accent-blue text-white';
  const chipInactive = 'bg-surface border border-border text-text-secondary hover:border-border-hover';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="text-4xl font-bold text-text-primary mb-2">{t.title}</h1>
          <p className="text-text-secondary mb-10">{t.subtitle}</p>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl bg-surface-hover animate-pulse h-32" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-status-error mb-4">{error}</p>
              <button
                onClick={fetchPublications}
                className="px-4 py-2 rounded-lg bg-accent-blue text-white text-sm hover:opacity-90 transition-opacity"
              >
                {t.all}
              </button>
            </div>
          ) : publications.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center">
              <p className="text-text-secondary text-lg">{t.noResults}</p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="mb-10 space-y-4">
                {/* Type Filter */}
                <div>
                  <span className="text-sm text-text-tertiary mb-2 block">{t.filterByType}</span>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'paper', 'report'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                          selectedType === type ? chipActive : chipInactive
                        }`}
                      >
                        {type === 'all' ? t.all : type === 'paper' ? t.paper : t.report}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <span className="text-sm text-text-tertiary mb-2 block">{t.filterByYear}</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedYear('all')}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                        selectedYear === 'all' ? chipActive : chipInactive
                      }`}
                    >
                      {t.all}
                    </button>
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year.toString())}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                          selectedYear === year.toString() ? chipActive : chipInactive
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier Filter */}
                <div>
                  <span className="text-sm text-text-tertiary mb-2 block">{t.filterByTier}</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTier('all')}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                        selectedTier === 'all' ? chipActive : chipInactive
                      }`}
                    >
                      {t.all}
                    </button>
                    {tiers.map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier!)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                          selectedTier === tier ? chipActive : chipInactive
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div>
                    <span className="text-sm text-text-tertiary mb-2 block">{t.filterByCategory}</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                          selectedCategory === 'all' ? chipActive : chipInactive
                        }`}
                      >
                        {t.all}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                            selectedCategory === cat ? chipActive : chipInactive
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results Count */}
                <p className="text-text-tertiary text-sm pt-2">
                  {filteredPublications.length} {t.results}
                </p>
              </div>

              {/* Publications List */}
              <div className="space-y-10">
                {Object.entries(groupedByYear)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([year, pubs]) => (
                    <div key={year}>
                      <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-2xl font-bold text-text-primary">{year}</h2>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-text-tertiary text-sm">{pubs.length}</span>
                      </div>

                      <div className="space-y-3">
                        {pubs.map((pub) => {
                          const isExpanded = expandedIds.has(pub.id);
                          return (
                            <article
                              key={pub.id}
                              className="bg-surface border border-border rounded-xl hover:border-border-hover transition-all duration-200 p-5"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold text-text-primary mb-1">
                                    {l(pub.title, pub.title_en) || pub.title_en || pub.title}
                                  </h3>
                                  <p className="text-text-secondary text-sm mb-2">{l(pub.authors, pub.authors_en)}</p>
                                  <p className="text-text-tertiary text-sm">
                                    {(pub.journal || pub.journal_en) && (
                                      <span className="font-medium text-text-secondary">
                                        {l(pub.journal, pub.journal_en)}
                                      </span>
                                    )}
                                    {pub.volume && `, Vol. ${pub.volume}`}
                                    {pub.issue && `(${pub.issue})`}
                                    {pub.pages && `, pp. ${pub.pages}`}
                                  </p>
                                  {pub.categories && pub.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {pub.categories.map((cat) => (
                                        <span
                                          key={cat}
                                          className="px-2 py-0.5 bg-surface-hover text-text-tertiary rounded text-xs"
                                        >
                                          {cat}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                      pub.publication_type === 'paper'
                                        ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30'
                                        : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                    }`}
                                  >
                                    {pub.publication_type === 'paper' ? t.paper : t.report}
                                  </span>
                                  {pub.journal_tier && (
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                        tierColors[pub.journal_tier] || tierColors['Other']
                                      }`}
                                    >
                                      {pub.journal_tier}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="mt-3 flex flex-wrap gap-3">
                                {pub.doi && (
                                  <a
                                    href={`https://doi.org/${pub.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-accent-blue hover:opacity-70 transition-opacity"
                                  >
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
                                    DOI
                                  </a>
                                )}
                                {pub.pdf_url && (
                                  <a
                                    href={pub.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-status-error hover:opacity-70 transition-opacity"
                                  >
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
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                      />
                                    </svg>
                                    PDF
                                  </a>
                                )}
                                {(pub.abstract || pub.abstract_en) && (
                                  <button
                                    onClick={() => toggleAbstract(pub.id)}
                                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                                  >
                                    <svg
                                      className={`w-4 h-4 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-180' : ''
                                      }`}
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
                                    </svg>
                                    {t.abstract}
                                  </button>
                                )}
                              </div>

                              {/* Abstract (simple height/opacity transition) */}
                              <div
                                className={`overflow-hidden transition-all duration-200 ${
                                  isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                                }`}
                              >
                                <div className="p-4 bg-surface-hover rounded-lg">
                                  <h4 className="font-medium text-text-primary mb-2 text-sm">
                                    {t.abstract}
                                  </h4>
                                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                                    {l(pub.abstract, pub.abstract_en)}
                                  </p>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                {filteredPublications.length === 0 && (
                  <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <p className="text-text-secondary">{t.noResults}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
