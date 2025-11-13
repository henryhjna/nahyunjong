'use client';

import { useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation';
import data2022 from '@/data/unfold-story/unfold-2022.json';
import data2023 from '@/data/unfold-story/unfold-2023.json';
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

export default function StoryPage({ params }: PageProps) {
  const router = useRouter();
  const { year, month } = params;

  const yearData = year === '2022' ? data2022 : data2023;
  const monthData = yearData.months.find(
    (m) => m.month === `${year}-${month}`
  ) as MonthData | undefined;

  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const { scrollYProgress } = useScroll();

  if (!monthData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            스토리를 찾을 수 없습니다
          </h1>
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

  // 스토리 텍스트 (실제로는 MDX에서 가져오거나 별도 파일에서 import)
  const storyContent = {
    '2022-03': {
      title: '3월 - 창업의 시작',
      intro: `박유진은 5년간 모은 저축 1억원과 기술보증기금 대출 2억원을 바탕으로 언폴드를 창업한다.

강남의 작은 공유오피스에 입주하고, 노트북 3대와 기본 사무가구를 구입한다.
OEM 업체에 자신이 개발한 포뮬러를 제공하고 완제품 100개를 주문한다.`,
      scenes: [
        {
          date: '2022-03-02',
          story: `2022년 3월 2일, 드디어 회사 설립일이 되었습니다.

박유진은 떨리는 마음으로 은행에 들어섭니다. 법인 통장을 개설하고, 자신이 5년간 모아온 저축 **1억원**을 자본금으로 납입합니다.

"정말 시작이구나..." 유진은 통장에 찍힌 100,000,000원이라는 숫자를 보며 실감합니다.`,
          learningPoint: `💡 **자본금**은 주주(여기서는 박유진)가 회사에 투자한 돈입니다. 이 돈은 갚을 필요가 없는 회사의 자기자본이 됩니다.`,
        },
        {
          date: '2022-03-02',
          story: `같은 날, 기술보증기금으로부터 **2억원**의 대출이 실행됩니다.

"5년 만기, 연 4.5% 이자... 부담스럽긴 하지만, 지금은 이 돈이 필요해."

통장 잔액이 3억원이 되었습니다. 자본금 1억원과 차입금 2억원, 총 3억원으로 사업을 시작합니다.`,
          learningPoint: `💡 **차입금**은 빌린 돈입니다. 자본금과 달리 이자를 내고 갚아야 하는 부채입니다.`,
        },
        {
          date: '2022-03-05',
          story: `3월 5일, 강남 역삼동의 공유오피스를 방문합니다.

"여기가 딱 좋겠어요!"

작지만 깔끔한 공간. 임대차 계약을 체결합니다.
- 보증금: 1,000만원
- 월 임차료: 150만원
- 6개월치 임차료를 미리 납부: 900만원

"보증금 천만원하고, 6개월치 임차료 구백만원... 총 1,900만원이네요."

계약서에 사인하고 현금을 이체합니다.`,
          learningPoint: `💡 **보증금**은 나중에 돌려받을 수 있어서 자산으로 기록합니다. **선급임차료**는 미리 낸 임차료로, 역시 자산입니다. 매달 비용으로 전환됩니다.`,
        },
        {
          date: '2022-03-10',
          story: `3월 10일, 업무 장비를 구입합니다.

"노트북 3대면 충분하겠지? 나중에 사람 뽑으면 더 사고..."

- 노트북 3대 (MacBook Pro): 각 150만원 = 450만원
- 사무가구 (책상, 의자): 50만원
- 총 500만원

온라인으로 주문하고 현금 500만원을 결제합니다.`,
          learningPoint: `💡 **비품**은 여러 해 동안 사용하는 자산입니다. 구입 시점에 전액 비용처리하지 않고, **감가상각**을 통해 5년에 걸쳐 비용으로 인식합니다.`,
        },
        {
          date: '2022-03-15',
          story: `3월 15일, 드디어 OEM 업체에 첫 제품을 주문합니다.

"제 포뮬러로 만들어주세요. 일단 100개만 부탁드립니다."

OEM 업체 사장님: "네, 개당 15,000원이니까 총 150만원입니다. 제품은 내일 보내드리고, 결제는 다음 달 15일까지 해주시면 돼요."

"감사합니다!" 유진은 아직 돈을 내지 않았지만, 제품은 내일 받을 수 있습니다.`,
          learningPoint: `💡 **외상 거래**: 물건은 먼저 받고 돈은 나중에 내는 거래입니다. 아직 돈을 안 냈지만 **매입채무**라는 부채가 생깁니다.`,
        },
        {
          date: '2022-03-20',
          story: `3월 20일, 외주 개발사에 맡긴 홈페이지가 완성되었습니다.

개발사 대표: "완성했습니다! 결제는 언제 하시겠어요?"

유진: "지금 현금이 좀 부족해서... 25일쯤 보내드리면 될까요?"

개발사 대표: "네, 그럼 그때 입금해주세요. 총 800만원입니다."

홈페이지는 완성되어 지금부터 사용할 수 있지만, 돈은 아직 안 냈습니다.`,
          learningPoint: `💡 **무형자산**: 홈페이지처럼 눈에 보이지 않지만 경제적 가치가 있는 자산입니다. 3년간 사용할 예정이므로 3년에 걸쳐 **상각**합니다.`,
        },
        {
          date: '2022-03-25',
          story: `3월 25일, 약속대로 홈페이지 개발비를 지급합니다.

"800만원 입금 완료했습니다!"

통장 잔액이 800만원 줄어들었습니다.`,
          learningPoint: `💡 미지급금(부채)이 사라지고 현금(자산)이 감소합니다.`,
        },
        {
          date: '2022-03-31',
          story: `3월 31일, 드디어 **첫 판매**가 일어났습니다! 🎉

지인들과 인스타그램을 통해 주문이 들어왔습니다. 50개 완판!

- 판매가: 개당 49,000원
- 총 매출: 2,450,000원 (245만원!)

"우와, 진짜 팔렸어!" 유진은 감격스러워합니다.

모두 현금(계좌이체)으로 결제했고, 택배를 보내줍니다.

**창업 첫 달의 결산**

3월 말, 유진은 회계 결산 작업을 합니다.
- 비품 감가상각: 83,333원 (500만원 ÷ 5년 ÷ 12개월)
- 무형자산 상각: 222,222원 (800만원 ÷ 3년 ÷ 12개월)
- 선급임차료를 비용으로: 150만원 (1개월치)
- 이자비용 계상: 75만원 (2억원 × 4.5% ÷ 12개월)

**결과**: 창업 첫 달은 **85만원의 손실**이 발생했습니다.

"손실이 났네... 하지만 첫 달이니까 괜찮아. 제품도 팔렸고, 시작이 좋아!"

유진은 긍정적으로 생각하며 다음 달을 준비합니다.`,
          learningPoint: `💡 창업 초기에는 초기 투자 비용이 많아서 손실이 나는 것이 정상입니다. 중요한 것은 매출이 발생하기 시작했다는 점입니다!`,
        },
      ],
      quizzes: [
        {
          question: '박유진이 자신의 저축 1억원을 회사에 투자했을 때, 현금 계정은 어디에 기록되나요?',
          options: [
            { text: '차변 (Debit)', isCorrect: true },
            { text: '대변 (Credit)', isCorrect: false },
            { text: '기록하지 않음', isCorrect: false },
            { text: '수익으로 기록', isCorrect: false },
          ],
          explanation:
            '현금은 자산 계정입니다. 자산이 증가할 때는 차변(왼쪽)에 기록합니다. 동시에 자본금(자본)이 증가하므로 대변에 자본금을 기록합니다.',
        },
        {
          question: '선급임차료(6개월치 900만원)는 어떤 유형의 계정인가요?',
          options: [
            { text: '자산', isCorrect: true },
            { text: '부채', isCorrect: false },
            { text: '자본', isCorrect: false },
            { text: '비용', isCorrect: false },
          ],
          explanation:
            "미리 지불한 비용은 '선급비용'이라고 하며, 자산 계정입니다. 시간이 지나면서 비용으로 전환됩니다. 3월 말 결산 시 1개월치(150만원)가 임차료(비용)로 전환되었습니다.",
        },
        {
          question: '3월말 기준 언폴드의 재무 상태는?',
          options: [
            { text: '자산 = 부채 + 자본 (균형)', isCorrect: true },
            { text: '자산 > 부채 + 자본', isCorrect: false },
            { text: '자산 < 부채 + 자본', isCorrect: false },
            { text: '균형이 맞지 않음', isCorrect: false },
          ],
          explanation:
            '회계등식(자산 = 부채 + 자본)은 항상 성립합니다! 3월말 기준: 자산 301,394,445원 = 부채 202,250,000원 + 자본 99,144,445원',
        },
      ],
    },
  };

  const story = storyContent[`${year}-${month}` as keyof typeof storyContent];

  if (!story) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            스토리 콘텐츠 준비중입니다
          </h1>
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

      {/* Story Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-2 border-purple-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">📖</div>
            <h2 className="text-3xl font-bold text-gray-900">{story.title}</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            {story.intro}
          </p>
        </motion.div>

        {/* Story Scenes */}
        {story.scenes.map((scene, index) => {
          const transaction = monthData.transactions.find(
            (t) => t.date === scene.date
          );
          const isLastScene = index === story.scenes.length - 1;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-16"
            >
              {/* Story Text */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md p-8 mb-6 border border-purple-100">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line mb-6">
                    {scene.story}
                  </p>

                  {/* Learning Point */}
                  {scene.learningPoint && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mt-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {scene.learningPoint}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Card */}
              {transaction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-2xl">📝</div>
                    <h3 className="text-lg font-bold text-gray-900">
                      분개장 (Journal Entry)
                    </h3>
                  </div>

                  <div className="text-sm text-gray-500 mb-2">
                    {transaction.date}
                  </div>
                  <div className="text-base font-semibold text-gray-900 mb-4">
                    {transaction.description}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* 차변 */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="bg-red-50 rounded-lg p-4 border-2 border-red-200"
                    >
                      <div className="text-sm font-bold text-red-700 mb-3">
                        차변 (Debit)
                      </div>
                      {transaction.entries
                        .filter((e) => e.side === '차변')
                        .map((entry, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex justify-between items-center mb-2"
                          >
                            <span className="text-gray-700 font-medium">
                              {entry.account}
                            </span>
                            <span className="font-bold text-gray-900">
                              {entry.amount.toLocaleString()}원
                            </span>
                          </motion.div>
                        ))}
                    </motion.div>

                    {/* 대변 */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
                    >
                      <div className="text-sm font-bold text-blue-700 mb-3">
                        대변 (Credit)
                      </div>
                      {transaction.entries
                        .filter((e) => e.side === '대변')
                        .map((entry, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex justify-between items-center mb-2"
                          >
                            <span className="text-gray-700 font-medium">
                              {entry.account}
                            </span>
                            <span className="font-bold text-gray-900">
                              {entry.amount.toLocaleString()}원
                            </span>
                          </motion.div>
                        ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Financial Statements (show at the end) */}
              {isLastScene && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="grid md:grid-cols-2 gap-6 mt-12"
                >
                  {/* Statement of Financial Position */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>📊</span>
                      <span>재무상태표</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-2 pb-1 border-b">
                          자산
                        </div>
                        {Object.entries(
                          monthData.financials.statementOfFinancialPosition
                            .assets
                        ).map(([account, balance]) => (
                          <div
                            key={account}
                            className="flex justify-between text-sm py-1"
                          >
                            <span className="text-gray-600">{account}</span>
                            <span className="font-semibold">
                              {balance.toLocaleString()}원
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2">
                          <span>자산총계</span>
                          <span className="text-blue-600">
                            {
                              monthData.financials.statementOfFinancialPosition
                                .totalAssetsFormatted
                            }
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-2 pb-1 border-b">
                          부채
                        </div>
                        {Object.entries(
                          monthData.financials.statementOfFinancialPosition
                            .liabilities
                        ).map(([account, balance]) => (
                          <div
                            key={account}
                            className="flex justify-between text-sm py-1"
                          >
                            <span className="text-gray-600">{account}</span>
                            <span className="font-semibold">
                              {balance.toLocaleString()}원
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2">
                          <span>부채총계</span>
                          <span className="text-red-600">
                            {
                              monthData.financials.statementOfFinancialPosition
                                .totalLiabilitiesFormatted
                            }
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-2 pb-1 border-b">
                          자본
                        </div>
                        {Object.entries(
                          monthData.financials.statementOfFinancialPosition
                            .equity
                        ).map(([account, balance]) => (
                          <div
                            key={account}
                            className="flex justify-between text-sm py-1"
                          >
                            <span className="text-gray-600">{account}</span>
                            <span className="font-semibold">
                              {balance.toLocaleString()}원
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2">
                          <span>자본총계</span>
                          <span className="text-green-600">
                            {
                              monthData.financials.statementOfFinancialPosition
                                .totalEquityFormatted
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Income Statement */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>💰</span>
                      <span>손익계산서</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-2 pb-1 border-b">
                          수익
                        </div>
                        {Object.keys(
                          monthData.financials.incomeStatement.revenues
                        ).length > 0 ? (
                          Object.entries(
                            monthData.financials.incomeStatement.revenues
                          ).map(([account, amount]) => (
                            <div
                              key={account}
                              className="flex justify-between text-sm py-1"
                            >
                              <span className="text-gray-600">{account}</span>
                              <span className="font-semibold">
                                {amount.toLocaleString()}원
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            수익 없음
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2">
                          <span>수익총계</span>
                          <span className="text-blue-600">
                            {
                              monthData.financials.incomeStatement
                                .totalRevenueFormatted
                            }
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-2 pb-1 border-b">
                          비용
                        </div>
                        {Object.keys(
                          monthData.financials.incomeStatement.expenses
                        ).length > 0 ? (
                          Object.entries(
                            monthData.financials.incomeStatement.expenses
                          ).map(([account, amount]) => (
                            <div
                              key={account}
                              className="flex justify-between text-sm py-1"
                            >
                              <span className="text-gray-600">{account}</span>
                              <span className="font-semibold">
                                {amount.toLocaleString()}원
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            비용 없음
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2">
                          <span>비용총계</span>
                          <span className="text-red-600">
                            {
                              monthData.financials.incomeStatement
                                .totalExpensesFormatted
                            }
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">
                            당기순이익
                          </span>
                          <span
                            className={`text-xl font-bold ${
                              monthData.financials.incomeStatement.netIncome >=
                              0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {
                              monthData.financials.incomeStatement
                                .netIncomeFormatted
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span>🎯</span>
            <span>이해도 체크 퀴즈</span>
          </h2>

          <div className="space-y-6">
            {story.quizzes.map((quiz, index) => (
              <Quiz
                key={index}
                question={quiz.question}
                options={quiz.options}
                explanation={quiz.explanation}
              />
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-between items-center"
        >
          <button
            onClick={() => router.push('/education/unfold-story')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            ← 목록으로
          </button>
          <div className="text-gray-500 text-sm">다음 이야기는 준비중입니다</div>
        </motion.div>
      </main>
    </div>
  );
}
