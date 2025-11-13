'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MonthInfo {
  month: string;
  label: string;
  available: boolean;
}

export default function UnfoldStoryPage() {
  const [selectedYear, setSelectedYear] = useState<2022 | 2023>(2022);

  const months2022: MonthInfo[] = [
    { month: '03', label: '3월 - 창업의 시작', available: true },
    { month: '04', label: '4월 - 외상 매출', available: false },
    { month: '05', label: '5월', available: false },
    { month: '06', label: '6월', available: false },
    { month: '07', label: '7월', available: false },
    { month: '08', label: '8월', available: false },
    { month: '09', label: '9월', available: false },
    { month: '10', label: '10월', available: false },
    { month: '11', label: '11월', available: false },
    { month: '12', label: '12월', available: false },
  ];

  const months2023: MonthInfo[] = [
    { month: '01', label: '1월', available: false },
    { month: '02', label: '2월', available: false },
    { month: '03', label: '3월', available: false },
    { month: '04', label: '4월', available: false },
    { month: '05', label: '5월', available: false },
    { month: '06', label: '6월', available: false },
    { month: '07', label: '7월 - 제조업 전환', available: false },
    { month: '08', label: '8월', available: false },
    { month: '09', label: '9월', available: false },
    { month: '10', label: '10월', available: false },
    { month: '11', label: '11월', available: false },
    { month: '12', label: '12월 - 시리즈B', available: false },
  ];

  const currentMonths = selectedYear === 2022 ? months2022 : months2023;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📖</div>
            <h1 className="text-3xl font-bold text-gray-900">
              언폴드의 창업 성공 스토리
            </h1>
          </div>
          <p className="text-gray-600">
            K-Beauty 스타트업의 3년 여정을 통해 배우는 회계원리 - 동화책처럼 읽는 회계 이야기
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-2 border-purple-200"
        >
          <div className="flex items-start gap-6">
            <div className="text-6xl">👩‍🔬</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                주인공 소개
              </h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong className="text-purple-600">박유진</strong>은 대학에서 화학을 전공하고 석사까지 마친 후,
                유명 뷰티 대기업에서 5년간 연구원으로 근무했습니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                자신의 피부 트러블을 해결하기 위해 직접 연구한 포뮬러가 주변 사람들에게
                큰 호응을 얻으면서, <strong className="text-blue-600">언폴드(Unfold)</strong>를 창업하기로 결심합니다.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedYear(2022)}
            className={`flex-1 px-8 py-6 rounded-xl font-bold text-lg transition-all ${
              selectedYear === 2022
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <div className="text-3xl mb-2">🚀</div>
            <div>2022년</div>
            <div className="text-sm opacity-75">창업기 - OEM 판매</div>
          </button>
          <button
            onClick={() => setSelectedYear(2023)}
            className={`flex-1 px-8 py-6 rounded-xl font-bold text-lg transition-all ${
              selectedYear === 2023
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <div className="text-3xl mb-2">🏭</div>
            <div>2023년</div>
            <div className="text-sm opacity-75">성장기 - 제조 전환</div>
          </button>
        </div>

        <motion.div
          key={selectedYear}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📚</span>
            <span>{selectedYear}년 이야기 선택하기</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {currentMonths.map((month) => (
              <motion.div
                key={month.month}
                whileHover={month.available ? { scale: 1.02 } : {}}
                whileTap={month.available ? { scale: 0.98 } : {}}
              >
                {month.available ? (
                  <Link
                    href={`/education/unfold-story/${selectedYear}/${month.month}`}
                    className="block p-6 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 hover:border-purple-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">📖</div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {month.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          스토리 읽기 →
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="p-6 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl grayscale">📖</div>
                      <div>
                        <div className="font-bold text-gray-500">
                          {month.label}
                        </div>
                        <div className="text-sm text-gray-400">준비중...</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>이렇게 학습하세요</span>
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>위에서 읽고 싶은 월을 선택하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                동화책처럼 스토리를 읽어가면서, 각 거래마다 분개와 재무제표가 어떻게 변하는지 확인하세요
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                중간중간 나오는 퀴즈를 풀면서 이해도를 체크하세요
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>
                실제 스타트업이 겪는 회계 상황을 간접 경험하면서 자연스럽게 회계원리를 익힐 수 있습니다
              </span>
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
}
