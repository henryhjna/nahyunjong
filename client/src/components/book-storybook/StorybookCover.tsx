'use client';

import { motion } from 'framer-motion';
import { X, ChevronRight, BookOpen } from 'lucide-react';
import { BookChapter } from '@/lib/types';
import GeminiBadge from './GeminiBadge';

interface StorybookCoverProps {
  bookTitle: string;
  authors?: string;
  chapters: BookChapter[];
  onSelectChapter: (chapterId: number) => void;
  onClose: () => void;
}

export default function StorybookCover({
  bookTitle,
  authors,
  chapters,
  onSelectChapter,
  onClose,
}: StorybookCoverProps) {
  // Calculate page count for each chapter
  const getChapterPageCount = (chapter: BookChapter) => {
    return 1 + (chapter.pages?.length || 0); // title page + content pages
  };

  const totalPages = chapters.reduce(
    (sum, chapter) => sum + getChapterPageCount(chapter),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-surface via-background to-surface flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-end p-4">
        <button
          onClick={onClose}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-surface"
          aria-label="닫기"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="max-w-lg mx-auto">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center mb-6"
          >
            <GeminiBadge size="lg" variant="default" />
            <p className="text-sm text-text-muted mt-2">
              Gemini가 만든 동화 버전
            </p>
          </motion.div>

          {/* Book Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              {bookTitle}
            </h1>
            {authors && (
              <p className="text-text-secondary">{authors}</p>
            )}
          </motion.div>

          {/* Chapter List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">목차</h2>
            </div>

            {chapters.map((chapter, index) => {
              const pageCount = getChapterPageCount(chapter);

              return (
                <motion.button
                  key={chapter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
                  onClick={() => onSelectChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-surface border border-border hover:border-accent-blue/50 hover:shadow-card transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Chapter number */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>

                    {/* Chapter info */}
                    <div className="text-left">
                      <p className="font-medium text-text-primary group-hover:text-accent-blue transition-colors">
                        {chapter.title}
                      </p>
                      <p className="text-sm text-text-muted">
                        {pageCount}페이지
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-blue transition-colors" />
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center border-t border-border/50">
        <p className="text-sm text-text-muted">
          총 {chapters.length}개 챕터 · {totalPages}페이지
        </p>
      </footer>
    </motion.div>
  );
}
