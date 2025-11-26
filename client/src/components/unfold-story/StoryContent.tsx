'use client';

import { motion } from 'framer-motion';

interface StoryContentProps {
  month: string;
  children: React.ReactNode;
}

export default function StoryContent({ month, children }: StoryContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-8 mb-8 prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-primary prose-strong:text-text-primary"
    >
      {children}
    </motion.div>
  );
}
