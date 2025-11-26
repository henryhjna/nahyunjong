'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

interface ProjectLink {
  id: number;
  link_type: string;
  url: string;
  title: string | null;
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  links: ProjectLink[];
}

interface Member {
  id: number;
  name: string;
  name_en: string | null;
  batch: number;
  email: string | null;
  photo_url: string | null;
  research_interest: string | null;
  entrance_year: number | null;
  graduation_year: number | null;
  current_position: string | null;
  linkedin_url: string | null;
}

interface BatchData {
  batch: number;
  hero_image_url: string | null;
  year: number | null;
  description: string | null;
  projects: Project[];
  members: Member[];
}

interface Professor {
  id: number;
  name: string;
  name_en: string | null;
  email: string | null;
  photo_url: string | null;
  research_interest: string | null;
  linkedin_url: string | null;
}

interface BatchResponse {
  batches: BatchData[];
  professor: Professor | null;
}

const linkIcons: Record<string, JSX.Element> = {
  website: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  github: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  paper: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  presentation: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  other: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
};

const linkLabels: Record<string, string> = {
  website: 'Website',
  youtube: 'YouTube',
  github: 'GitHub',
  paper: 'Paper',
  presentation: 'Presentation',
  other: 'Link'
};

const batchGradients = [
  'from-accent-blue/30 via-accent-purple/20 to-accent-cyan/30',
  'from-accent-purple/30 via-accent-cyan/20 to-accent-blue/30',
  'from-accent-cyan/30 via-accent-blue/20 to-accent-purple/30',
  'from-accent-teal/30 via-accent-purple/20 to-accent-blue/30',
];

