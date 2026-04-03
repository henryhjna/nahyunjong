'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useState, useEffect } from 'react';

interface ProfileBasic {
  name: string;
  name_en: string | null;
  title: string | null;
  affiliation: string | null;
  bio: string | null;
  photo_url: string | null;
  tagline: string | null;
  tagline_en: string | null;
  research_interests: string[] | null;
}

export default function Home() {
  const { dictionary, locale } = useDictionary();
  const t = dictionary.landing;
  const nav = dictionary.nav;
  const [profile, setProfile] = useState<ProfileBasic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/basic`);
        if (res.ok) setProfile(await res.json());
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const tagline = locale === 'en' && profile?.tagline_en ? profile.tagline_en : profile?.tagline;
  const name = locale === 'en' && profile?.name_en ? profile.name_en : profile?.name || '나현종';

  const navCards = [
    {
      key: 'thoughts',
      href: `/${locale}/thoughts`,
      label: nav.thoughts,
      desc: locale === 'ko' ? '에세이, 칼럼, 생각의 조각들' : 'Essays, columns, and fragments of thought',
    },
    {
      key: 'lab',
      href: `/${locale}/lab`,
      label: nav.lab,
      desc: locale === 'ko' ? 'AI와 비즈니스 응용 연구' : 'AI and Business Application Research',
    },
    {
      key: 'research',
      href: `/${locale}/research`,
      label: nav.research,
      desc: locale === 'ko' ? '학술 논문 및 연구 프로젝트' : 'Academic publications and projects',
    },
    {
      key: 'books',
      href: `/${locale}/book`,
      label: nav.books,
      desc: locale === 'ko' ? '저서 목록' : 'Published works',
    },
    {
      key: 'about',
      href: `/${locale}/about`,
      label: nav.about,
      desc: locale === 'ko' ? '이력과 활동' : 'Background and activities',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-40 pb-20">
        {/* Hero - Name + Tagline */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {loading ? (
            <div className="space-y-4">
              <div className="h-14 w-48 bg-surface-hover rounded animate-pulse" />
              <div className="h-6 w-96 bg-surface-hover rounded animate-pulse" />
            </div>
          ) : (
            <>
              <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6">
                {name}
              </h1>

              {tagline && (
                <p className="text-xl md:text-2xl text-text-secondary leading-relaxed mb-6 max-w-2xl">
                  {tagline}
                </p>
              )}

              <p className="text-sm text-text-tertiary">
                {profile?.affiliation} {profile?.title}
              </p>
            </>
          )}
        </motion.div>

        {/* Navigation Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {navCards.map((card) => (
            <motion.div key={card.key} variants={itemVariants}>
              <Link
                href={card.href}
                className="group block p-6 rounded-xl border border-border hover:border-border-hover bg-surface transition-all duration-200 hover:-translate-y-0.5"
              >
                <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent-blue transition-colors mb-2">
                  {card.label}
                </h2>
                <p className="text-sm text-text-secondary">{card.desc}</p>
                <span className="inline-block mt-3 text-sm text-text-tertiary group-hover:text-accent-blue transition-colors">
                  {t.explore} →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-text-tertiary text-sm">
          <p>{dictionary.footer.copyright} {name}</p>
        </div>
      </footer>
    </div>
  );
}
