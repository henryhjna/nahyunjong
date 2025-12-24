'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StorybookNavProps {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function StorybookNav({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: StorybookNavProps) {
  const [showButtons, setShowButtons] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Auto-hide buttons after inactivity
  const resetHideTimeout = useCallback(() => {
    setShowButtons(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowButtons(false);
    }, 3000);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
        resetHideTimeout();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
        resetHideTimeout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, hasPrev, hasNext, resetHideTimeout]);

  // Touch swipe detection
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      resetHideTimeout();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

      // Only trigger if horizontal swipe is greater than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && hasPrev) {
          onPrev();
        } else if (deltaX < 0 && hasNext) {
          onNext();
        }
      }

      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onPrev, onNext, hasPrev, hasNext, resetHideTimeout]);

  // Mouse movement shows buttons
  useEffect(() => {
    const handleMouseMove = () => resetHideTimeout();
    window.addEventListener('mousemove', handleMouseMove);
    resetHideTimeout();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [resetHideTimeout]);

  const buttonClass = `
    absolute top-1/2 -translate-y-1/2 z-20
    w-12 h-12 md:w-14 md:h-14
    flex items-center justify-center
    bg-surface/80 backdrop-blur-sm
    border border-border/50
    rounded-full shadow-lg
    text-text-primary
    transition-all duration-200
    hover:bg-surface hover:shadow-glow hover:scale-105
    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
    active:scale-95
  `;

  return (
    <AnimatePresence>
      {showButtons && (
        <>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`${buttonClass} left-2 md:left-4`}
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className={`${buttonClass} right-2 md:right-4`}
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
