'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface StorybookPageProps {
  imageUrl: string | null;
  textContent: string | null;
  chapterTitle?: string;
  isChapterTitle?: boolean;
  direction: number; // -1 for prev, 1 for next
}

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const pageTransition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut',
};

export default function StorybookPage({
  imageUrl,
  textContent,
  chapterTitle,
  isChapterTitle = false,
  direction,
}: StorybookPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';

  const fullImageUrl = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${apiUrl}${imageUrl}`
    : null;

  // Chapter Title Page - special layout
  if (isChapterTitle) {
    return (
      <motion.div
        custom={direction}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={pageTransition}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-surface to-background"
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Background Image */}
          {fullImageUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-surface animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
                </div>
              )}
              <Image
                src={fullImageUrl}
                alt={chapterTitle || 'Chapter cover'}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="100vw"
                priority
                unoptimized
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : (
            /* No image - show decorative background */
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-accent-purple/10 to-accent-pink/20" />
          )}

          {/* Chapter Title */}
          <div className="relative z-10 text-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <span className="text-sm font-medium tracking-widest uppercase text-white/60">
                Chapter
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg"
            >
              {chapterTitle}
            </motion.h1>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular Page - original layout
  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={pageTransition}
      className="absolute inset-0 flex flex-col"
    >
      {/* Image area - 60% height */}
      <div className="relative flex-[6] bg-gradient-to-b from-surface/50 to-surface overflow-hidden">
        {fullImageUrl && !imageError ? (
          <>
            {/* Loading shimmer */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-surface animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
              </div>
            )}
            <Image
              src={fullImageUrl}
              alt="Page illustration"
              fill
              className={`object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="100vw"
              priority
              unoptimized
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-text-muted">
              <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">이미지 없음</p>
            </div>
          </div>
        )}
      </div>

      {/* Text area - 40% height */}
      <div className="flex-[4] overflow-y-auto bg-surface border-t border-border/30">
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
          {textContent ? (
            <p className="text-lg md:text-xl leading-relaxed text-text-primary whitespace-pre-wrap">
              {textContent}
            </p>
          ) : (
            <p className="text-text-muted text-center italic">
              텍스트 없음
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
