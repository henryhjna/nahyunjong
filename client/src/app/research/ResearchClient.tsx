'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';

interface Publication {
  id: number;
  title: string | null;
  title_en: string | null;
  authors: string;
  journal: string | null;
  journal_tier: string | null;
  publication_type: 'paper' | 'report';
  year: number;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  abstract: string | null;
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
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-purple" />
            <span className="text-sm text-text-secondary">Publications</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Research</span>
          </h1>
          <p className="text-xl text-text-secondary">학술 논문 및 연구 성과</p>
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
            <button onClick={fetchPublications} className="btn-glow">
              다시 시도
            </button>
          </motion.div>
        ) : publications.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-text-secondary text-lg">아직 등록된 논문이 없습니다.</p>
          </motion.div>
        ) : (
          <>
            {/* Filter Chips */}
            <motion.div
              className="mb-8 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Type Filter */}
              <div>
                <span className="text-sm text-text-tertiary mb-2 block">유형</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedType === 'all'
                        ? 'bg-accent-teal/20 text-accent-teal border-accent-teal/30'
                        : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setSelectedType('paper')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedType === 'paper'
                        ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30'
                        : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    논문
                  </button>
                  <button
                    onClick={() => setSelectedType('report')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedType === 'report'
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    보고서
                  </button>
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <span className="text-sm text-text-tertiary mb-2 block">연도</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedYear('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedYear === 'all'
                        ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
                        : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    전체
                  </button>
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year.toString())}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedYear === year.toString()
                          ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
                          : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier Filter */}
              <div>
                <span className="text-sm text-text-tertiary mb-2 block">등급</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTier('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedTier === 'all'
                        ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30'
                        : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    전체
                  </button>
                  {tiers.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier!)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedTier === tier
                          ? tierColors[tier!] || tierColors['Other']
                          : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
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
                  <span className="text-sm text-text-tertiary mb-2 block">연구 분야</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedCategory === 'all'
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal/30'
                          : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      전체
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                          selectedCategory === cat
                            ? 'bg-accent-teal/20 text-accent-teal border-accent-teal/30'
                            : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="flex items-center gap-2 text-text-tertiary text-sm pt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                총 {filteredPublications.length}편
              </div>
            </motion.div>

            {/* Publications List */}
            <div className="space-y-12">
              {Object.entries(groupedByYear)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, pubs], groupIndex) => (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * groupIndex }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-3xl font-bold gradient-text">{year}</h2>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-text-tertiary text-sm">{pubs.length}편</span>
                    </div>

                    <div className="space-y-4">
                      {pubs.map((pub, index) => (
                        <motion.article
                          key={pub.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="glass-card overflow-hidden group"
                        >
                          {/* Gradient accent line */}
                          <div className="h-1 bg-gradient-primary" />

                          <div className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-blue transition-colors">
                                  {pub.title || pub.title_en}
                                </h3>
                                {pub.title && pub.title_en && pub.title !== pub.title_en && (
                                  <p className="text-text-tertiary text-sm mb-3 italic">{pub.title_en}</p>
                                )}
                                <p className="text-text-secondary mb-3">{pub.authors}</p>
                                <p className="text-text-tertiary text-sm">
                                  {pub.journal && (
                                    <span className="font-medium text-text-secondary">{pub.journal}</span>
                                  )}
                                  {pub.volume && `, Vol. ${pub.volume}`}
                                  {pub.issue && `(${pub.issue})`}
                                  {pub.pages && `, pp. ${pub.pages}`}
                                </p>
                                {/* Categories */}
                                {pub.categories && pub.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {pub.categories.map((cat) => (
                                      <span
                                        key={cat}
                                        className="px-2 py-0.5 bg-surface text-text-tertiary rounded text-xs"
                                      >
                                        {cat}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {/* Publication Type Badge */}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    pub.publication_type === 'paper'
                                      ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30'
                                      : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                  }`}
                                >
                                  {pub.publication_type === 'paper' ? '논문' : '보고서'}
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
                            <div className="mt-4 flex flex-wrap gap-3">
                              {pub.doi && (
                                <a
                                  href={`https://doi.org/${pub.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
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
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-status-error/10 text-status-error rounded-lg text-sm font-medium hover:bg-status-error/20 transition-colors"
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
                              {pub.abstract && (
                                <button
                                  onClick={() => setExpandedId(expandedId === pub.id ? null : pub.id)}
                                  className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                                >
                                  <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                      expandedId === pub.id ? 'rotate-180' : ''
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
                                  {expandedId === pub.id ? '초록 접기' : '초록 보기'}
                                </button>
                              )}
                            </div>

                            {/* Abstract */}
                            <AnimatePresence>
                              {expandedId === pub.id && pub.abstract && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-4 p-4 bg-surface rounded-xl border border-border">
                                    <h4 className="font-medium text-text-primary mb-2 text-sm">Abstract</h4>
                                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                                      {pub.abstract}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-text-tertiary text-sm">
          <p>© 2025 LABA · Hanyang University Business School</p>
        </div>
      </footer>
    </div>
  );
}
