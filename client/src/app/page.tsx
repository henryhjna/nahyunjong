'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useState, useEffect } from 'react';
import type { ProfileBasic } from '@/lib/types';

export default function Home() {
  const [profile, setProfile] = useState<ProfileBasic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/basic`);
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

  // Static class mappings for Tailwind (dynamic classes don't work with Tailwind's static analysis)
  const accentStyles = {
    'accent-blue': {
      iconBg: 'bg-accent-blue/10',
      iconText: 'text-accent-blue',
    },
    'accent-purple': {
      iconBg: 'bg-accent-purple/10',
      iconText: 'text-accent-purple',
    },
    'accent-teal': {
      iconBg: 'bg-accent-teal/10',
      iconText: 'text-accent-teal',
    },
    'accent-cyan': {
      iconBg: 'bg-accent-cyan/10',
      iconText: 'text-accent-cyan',
    },
  } as const;

  type AccentKey = keyof typeof accentStyles;

  const navCards: Array<{
    title: string;
    href: string;
    icon: React.ReactNode;
    desc: string;
    gradient: string;
    accent: AccentKey;
  }> = [
    {
      title: 'Research',
      href: '/research',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      desc: 'Academic publications & research projects',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      accent: 'accent-blue',
    },
    {
      title: 'Lab',
      href: '/lab',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      desc: 'Lab for Accounting Bigdata & AI',
      gradient: 'from-purple-500/20 to-pink-500/20',
      accent: 'accent-purple',
    },
    {
      title: 'Education',
      href: '/education',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      desc: 'Interactive courses & lecture materials',
      gradient: 'from-teal-500/20 to-emerald-500/20',
      accent: 'accent-teal',
    },
    {
      title: 'Book',
      href: '/book',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      desc: 'Published books & textbooks',
      gradient: 'from-orange-500/20 to-amber-500/20',
      accent: 'accent-cyan',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-glow pointer-events-none" />

      <Header />

      {/* Hero Section - Profile */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Card */}
          <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 md:p-12">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-accent-blue/5 to-accent-purple/5" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              {/* Profile Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative flex-shrink-0"
              >
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 border border-border overflow-hidden">
                  {profile?.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 rounded-2xl blur-xl -z-10" />
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {/* Name */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold text-text-primary mb-2"
                >
                  {loading ? (
                    <span className="inline-block w-32 h-12 bg-surface-hover rounded animate-pulse" />
                  ) : (
                    profile?.name || '나현종'
                  )}
                </motion.h1>

                {/* English Name */}
                {profile?.name_en && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-lg text-text-secondary mb-4"
                  >
                    {profile.name_en}
                  </motion.p>
                )}

                {/* Title & Affiliation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6"
                >
                  {(profile?.affiliation || profile?.title) && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {profile?.affiliation} {profile?.title}
                    </span>
                  )}
                  {profile?.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-text-secondary text-sm hover:border-accent-blue hover:text-accent-blue transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.email}
                    </a>
                  )}
                  {/* ORCID */}
                  <a
                    href="https://orcid.org/0000-0002-6475-128X"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-text-secondary text-sm hover:border-[#a6ce39] hover:text-[#a6ce39] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zM86.3 186.2H70.9V79.1h15.4v107.1zM78.6 70.8c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8 9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8zm94.8 115.4h-15.4v-49.5c0-17.2-6.1-25.9-18.4-25.9-13.5 0-20.3 8.8-20.3 26.3v49.1H104V79.1h15.4v14.6h.2c6.1-10.8 16.3-16.3 28.8-16.3 20.5 0 30.9 14.1 30.9 38.8v69.9h.1z"/>
                    </svg>
                    ORCID
                  </a>
                  {/* Google Scholar */}
                  <a
                    href="https://scholar.google.com/citations?user=Y7ki3dEAAAAJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-text-secondary text-sm hover:border-[#4285f4] hover:text-[#4285f4] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 24a7 7 0 110-14 7 7 0 010 14zm0-24L0 9.5l4.838 3.94A8 8 0 0112 9a8 8 0 017.162 4.44L24 9.5z"/>
                    </svg>
                    Google Scholar
                  </a>
                </motion.div>

                {/* Bio */}
                {profile?.bio && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="text-text-secondary leading-relaxed mb-6 max-w-2xl"
                  >
                    {profile.bio}
                  </motion.p>
                )}

                {/* Research Interests */}
                {profile?.research_interests && profile.research_interests.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <p className="text-sm text-text-tertiary mb-3">Research Interests</p>
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
                  </motion.div>
                )}

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium hover:shadow-glow transition-all duration-300"
                  >
                    <span>View Full Profile</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Cards */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {navCards.map((card) => (
            <motion.div key={card.title} variants={itemVariants}>
              <Link
                href={card.href}
                className="group block relative overflow-hidden rounded-2xl bg-surface border border-border p-6 h-full transition-all duration-300 hover:border-border-hover hover:shadow-card-hover hover:-translate-y-1"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${accentStyles[card.accent].iconBg} flex items-center justify-center mb-4 ${accentStyles[card.accent].iconText} group-hover:shadow-glow-sm transition-shadow duration-300`}>
                    {card.icon}
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mb-2 group-hover:gradient-text transition-all duration-300">
                    {card.title}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {card.desc}
                  </p>

                  {/* Arrow Icon */}
                  <div className="mt-4 flex items-center text-text-tertiary group-hover:text-accent-blue transition-colors duration-300">
                    <span className="text-sm mr-2">Explore</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-text-tertiary text-sm">
          <p>© 2025 {profile?.name || '나현종'} · {profile?.affiliation || '홍익대학교'}</p>
        </div>
      </footer>
    </div>
  );
}
