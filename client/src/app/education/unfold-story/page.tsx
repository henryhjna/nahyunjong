'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

interface MonthInfo {
  month: string;
  label: string;
}

export default function UnfoldStoryPage() {
  const { isAdmin } = useAuth();
  const [selectedYear, setSelectedYear] = useState<2022 | 2023>(2022);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [generatingMonth, setGeneratingMonth] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<Record<string, string[]>>({
    '2022': [],
    '2023': [],
  });

  // Load available months on mount and check for pending generations
  useEffect(() => {
    fetchAvailability();
    checkPendingGeneration();
  }, []);

  const checkPendingGeneration = () => {
    const pending = localStorage.getItem('generatingStory');
    if (pending) {
      const { year, month, timestamp } = JSON.parse(pending);
      const elapsed = Date.now() - timestamp;

      // If more than 5 minutes elapsed, assume it failed
      if (elapsed > 5 * 60 * 1000) {
        localStorage.removeItem('generatingStory');
        return;
      }

      // Resume showing the progress
      setGeneratingMonth(`${year}-${month}`);
      setUpdateMessage(`${year}년 ${parseInt(month)}월 스토리 생성 중... (약 2-3분 소요)`);

      // Start polling for both availability and detailed status
      const pollInterval = setInterval(async () => {
        // Check detailed status
        try {
          const statusResponse = await fetch(`/api/unfold-story/status?year=${year}&month=${String(month).padStart(2, '0')}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.step && statusData.message) {
              setUpdateMessage(`[단계 ${statusData.step}/5] ${statusData.message}`);
            }
          }
        } catch (error) {
          console.error('Failed to fetch status:', error);
        }

        // Check if complete
        await fetchAvailability();
        const monthKey = String(month).padStart(2, '0');
        const available = availableMonths[year.toString()] || [];

        if (available.includes(monthKey)) {
          // Generation complete!
          clearInterval(pollInterval);
          localStorage.removeItem('generatingStory');
          setGeneratingMonth(null);
          setUpdateMessage(`✅ ${year}년 ${parseInt(month)}월 스토리 생성 완료!`);
          setTimeout(() => setUpdateMessage(''), 3000);
        }
      }, 3000); // Poll every 3 seconds

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        localStorage.removeItem('generatingStory');
      }, 5 * 60 * 1000);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/unfold-story/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailableMonths(data);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleUpdateData = async () => {
    setIsUpdating(true);
    setUpdateMessage('전체 스토리 생성 중... (약 30-40분 소요)');

    try {
      const response = await fetch('/api/unfold-story/update', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateMessage('✅ ' + data.message);
        await fetchAvailability(); // Refresh availability
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setUpdateMessage('❌ 업데이트 실패: ' + data.error);
      }
    } catch (error) {
      setUpdateMessage('❌ 업데이트 실패: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateStory = async (year: number, month: string) => {
    const monthKey = `${year}-${month}`;
    setGeneratingMonth(monthKey);
    setUpdateMessage(`[단계 1/5] ${year}년 ${parseInt(month)}월 스토리 생성 중...`);

    // Save to localStorage so we can resume after refresh
    localStorage.setItem('generatingStory', JSON.stringify({
      year,
      month,
      timestamp: Date.now()
    }));

    // Start polling for status updates
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/unfold-story/status?year=${year}&month=${String(month).padStart(2, '0')}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.step && statusData.message) {
            setUpdateMessage(`[단계 ${statusData.step}/5] ${statusData.message}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    }, 2000); // Poll every 2 seconds

    try {
      const response = await fetch('/api/unfold-story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month: parseInt(month) }),
      });

      const data = await response.json();
      clearInterval(pollInterval);

      if (response.ok) {
        localStorage.removeItem('generatingStory');
        setUpdateMessage(`✅ ${year}년 ${parseInt(month)}월 스토리 생성 완료!`);
        await fetchAvailability(); // Refresh availability
        setTimeout(() => {
          setUpdateMessage('');
          // Force page reload to show new content
          window.location.reload();
        }, 2000);
      } else {
        localStorage.removeItem('generatingStory');
        setUpdateMessage(`❌ 생성 실패: ${data.error}`);
      }
    } catch (error) {
      clearInterval(pollInterval);
      localStorage.removeItem('generatingStory');
      setUpdateMessage(`❌ 생성 실패: ${(error as Error).message}`);
    } finally {
      setGeneratingMonth(null);
    }
  };

  const allMonths2022: MonthInfo[] = [
    { month: '03', label: '3월 - 창업의 시작' },
    { month: '04', label: '4월 - 외상 매출' },
    { month: '05', label: '5월' },
    { month: '06', label: '6월' },
    { month: '07', label: '7월' },
    { month: '08', label: '8월' },
    { month: '09', label: '9월' },
    { month: '10', label: '10월' },
    { month: '11', label: '11월' },
    { month: '12', label: '12월' },
  ];

  const allMonths2023: MonthInfo[] = [
    { month: '01', label: '1월' },
    { month: '03', label: '3월' },
    { month: '04', label: '4월' },
    { month: '05', label: '5월' },
    { month: '06', label: '6월' },
    { month: '07', label: '7월 - 제조업 전환' },
    { month: '09', label: '9월' },
    { month: '10', label: '10월' },
    { month: '11', label: '11월' },
    { month: '12', label: '12월 - 시리즈B' },
  ];

  const currentMonths = selectedYear === 2022 ? allMonths2022 : allMonths2023;
  const currentAvailable = availableMonths[selectedYear.toString()] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Header />

      {/* Progress Banner */}
      {updateMessage && (
        <div className={`fixed top-16 left-0 right-0 z-50 px-6 py-4 text-center font-semibold shadow-lg ${
          updateMessage.startsWith('✅')
            ? 'bg-green-500 text-white'
            : updateMessage.startsWith('❌')
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          {updateMessage}
        </div>
      )}
      <div className={`bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm ${updateMessage ? 'mt-16' : ''}`}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📖</div>
              <h1 className="text-3xl font-bold text-gray-900">
                언폴드의 창업 성공 스토리
              </h1>
            </div>
            {isAdmin && (
              <button
                onClick={handleUpdateData}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isUpdating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-md'
                }`}
              >
                <span>🔄</span>
                <span>{isUpdating ? '업데이트 중...' : '스토리 및 분개 업데이트'}</span>
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              K-Beauty 스타트업의 3년 여정을 통해 배우는 회계원리 - 동화책처럼 읽는 회계 이야기
            </p>
            {updateMessage && (
              <p className={`text-sm font-semibold ${
                updateMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'
              }`}>
                {updateMessage}
              </p>
            )}
          </div>
        </div>
      </div>

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
            {currentMonths.map((month) => {
              const isAvailable = currentAvailable.includes(month.month);

              return (
                <motion.div
                  key={month.month}
                  whileHover={isAvailable ? { scale: 1.02 } : {}}
                  whileTap={isAvailable ? { scale: 0.98 } : {}}
                >
                  {isAvailable ? (
                    <div className="p-6 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="flex items-center justify-between mb-4">
                        <Link
                          href={`/education/unfold-story/${selectedYear}/${month.month}`}
                          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                        >
                          <div className="text-3xl">📖</div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {month.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              스토리 읽기 →
                            </div>
                          </div>
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleGenerateStory(selectedYear, month.month)}
                            disabled={generatingMonth === `${selectedYear}-${month.month}`}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                              generatingMonth === `${selectedYear}-${month.month}`
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50'
                            }`}
                            title="스토리 재생성"
                          >
                            <span>🔄</span>
                            <span>{generatingMonth === `${selectedYear}-${month.month}` ? '생성 중' : '재생성'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg border-2 border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl grayscale">📖</div>
                          <div>
                            <div className="font-bold text-gray-500">
                              {month.label}
                            </div>
                            <div className="text-sm text-gray-400">스토리 미생성</div>
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleGenerateStory(selectedYear, month.month)}
                            disabled={generatingMonth === `${selectedYear}-${month.month}`}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                              generatingMonth === `${selectedYear}-${month.month}`
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                            }`}
                          >
                            {generatingMonth === `${selectedYear}-${month.month}` ? '생성 중...' : '생성하기'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
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
