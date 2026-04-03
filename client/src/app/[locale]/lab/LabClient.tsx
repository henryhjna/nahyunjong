'use client';

import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';

export default function LabClient() {
  const { dictionary } = useDictionary();
  const t = dictionary.lab;

  const capabilities = [
    { title: 'Data Analytics', desc: t.dataAnalytics },
    { title: 'ML / AI', desc: t.mlAi },
    { title: 'LLM / Agents', desc: t.llmAgents },
    { title: 'Robotics', desc: t.robotics },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <h1 className="text-4xl font-bold text-text-primary mb-2">LABA</h1>
          <p className="text-lg text-text-secondary mb-8">{t.subtitle}</p>

          {/* Description */}
          <p className="text-text-secondary leading-relaxed mb-12 max-w-2xl">
            {t.description}
          </p>

          {/* Capabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="p-5 rounded-xl border border-border bg-surface"
              >
                <h3 className="font-semibold text-text-primary mb-1">{cap.title}</h3>
                <p className="text-sm text-text-secondary">{cap.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA to laba.co.kr */}
          <a
            href="https://laba.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-blue text-white font-medium hover:bg-accent-blue/90 transition-colors"
          >
            {t.visitLaba}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </main>
    </div>
  );
}
