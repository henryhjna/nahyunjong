'use client';

import { Header } from '@/components/Header';
import { useDictionary } from '@/contexts/DictionaryContext';
import { motion } from 'framer-motion';

export default function LabClient() {
  const { dictionary, locale } = useDictionary();
  const t = dictionary.lab;

  const capabilities = locale === 'ko'
    ? [
        { title: 'Data Analytics', desc: '비즈니스 데이터 분석과 인사이트 도출' },
        { title: 'ML / AI', desc: '머신러닝과 인공지능 기반 예측 모델 개발' },
        { title: 'LLM / Agents', desc: '대규모 언어 모델과 AI 에이전트 활용 연구' },
        { title: 'Robotics', desc: 'Physical AI와 로봇 비즈니스 응용' },
      ]
    : [
        { title: 'Data Analytics', desc: 'Business data analysis and insight generation' },
        { title: 'ML / AI', desc: 'Predictive model development using machine learning and AI' },
        { title: 'LLM / Agents', desc: 'Research on large language models and AI agents' },
        { title: 'Robotics', desc: 'Physical AI and robotics for business applications' },
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
