'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Maximize2, Minimize2, X, BookOpen, List } from 'lucide-react';
import StorybookProgress from './StorybookProgress';
import StorybookNav from './StorybookNav';
import StorybookPage from './StorybookPage';
import StorybookChapterList from './StorybookChapterList';
import StorybookCover from './StorybookCover';
import GeminiBadge from './GeminiBadge';
import { BookChapter, FlatPage } from '@/lib/types';

interface StorybookReaderProps {
  bookId: string;
  bookTitle: string;
  bookAuthors?: string;
  chapters: BookChapter[];
  totalPages: number;
}

export default function StorybookReader({
  bookId,
  bookTitle,
  bookAuthors,
  chapters,
  totalPages,
}: StorybookReaderProps) {
  const router = useRouter();
  const [showCover, setShowCover] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);

  // Flatten pages from chapters (including chapter title pages)
  const flatPages: FlatPage[] = useMemo(() => {
    const pages: FlatPage[] = [];
    chapters.forEach((chapter) => {
      // Add chapter title page first
      pages.push({
        id: -chapter.id, // negative ID for title pages
        chapter_id: chapter.id,
        image_url: chapter.cover_image_url || null,
        text_content: null,
        order_index: -1,
        chapterTitle: chapter.title,
        chapterId: chapter.id,
        globalIndex: pages.length,
        isChapterTitle: true,
        created_at: '',
        updated_at: '',
      });

      // Add regular pages
      (chapter.pages || []).forEach((page) => {
        pages.push({
          ...page,
          chapterTitle: chapter.title,
          chapterId: chapter.id,
          globalIndex: pages.length,
          isChapterTitle: false,
        });
      });
    });
    return pages;
  }, [chapters]);

  // Calculate chapter start indices for navigation
  const chapterStartIndices = useMemo(() => {
    const indices: Map<number, number> = new Map();
    let currentIndex = 0;
    chapters.forEach((chapter) => {
      indices.set(chapter.id, currentIndex);
      currentIndex += 1 + (chapter.pages?.length || 0); // title + pages
    });
    return indices;
  }, [chapters]);

  const currentPage = flatPages[currentPageIndex];

  // Navigation handlers
  const goToPrev = useCallback(() => {
    if (currentPageIndex > 0) {
      setDirection(-1);
      setCurrentPageIndex((prev) => prev - 1);
    }
  }, [currentPageIndex]);

  const goToNext = useCallback(() => {
    if (currentPageIndex < flatPages.length - 1) {
      setDirection(1);
      setCurrentPageIndex((prev) => prev + 1);
    }
  }, [currentPageIndex, flatPages.length]);

  const goToChapter = useCallback((chapterId: number) => {
    const startIndex = chapterStartIndices.get(chapterId);
    if (startIndex !== undefined) {
      setDirection(startIndex > currentPageIndex ? 1 : -1);
      setCurrentPageIndex(startIndex);
    }
    setIsChapterListOpen(false);
    setShowCover(false);
  }, [chapterStartIndices, currentPageIndex]);

  // Fullscreen handlers
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Empty state
  if (flatPages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">뒤로</span>
            </button>
            <h1 className="text-lg font-medium text-text-primary truncate max-w-[50%]">
              {bookTitle}
            </h1>
            <div className="w-20" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-text-muted">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">아직 등록된 페이지가 없습니다</p>
            <p className="text-sm mt-2">관리자가 콘텐츠를 추가하면 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    );
  }

  // Cover screen - chapter selection
  if (showCover) {
    return (
      <StorybookCover
        bookTitle={bookTitle}
        authors={bookAuthors}
        chapters={chapters}
        onSelectChapter={goToChapter}
        onClose={() => router.push(`/book/${bookId}`)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setShowCover(true)}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">목차</span>
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base font-medium text-text-primary truncate max-w-[200px] sm:max-w-[300px]">
              {bookTitle}
            </h1>
            <GeminiBadge size="sm" variant="subtle" showText={false} />
          </div>

          <div className="flex items-center gap-1">
            {chapters.length > 1 && (
              <button
                onClick={() => setIsChapterListOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-all"
                aria-label="목차"
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">목차</span>
              </button>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => router.push(`/book/${bookId}`)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <StorybookProgress
          currentPage={currentPageIndex}
          totalPages={flatPages.length}
          chapterTitle={currentPage?.chapterTitle}
        />
      </header>

      {/* Main content area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <StorybookPage
            key={currentPageIndex}
            imageUrl={currentPage?.image_url || null}
            textContent={currentPage?.text_content || null}
            chapterTitle={currentPage?.chapterTitle || ''}
            isChapterTitle={currentPage?.isChapterTitle || false}
            direction={direction}
          />
        </AnimatePresence>

        {/* Navigation */}
        <StorybookNav
          onPrev={goToPrev}
          onNext={goToNext}
          hasPrev={currentPageIndex > 0}
          hasNext={currentPageIndex < flatPages.length - 1}
        />
      </main>

      {/* Chapter List */}
      <StorybookChapterList
        chapters={chapters}
        currentChapterId={currentPage?.chapterId || 0}
        chapterStartIndices={chapterStartIndices}
        flatPagesLength={flatPages.length}
        onSelectChapter={goToChapter}
        onClose={() => setIsChapterListOpen(false)}
        isOpen={isChapterListOpen}
      />
    </div>
  );
}
