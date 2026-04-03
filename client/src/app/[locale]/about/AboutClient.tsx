'use client';

import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Profile, NewsItem } from '@/lib/types';

export default function AboutClient() {
  const { dictionary } = useDictionary();
  const t = dictionary.about;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    const fetchNews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);
        if (res.ok) setNews(await res.json());
      } catch {}
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-6">
          <div className="h-48 rounded-xl bg-surface-hover animate-pulse" />
          <div className="h-32 rounded-xl bg-surface-hover animate-pulse" />
          <div className="h-32 rounded-xl bg-surface-hover animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Profile Section */}
          <section className="flex flex-col md:flex-row gap-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-[150px] h-[150px] rounded-xl bg-surface border border-border overflow-hidden">
                {profile?.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-text-primary">
                {profile?.name || '나현종'}
              </h1>
              {profile?.name_en && (
                <p className="text-lg text-text-secondary mt-1">{profile.name_en}</p>
              )}

              {(profile?.affiliation || profile?.title) && (
                <p className="text-text-secondary mt-2">
                  {profile?.affiliation}{profile?.affiliation && profile?.title ? ' ' : ''}{profile?.title}
                </p>
              )}

              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="text-sm text-text-secondary hover:text-accent-blue transition-colors mt-1 inline-block"
                >
                  {profile.email}
                </a>
              )}

              {/* ORCID & Google Scholar */}
              <div className="flex items-center gap-4 mt-3 text-sm text-text-tertiary">
                <a
                  href="https://orcid.org/0000-0002-6475-128X"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-secondary transition-colors"
                >
                  ORCID
                </a>
                <a
                  href="https://scholar.google.com/citations?user=Y7ki3dEAAAAJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-secondary transition-colors"
                >
                  Google Scholar
                </a>
              </div>

              {/* Bio */}
              {(profile?.bio_detail || profile?.bio) && (
                <p className="text-text-secondary leading-relaxed mt-4">
                  {profile.bio_detail || profile.bio}
                </p>
              )}

              {/* Research Interests */}
              {profile?.research_interests && profile.research_interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.research_interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-surface-hover text-text-secondary text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Education Section */}
          {profile?.education && profile.education.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {t?.education ?? 'Education'}
              </h2>
              <div className="space-y-4">
                {profile.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="border-l-2 border-accent-blue pl-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                      <span className="font-medium text-text-primary">{edu.degree}</span>
                      {edu.field && <span>{edu.field}</span>}
                    </div>
                    <h3 className="text-text-primary mt-0.5">
                      {edu.institution || edu.institution_en}
                      {edu.institution && edu.institution_en && (
                        <span className="text-text-tertiary text-sm ml-2">
                          ({edu.institution_en})
                        </span>
                      )}
                    </h3>
                    {(edu.year_start || edu.year_end) && (
                      <p className="text-sm text-text-tertiary mt-0.5">
                        {edu.year_start && edu.year_end
                          ? `${edu.year_start} - ${edu.year_end}`
                          : edu.year_end
                          ? edu.year_end
                          : edu.year_start}
                      </p>
                    )}
                    {edu.description && (
                      <p className="text-sm text-text-secondary mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Career Section */}
          {profile?.career && profile.career.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {t?.career ?? 'Career'}
              </h2>
              <div className="space-y-4">
                {profile.career.map((career) => (
                  <div
                    key={career.id}
                    className="border-l-2 border-accent-blue pl-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-text-primary">{career.position}</h3>
                      {career.is_current && (
                        <span className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm mt-0.5">
                      {career.organization || career.organization_en}
                      {career.organization && career.organization_en && (
                        <span className="text-text-tertiary ml-2">
                          ({career.organization_en})
                        </span>
                      )}
                    </p>
                    {(career.year_start || career.year_end) && (
                      <p className="text-sm text-text-tertiary mt-0.5">
                        {career.year_start && career.year_end
                          ? `${career.year_start} - ${career.year_end}`
                          : career.year_start
                          ? `${career.year_start} - Present`
                          : ''}
                      </p>
                    )}
                    {career.description && (
                      <p className="text-sm text-text-secondary mt-1">{career.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Awards Section */}
          {profile?.awards && profile.awards.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {t?.awards ?? 'Awards'}
              </h2>
              <div className="space-y-4">
                {profile.awards.map((award) => (
                  <div
                    key={award.id}
                    className="border-l-2 border-accent-blue pl-4"
                  >
                    <h3 className="font-medium text-text-primary">{award.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm mt-0.5">
                      {award.organization && (
                        <span className="text-text-secondary">{award.organization}</span>
                      )}
                      {award.year && (
                        <span className="text-text-tertiary">{award.year}</span>
                      )}
                    </div>
                    {award.description && (
                      <p className="text-sm text-text-secondary mt-1">{award.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* News Section */}
          {news.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {t?.news ?? 'Press Coverage'}
              </h2>
              <div className="space-y-3">
                {news.slice(0, 10).map((item) => (
                  <a
                    key={item.id}
                    href={item.source_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl border border-border bg-surface hover:border-border-hover transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                          {item.source && <span>{item.source}</span>}
                          <span>{new Date(item.published_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!profile?.education?.length && !profile?.career?.length && !profile?.awards?.length && (
            <div className="text-center py-12">
              <p className="text-text-tertiary">{t?.noInfo ?? 'No information available.'}</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
