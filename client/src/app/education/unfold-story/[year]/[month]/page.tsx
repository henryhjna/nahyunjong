'use client';

import React, { useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Quiz from '@/components/unfold-story/Quiz';

interface PageProps {
  params: {
    year: string;
    month: string;
  };
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  entries: {
    account: string;
    side: string;
    amount: number;
  }[];
  week?: number;
  concept?: string;
}

interface Scene {
  date: string;
  transactionId?: string;
  story: string;
  learningPoint?: string;
}

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
}

interface StoryData {
  month: string;
  monthLabel: string;
  title: string;
  intro: string;
  scenes: Scene[];
  quizzes: QuizQuestion[];
}

interface MonthData {
  month: string;
  monthLabel: string;
  transactions: Transaction[];
  financials: {
    statementOfFinancialPosition: {
      assets: Record<string, number>;
      liabilities: Record<string, number>;
      equity: Record<string, number>;
      totalAssets: number;
      totalLiabilities: number;
      totalEquity: number;
      totalAssetsFormatted: string;
      totalLiabilitiesFormatted: string;
      totalEquityFormatted: string;
    };
    incomeStatement: {
      revenues: Record<string, number>;
      expenses: Record<string, number>;
      totalRevenue: number;
      totalExpenses: number;
      netIncome: number;
      totalRevenueFormatted: string;
      totalExpensesFormatted: string;
      netIncomeFormatted: string;
    };
  };
}

// 계정과목의 유형과 증감을 판단하는 함수
function getAccountTypeDescription(account: string, side: '차변' | '대변'): string {
  // 자산 계정
  const assetAccounts = ['현금', '임차보증금', '선급비용', '비품', '무형자산', '상품', '매출채권'];
  // 부채 계정
  const liabilityAccounts = ['단기차입금', '매입채무', '미지급금', '감가상각누계액_비품', '감가상각누계액_무형자산'];
  // 자본 계정
  const equityAccounts = ['자본금', '이익잉여금'];
  // 수익 계정
  const revenueAccounts = ['매출'];
  // 비용 계정
  const expenseAccounts = ['매출원가', '감가상각비', '무형자산상각비', '임차료', '이자비용'];

  if (assetAccounts.includes(account)) {
    return side === '차변' ? '→ 자산 증가' : '→ 자산 감소';
  } else if (liabilityAccounts.includes(account)) {
    return side === '차변' ? '→ 부채 감소' : '→ 부채 증가';
  } else if (equityAccounts.includes(account)) {
    return side === '차변' ? '→ 자본 감소' : '→ 자본 증가';
  } else if (revenueAccounts.includes(account)) {
    return side === '차변' ? '→ 수익 감소' : '→ 수익 증가';
  } else if (expenseAccounts.includes(account)) {
    return side === '차변' ? '→ 비용 증가' : '→ 비용 감소';
  }
  return ''; // 알 수 없는 계정
}

