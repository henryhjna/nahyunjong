'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

export default function EducationClient() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-6">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-sm text-text-secondary">Learning Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Education</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Interactive course materials, lectures, and resources
          </p>
        </motion.div>

        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            Interactive Learning
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Link
                href="/education/unfold-story"
                className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 border border-accent-purple/30 p-8 hover:border-accent-purple/50 transition-all duration-300"
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-purple/20 rounded-full blur-3xl group-hover:bg-accent-purple/30 transition-colors" />

                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mb-4 shadow-glow-purple">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary mb-1 group-hover:text-accent-purple transition-colors">
                        Unfold Story
                      </h3>
                      <p className="text-sm text-accent-purple font-medium">
                        Interactive Accounting Journey
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-status-success/20 text-status-success border border-status-success/30 rounded-full text-xs font-medium">
                      NEW
                    </span>
                  </div>

                  <p className="text-text-secondary mb-6">
                    K-Beauty 스타트업 이야기로 배우는 회계 원리 - 스토리북 방식의 인터랙티브 학습
                  </p>

                  <div className="flex items-center text-accent-purple font-medium group-hover:translate-x-2 transition-transform">
                    Start Learning
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative rounded-2xl bg-surface border border-border p-8 opacity-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-background-tertiary flex items-center justify-center mb-4">
                      <svg
                        className="w-7 h-7 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-1">
                      Financial Simulation
                    </h3>
                    <p className="text-sm text-text-tertiary">Coming Soon</p>
                  </div>
                  <span className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-muted">
                    Soon
                  </span>
                </div>

                <p className="text-text-tertiary mb-6">
                  Interactive business simulation game
                </p>

                <button
                  disabled
                  className="inline-flex items-center gap-2 px-4 py-2 bg-background-tertiary text-text-muted rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </span>
            Courses
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <div className="glass-card p-8 group hover:shadow-card-hover transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-accent-blue transition-colors">
                      Financial Accounting
                    </h3>
                    <p className="text-sm text-text-tertiary">BUS3001 · 2025 Spring</p>
                  </div>
                  <span className="px-3 py-1 bg-status-success/20 text-status-success border border-status-success/30 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>

                <p className="text-text-secondary mb-6">
                  Introduction to financial accounting principles and practices
                </p>

                <Link
                  href="/education/courses/1"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all text-sm font-medium"
                >
                  View Course
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="glass-card p-8 opacity-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-1">
                      Managerial Accounting
                    </h3>
                    <p className="text-sm text-text-tertiary">BUS3002 · 2025 Fall</p>
                  </div>
                  <span className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-muted">
                    Upcoming
                  </span>
                </div>

                <p className="text-text-tertiary mb-6">
                  Management accounting for decision making and control
                </p>

                <button
                  disabled
                  className="inline-flex items-center gap-2 px-4 py-2 bg-background-tertiary text-text-muted rounded-lg cursor-not-allowed text-sm"
                >
                  Coming Soon
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-text-tertiary text-sm">
          <p>© 2025 LABA · Hanyang University Business School</p>
        </div>
      </footer>
    </div>
  );
}
