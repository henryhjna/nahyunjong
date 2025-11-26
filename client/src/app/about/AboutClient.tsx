'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Profile } from '@/lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AboutClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
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
  }, []);

  const degreeIcons: Record<string, string> = {
    '박사': '🎓',
    'Ph.D.': '🎓',
    'PhD': '🎓',
    '석사': '📚',
    'M.S.': '📚',
    'MS': '📚',
    'Master': '📚',
    '학사': '📖',
    'B.S.': '📖',
    'BS': '📖',
    'Bachelor': '📖',
  };

  const getDegreeIcon = (degree: string) => {
    for (const [key, icon] of Object.entries(degreeIcons)) {
      if (degree.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '🎓';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
        <Header />
        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-20">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-surface rounded-3xl" />
            <div className="h-48 bg-surface rounded-2xl" />
            <div className="h-48 bg-surface rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-glow pointer-events-none" />

      <Header />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 md:p-12 mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-accent-blue/5 to-accent-purple/5" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 border border-border overflow-hidden">
                {profile?.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.name}
                    width={176}
                    height={176}
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
              <div className="absolute -inset-1 bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 rounded-2xl blur-xl -z-10" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-1">
                {profile?.name || '나현종'}
              </h1>
              {profile?.name_en && (
                <p className="text-lg text-text-secondary mb-4">{profile.name_en}</p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                {(profile?.affiliation || profile?.title) && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {profile?.affiliation} {profile?.title}
                  </span>
                )}
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-text-secondary text-sm hover:border-accent-blue hover:text-accent-blue transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profile.email}
                  </a>
                )}
              </div>

              {/* Bio Detail */}
              {(profile?.bio_detail || profile?.bio) && (
                <p className="text-text-secondary leading-relaxed">
                  {profile.bio_detail || profile.bio}
                </p>
              )}

              {/* Research Interests */}
              {profile?.research_interests && profile.research_interests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-text-tertiary mb-2">Research Interests</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {profile.research_interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 border border-accent-cyan/20 text-text-primary text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Education Section */}
        {profile?.education && profile.education.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </span>
              Education
            </h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {profile.education.map((edu) => (
                <motion.div
                  key={edu.id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-surface border border-border p-6 hover:border-accent-blue/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan/10 to-accent-blue/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0 text-2xl">
                      {getDegreeIcon(edu.degree)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-medium">
                          {edu.degree}
                        </span>
                        {edu.field && (
                          <span className="text-text-secondary text-sm">{edu.field}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary">
                        {edu.institution || edu.institution_en}
                        {edu.institution && edu.institution_en && (
                          <span className="text-text-tertiary font-normal text-sm ml-2">
                            ({edu.institution_en})
                          </span>
                        )}
                      </h3>
                      {(edu.year_start || edu.year_end) && (
                        <p className="text-sm text-text-tertiary mt-1">
                          {edu.year_start && edu.year_end
                            ? `${edu.year_start} - ${edu.year_end}`
                            : edu.year_end
                            ? edu.year_end
                            : edu.year_start}
                        </p>
                      )}
                      {edu.description && (
                        <p className="text-sm text-text-secondary mt-2">{edu.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Career Section */}
        {profile?.career && profile.career.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              Career
            </h2>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {profile.career.map((career, idx) => (
                  <motion.div
                    key={career.id}
                    variants={itemVariants}
                    className="relative pl-16"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-4 top-6 w-5 h-5 rounded-full border-2 ${
                      career.is_current
                        ? 'bg-accent-purple border-accent-purple'
                        : 'bg-background border-border'
                    }`}>
                      {career.is_current && (
                        <span className="absolute inset-0 rounded-full bg-accent-purple animate-ping opacity-50" />
                      )}
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-surface border border-border p-6 hover:border-accent-purple/30 transition-colors">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {career.is_current && (
                          <span className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-xs font-medium">
                            Current
                          </span>
                        )}
                        <span className="text-sm text-text-tertiary">
                          {career.year_start && career.year_end
                            ? `${career.year_start} - ${career.year_end}`
                            : career.year_start
                            ? `${career.year_start} - Present`
                            : ''}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        {career.position}
                      </h3>
                      <p className="text-text-secondary">
                        {career.organization || career.organization_en}
                        {career.organization && career.organization_en && (
                          <span className="text-text-tertiary ml-2">
                            ({career.organization_en})
                          </span>
                        )}
                      </p>
                      {career.description && (
                        <p className="text-sm text-text-tertiary mt-2">{career.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Awards Section */}
        {profile?.awards && profile.awards.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </span>
              Awards & Honors
            </h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 gap-4"
            >
              {profile.awards.map((award) => (
                <motion.div
                  key={award.id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-surface border border-border p-6 hover:border-accent-cyan/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/10 to-accent-blue/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0 text-xl">
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary mb-1">{award.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {award.organization && (
                          <span className="text-text-secondary">{award.organization}</span>
                        )}
                        {award.year && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-hover text-text-tertiary text-xs">
                            {award.year}
                          </span>
                        )}
                      </div>
                      {award.description && (
                        <p className="text-sm text-text-tertiary mt-2">{award.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Empty State */}
        {!profile?.education?.length && !profile?.career?.length && !profile?.awards?.length && (
          <div className="text-center py-12">
            <p className="text-text-tertiary">No detailed profile information available yet.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-text-tertiary text-sm">
          <p>© 2025 {profile?.name || '나현종'} · {profile?.affiliation || '한양대학교'}</p>
        </div>
      </footer>
    </div>
  );
}