// SceneSection 컴포넌트 - useState를 사용하기 위해 분리
function SceneSection({ scene, transaction, index }: {
  scene: Scene;
  transaction: Transaction | undefined;
  index: number;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Story - Full Width */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-8 shadow-lg border border-amber-100">
            <div className="mb-6">
              <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Scene {index + 1}
              </div>
            </div>
            <div className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
              {scene.story}
            </div>

            {/* Accordion Toggle Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-8 w-full flex items-center justify-between px-6 py-4 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{showDetails ? '📖' : '📚'}</span>
                <span className="font-semibold text-blue-900">
                  {showDetails ? '회계 정보 닫기' : '💡 학습 포인트 & 분개장 보기'}
                </span>
              </div>
              <svg
                className={`w-6 h-6 text-blue-900 transition-transform ${
                  showDetails ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Accordion Content */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                {/* Learning Point */}
                {scene.learningPoint && (
                  <div className="mb-6 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-r-xl">
                    <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                      {scene.learningPoint}
                    </div>
                  </div>
                )}

                {/* Transaction Journal Entry */}
                {transaction && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <div className="mb-4">
                      <div className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold mb-2">
                        📋 분개장 (Journal Entry)
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {transaction.date} | {transaction.description}
                      </div>
                    </div>

                    {/* Journal Entry Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-300">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              차변 (Debit)
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                              금액
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transaction.entries
                            .filter((entry) => entry.side === '차변')
                            .map((entry, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {entry.account}
                                  <span className="text-xs text-gray-500 ml-2">
                                    {getAccountTypeDescription(entry.account, '차변')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 font-mono">
                                  {entry.amount.toLocaleString()}원
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <table className="w-full mt-4">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              대변 (Credit)
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                              금액
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transaction.entries
                            .filter((entry) => entry.side === '대변')
                            .map((entry, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {entry.account}
                                  <span className="text-xs text-gray-500 ml-2">
                                    {getAccountTypeDescription(entry.account, '대변')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 font-mono">
                                  {entry.amount.toLocaleString()}원
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function StoryPage({ params }: PageProps) {
  const router = useRouter();
  const { year, month } = params;

  const { scrollYProgress } = useScroll();

  // Dynamically load monthly transaction and story data
  let monthData: MonthData | null = null;
  let story: StoryData | null = null;

  try {
    // Import monthly transaction data
    monthData = require(`@/data/unfold-story/${year}/${year}-${month}-transactions.json`);
    // Import monthly story data
    story = require(`@/data/unfold-story/${year}/${year}-${month}-story.json`);
  } catch (error) {
    console.error('Failed to load monthly data:', error);
  }

  if (!monthData || !story) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            스토리를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-4">
            {year}년 {month}월 데이터를 불러올 수 없습니다.
          </p>
          <button
            onClick={() => router.push('/education/unfold-story')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Check if story has scenes (content is ready)
  const hasStoryContent = story.scenes && story.scenes.length > 0;

  if (!hasStoryContent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            스토리 콘텐츠 준비중입니다
          </h1>
          <p className="text-gray-600 mb-4">
            {year}년 {month}월 스토리는 아직 작성 중입니다.
          </p>
          <button
            onClick={() => router.push('/education/unfold-story')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/education/unfold-story')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>목록으로</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{story.title}</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Intro Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">📅</div>
              <h2 className="text-3xl font-bold text-gray-900">{story.title}</h2>
            </div>
            <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {story.intro}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scenes */}
      {story.scenes.map((scene, index) => {
        const transaction = monthData.transactions.find(
          (t) => t.id === scene.transactionId
        );

        return (
          <SceneSection
            key={index}
            scene={scene}
            transaction={transaction}
            index={index}
          />
        );
      })}

      {/* Quizzes */}
      {story.quizzes && story.quizzes.length > 0 && (
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  학습 점검 퀴즈
                </h2>
                <p className="text-gray-600">
                  {story.monthLabel} 스토리를 제대로 이해했는지 확인해보세요!
                </p>
              </div>
              {story.quizzes.map((quiz, index) => (
                <div key={index} className="mb-6">
                  <Quiz
                    question={quiz.question}
                    options={quiz.options}
                    explanation={quiz.explanation}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Financial Summary */}
      <section className="container mx-auto px-6 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {story.monthLabel} 재무 현황
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Statement of Financial Position */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>재무상태표</span>
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-2">
                      자산 (Assets)
                    </div>
                    {Object.entries(
                      monthData.financials.statementOfFinancialPosition.assets
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-sm text-gray-700 mb-1"
                      >
                        <span>{key}</span>
                        <span className="font-mono">
                          {value.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between text-sm font-bold text-gray-900">
                      <span>총 자산</span>
                      <span className="font-mono">
                        {monthData.financials.statementOfFinancialPosition.totalAssets.toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-2">
                      부채 (Liabilities)
                    </div>
                    {Object.entries(
                      monthData.financials.statementOfFinancialPosition.liabilities
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-sm text-gray-700 mb-1"
                      >
                        <span>{key}</span>
                        <span className="font-mono">
                          {value.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between text-sm font-bold text-gray-900">
                      <span>총 부채</span>
                      <span className="font-mono">
                        {monthData.financials.statementOfFinancialPosition.totalLiabilities.toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-2">
                      자본 (Equity)
                    </div>
                    {Object.entries(
                      monthData.financials.statementOfFinancialPosition.equity
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-sm text-gray-700 mb-1"
                      >
                        <span>{key}</span>
                        <span className="font-mono">
                          {value.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between text-sm font-bold text-gray-900">
                      <span>총 자본</span>
                      <span className="font-mono">
                        {monthData.financials.statementOfFinancialPosition.totalEquity.toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Income Statement */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📈</span>
                  <span>손익계산서</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-green-600 mb-2">
                      수익 (Revenue)
                    </div>
                    {Object.entries(
                      monthData.financials.incomeStatement.revenues
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-sm text-gray-700 mb-1"
                      >
                        <span>{key}</span>
                        <span className="font-mono text-green-600">
                          +{value.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between text-sm font-bold text-green-600">
                      <span>총 수익</span>
                      <span className="font-mono">
                        {monthData.financials.incomeStatement.totalRevenue.toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-red-600 mb-2">
                      비용 (Expenses)
                    </div>
                    {Object.entries(
                      monthData.financials.incomeStatement.expenses
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-sm text-gray-700 mb-1"
                      >
                        <span>{key}</span>
                        <span className="font-mono text-red-600">
                          -{value.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between text-sm font-bold text-red-600">
                      <span>총 비용</span>
                      <span className="font-mono">
                        {monthData.financials.incomeStatement.totalExpenses.toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-400 mt-4 pt-4">
                    <div
                      className={`flex justify-between text-lg font-bold ${
                        monthData.financials.incomeStatement.netIncome >= 0
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}
                    >
                      <span>당기순이익 (Net Income)</span>
                      <span className="font-mono">
                        {monthData.financials.incomeStatement.netIncome >= 0
                          ? '+'
                          : ''}
                        {monthData.financials.incomeStatement.netIncome.toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <button
            onClick={() => router.push('/education/unfold-story')}
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <span>←</span>
            <span>다른 월 스토리 보러가기</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