export default function LabClient() {
  const [data, setData] = useState<BatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/batches`);
      if (!response.ok) {
        throw new Error('Failed to fetch lab data');
      }
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lab data');
    } finally {
      setLoading(false);
    }
  };

  const sortedBatches = data?.batches
    ? [...data.batches].sort((a, b) =>
        sortOrder === 'desc' ? b.batch - a.batch : a.batch - b.batch
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-blue" />
            <span className="text-sm text-text-secondary">Laboratory</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">LABA</span>
          </h1>
          <p className="text-xl text-text-secondary mb-2">
            Lab for Accounting Bigdata and Artificial Intelligence
          </p>
          <p className="text-text-tertiary">회계 빅데이터 및 인공지능 연구실</p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About LABA
            </h2>
            <p className="text-text-secondary leading-relaxed">
              LABA(Lab for Accounting Bigdata and Artificial Intelligence)는 회계학과 빅데이터,
              인공지능의 융합 연구를 수행하는 연구실입니다. 금융 데이터 분석, 재무 예측, AI 기반
              회계 시스템 등 다양한 연구를 진행하고 있습니다.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Research Focus
            </h2>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                Financial Data Analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                AI in Accounting
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                Predictive Analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                Big Data Processing
              </li>
            </ul>
          </motion.div>
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
            <button
              onClick={fetchData}
              className="btn-glow"
            >
              다시 시도
            </button>
          </motion.div>
        ) : (
          <>
            {data?.professor && (
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  Professor
                </h2>
                <div className="glass-card p-8 flex flex-col md:flex-row gap-8">
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {data.professor.photo_url ? (
                      <img
                        src={data.professor.photo_url}
                        alt={data.professor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-20 h-20 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-text-primary">{data.professor.name}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-accent-purple/20 text-accent-purple border-accent-purple/30">
                        Professor
                      </span>
                    </div>
                    {data.professor.name_en && (
                      <p className="text-text-tertiary mb-4">{data.professor.name_en}</p>
                    )}
                    {data.professor.research_interest && (
                      <p className="text-text-secondary mb-4">{data.professor.research_interest}</p>
                    )}
                    <div className="flex gap-4">
                      {data.professor.email && (
                        <a
                          href={`mailto:${data.professor.email}`}
                          className="flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </a>
                      )}
                      {data.professor.linkedin_url && (
                        <a
                          href={data.professor.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {sortedBatches.length > 0 && (
              <motion.div
                className="flex items-center gap-4 mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-text-tertiary text-sm">정렬</span>
                <div className="flex rounded-xl bg-surface border border-border p-1">
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      sortOrder === 'desc'
                        ? 'bg-accent-blue text-white shadow-glow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      sortOrder === 'asc'
                        ? 'bg-accent-blue text-white shadow-glow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    오래된순
                  </button>
                </div>
              </motion.div>
            )}

            {sortedBatches.length > 0 ? (
              <div className="space-y-24">
                {sortedBatches.map((batch, index) => (
                  <BatchSection
                    key={batch.batch}
                    batch={batch}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center"
              >
                <p className="text-text-tertiary">등록된 기수 정보가 없습니다.</p>
              </motion.div>
            )}
          </>
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

function BatchSection({ batch, index }: { batch: BatchData; index: number }) {
  const gradientIndex = batch.batch % batchGradients.length;
  const hasImage = !!batch.hero_image_url;

  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <div className="relative h-[280px] md:h-[360px] rounded-3xl overflow-hidden mb-10">
        <div className="absolute inset-0">
          {hasImage ? (
            <img
              src={batch.hero_image_url!}
              alt={`${batch.batch}기 대표 이미지`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${batchGradients[gradientIndex]}`}>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>
          )}
        </div>

        {hasImage ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
          </>
        )}

        <div className="absolute inset-0 flex items-end p-8 md:p-12">
          <div className="flex items-end gap-4 md:gap-6">
            <span className={`text-[100px] md:text-[160px] font-black leading-none
                           bg-gradient-to-br ${hasImage
                             ? 'from-white via-white/80 to-white/40'
                             : 'from-text-primary via-text-primary/80 to-text-primary/40'
                           }
                           bg-clip-text text-transparent
                           drop-shadow-2xl select-none`}>
              {batch.batch}
            </span>

            <div className="pb-2 md:pb-6">
              <h2 className={`text-3xl md:text-5xl font-bold mb-2 ${hasImage ? 'text-white' : 'text-text-primary'}`}>
                {batch.batch}기
              </h2>
              <p className={`text-base md:text-lg ${hasImage ? 'text-white/70' : 'text-text-secondary'}`}>
                {batch.members.length}명의 연구원 · {batch.projects.length}개의 프로젝트
              </p>
              {batch.year && (
                <span className={`inline-block mt-3 px-4 py-1 rounded-full backdrop-blur-sm text-sm
                                ${hasImage
                                  ? 'bg-white/10 border border-white/20 text-white/80'
                                  : 'bg-surface border border-border text-text-secondary'
                                }`}>
                  {batch.year}년
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2 md:gap-3">
          <div className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl backdrop-blur-md
                          ${hasImage
                            ? 'bg-black/30 border border-white/10'
                            : 'bg-surface border border-border'
                          }`}>
            <span className={`text-xs block ${hasImage ? 'text-white/60' : 'text-text-tertiary'}`}>Projects</span>
            <span className={`font-bold text-lg md:text-xl ${hasImage ? 'text-white' : 'text-text-primary'}`}>{batch.projects.length}</span>
          </div>
          <div className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl backdrop-blur-md
                          ${hasImage
                            ? 'bg-black/30 border border-white/10'
                            : 'bg-surface border border-border'
                          }`}>
            <span className={`text-xs block ${hasImage ? 'text-white/60' : 'text-text-tertiary'}`}>Members</span>
            <span className={`font-bold text-lg md:text-xl ${hasImage ? 'text-white' : 'text-text-primary'}`}>{batch.members.length}</span>
          </div>
        </div>
      </div>

      {batch.projects.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue
                          flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary">Projects</h3>
          </div>

          <motion.div
            className={`grid gap-6 ${batch.projects.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {batch.projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>
        </div>
      )}

      {batch.members.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue
                          flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary">Members</h3>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {batch.members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </div>
      )}

      {batch.projects.length === 0 && batch.members.length === 0 && (
        <p className="text-text-tertiary text-center py-8">
          등록된 프로젝트나 구성원이 없습니다.
        </p>
      )}
    </motion.section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDescription = project.description && project.description.length > 200;

  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute -inset-px bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple
                      rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

      <div className="relative glass-card p-6 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20
                          border border-accent-cyan/30 flex items-center justify-center flex-shrink-0
                          group-hover:scale-110 transition-transform duration-300">
            <span className="text-xl font-bold text-accent-cyan">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <h4 className="text-xl font-bold text-text-primary leading-tight
                         group-hover:text-accent-cyan transition-colors">
            {project.title}
          </h4>
        </div>

        {project.description && (
          <div className="mb-6 flex-grow">
            <p className={`text-text-secondary text-sm leading-relaxed
                          ${!isExpanded && hasLongDescription ? 'line-clamp-3' : ''}`}>
              {project.description}
            </p>
            {hasLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-accent-blue text-sm font-medium hover:underline"
              >
                {isExpanded ? '접기' : '더 보기'}
              </button>
            )}
          </div>
        )}

        {project.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
            {project.links.map((link, linkIndex) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl
                           text-sm font-medium transition-all duration-300
                           ${linkIndex === 0
                             ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20'
                             : 'bg-surface border border-border text-text-secondary hover:border-accent-blue hover:text-accent-blue'
                           }`}
              >
                {linkIcons[link.link_type] || linkIcons.other}
                <span>{link.title || linkLabels[link.link_type] || link.link_type}</span>
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <div className="glass-card p-5 h-full text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          animate-spin-slow" />

          <div className="relative w-full h-full rounded-full overflow-hidden
                          bg-gradient-to-br from-surface to-background
                          border-2 border-border group-hover:border-accent-purple/50 transition-colors">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-purple/10 to-accent-blue/10">
                <span className="text-2xl font-bold gradient-text">
                  {member.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-background
                           flex items-center justify-center text-xs font-bold
                           ${member.graduation_year
                             ? 'bg-surface text-text-tertiary'
                             : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'}`}>
            {member.graduation_year ? '졸' : '재'}
          </div>
        </div>

        <div className="mb-2">
          <h4 className="font-semibold text-text-primary">{member.name}</h4>
          {member.name_en && (
            <p className="text-xs text-text-tertiary">{member.name_en}</p>
          )}
        </div>

        {member.graduation_year && member.current_position && (
          <div className="flex items-center justify-center gap-1 mb-3
                          px-2 py-1 rounded-full bg-surface text-xs text-text-secondary
                          max-w-full">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{member.current_position}</span>
          </div>
        )}

        <div className="flex justify-center gap-2 h-8 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="w-8 h-8 rounded-lg bg-surface hover:bg-accent-blue/20
                         flex items-center justify-center text-text-tertiary hover:text-accent-blue
                         transition-all duration-200"
              title="Email"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          )}
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-surface hover:bg-accent-blue/20
                         flex items-center justify-center text-text-tertiary hover:text-accent-blue
                         transition-all duration-200"
              title="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
