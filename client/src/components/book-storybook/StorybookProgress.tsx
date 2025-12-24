'use client';

import { motion } from 'framer-motion';

interface StorybookProgressProps {
  currentPage: number;
  totalPages: number;
  chapterTitle?: string;
}

export default function StorybookProgress({
  currentPage,
  totalPages,
  chapterTitle,
}: StorybookProgressProps) {
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1 bg-border/30 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Chapter title and page counter */}
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        {chapterTitle && (
          <motion.span
            key={chapterTitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-text-secondary truncate max-w-[60%]"
          >
            {chapterTitle}
          </motion.span>
        )}
        <span className="text-text-muted ml-auto">
          {currentPage + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
}
