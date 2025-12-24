'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { BookChapter } from '@/lib/types';

interface StorybookChapterListProps {
  chapters: BookChapter[];
  currentChapterId: number;
  chapterStartIndices: Map<number, number>;
  flatPagesLength: number;
  onSelectChapter: (chapterId: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function StorybookChapterList({
  chapters,
  currentChapterId,
  chapterStartIndices,
  flatPagesLength,
  onSelectChapter,
  onClose,
  isOpen,
}: StorybookChapterListProps) {
  // Calculate page ranges for each chapter
  const getChapterPageRange = (chapter: BookChapter, index: number) => {
    const startIndex = chapterStartIndices.get(chapter.id) || 0;
    const pagesCount = 1 + (chapter.pages?.length || 0); // title + pages
    const endIndex = startIndex + pagesCount - 1;
    return { start: startIndex + 1, end: endIndex + 1 }; // 1-indexed for display
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-surface rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="text-lg font-bold text-text-primary">목차</h2>
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chapters.map((chapter, index) => {
                const isActive = chapter.id === currentChapterId;
                const range = getChapterPageRange(chapter, index);

                return (
                  <motion.button
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelectChapter(chapter.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-accent-blue/20 border border-accent-blue/30'
                        : 'bg-background hover:bg-background/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Chapter number indicator */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isActive
                            ? 'bg-accent-blue text-white'
                            : 'bg-border/50 text-text-muted'
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Chapter title */}
                      <div className="text-left">
                        <p
                          className={`font-medium ${
                            isActive ? 'text-accent-blue' : 'text-text-primary'
                          }`}
                        >
                          {chapter.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {range.start === range.end
                            ? `페이지 ${range.start}`
                            : `페이지 ${range.start} - ${range.end}`}
                        </p>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <ChevronRight
                      className={`w-5 h-5 ${
                        isActive ? 'text-accent-blue' : 'text-text-muted'
                      }`}
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Footer with total pages */}
            <div className="p-4 border-t border-border/50 text-center text-sm text-text-muted">
              총 {flatPagesLength}페이지
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
