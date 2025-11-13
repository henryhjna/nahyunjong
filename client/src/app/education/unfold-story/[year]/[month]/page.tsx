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

interface Scene {
  date: string;
  transactionId?: string;
  story: string;
  learningPoint?: string;
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

export default function StoryPage({ params }: PageProps) {
  const router = useRouter();
  const { year, month } = params;

  const yearData = year === '2022' ? data2022 : data2023;
  const monthData = yearData.months.find(
    (m) => m.month === `${year}-${month}`
  ) as MonthData | undefined;

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
      intro: `서울 강남, 이른 봄의 햇살이 따스한 3월 아침.

박유진은 거울 앞에 섰다. 서른두 살. 화장품 회사에서 5년간 연구원으로 일하며 쌓은 노하우와 저축 1억원이 전부였다. 손에는 기술보증기금의 대출 승인 서류가 들려 있었다. 2억원이라는 숫자가 눈에 들어왔다.

"정말 시작하는 거야? 안정적인 직장을 버리고?"

하지만 마음 한구석에선 이미 결정이 나 있었다. 지난밤 실험실에서 완성한 그 포뮬러, 민감성 피부를 위한 완벽한 세럼이 머릿속을 맴돌았다.

언폴드. Unfold. 숨겨진 아름다움을 펼치다.

회사 이름을 정하는 데만 3주가 걸렸다. 이제는 그저 꿈이 아니라 현실이 될 시간이었다.`,
      scenes: [
        {
          date: '2022-03-02',
          transactionId: '2022-03-02-001',
          story: `📅 2022년 3월 2일, 목요일 오전 9시

은행 창구 앞. 유진은 새로 만든 법인 도장을 손에 쥐고 있었다. 아직 잉크 냄새가 났다.

"안녕하세요, 법인 통장 개설하러 왔습니다."

목소리가 약간 떨렸다. 직원이 친절하게 미소 지으며 서류를 확인했다.

"주식회사 언폴드, 박유진 대표님이시군요. 자본금 납입은 얼마로 하실 건가요?"

"1억원입니다."

5년이었다. 월급의 반을 저축하고, 야근 수당을 모으고, 보너스를 한 푼도 쓰지 않고 모은 돈. 부모님께 손 벌리기 싫어서, 투자자를 찾는 것도 부담스러워서, 오로지 혼자 힘으로 모은 돈.

통장에 100,000,000원이라는 숫자가 찍히는 순간, 눈물이 핑 돌았다.

"축하드립니다, 대표님. 사업 번창하시길 바랍니다."

은행을 나서는 길, 봄바람이 불었다. 유진은 스마트폰으로 통장 잔액을 다시 한번 확인했다.

💰 잔액: 100,000,000원

"정말 시작이구나..."`,
          learningPoint: `💡 자본금(Capital Stock)이란?

주주가 회사에 투자한 돈입니다. 유진이 개인 돈 1억원을 회사에 투자했으니, 이제 이 돈은 '회사의 돈'이 됩니다.

✨ 특징
• 갚을 필요가 없어요 (빌린 게 아니라 투자받은 거니까!)
• 회사가 망하지 않는 한 돌려주지 않아도 돼요
• 자본(Equity) = 회사의 순수한 자기 자산`,
        },
        {
          date: '2022-03-02',
          transactionId: '2022-03-02-002',
          story: `📅 같은 날 오후 2시

휴대폰이 울렸다. 기술보증기금 담당자였다.

"박유진 대표님, 대출금 2억원 입금 완료되었습니다. 확인 부탁드립니다."

심장이 쿵쾅거렸다. 통장 앱을 열었다.

💰 입금: 200,000,000원
💰 잔액: 300,000,000원

3억. 평생 한 번도 본 적 없는 숫자였다.

유진은 대출 약정서를 다시 펼쳐봤다. 대출금 2억원, 만기 5년, 2027년 3월까지. 이자율 연 4.5%, 월 이자 약 75만원...

"매달 75만원씩 이자를 내야 해. 5년 동안."

무거운 부담감이 어깨를 짓눌렀다. 하지만 지금 언폴드에겐 이 돈이 절실했다. 제품 개발, 사무실, 마케팅... 1억원만으로는 턱없이 부족했다.

"할 수 있어. 제품만 잘 팔면 돼."

유진은 창밖을 바라보며 다짐했다. 봄 햇살이 눈부셨다.`,
          learningPoint: `💡 차입금(Borrowings)이란?

은행이나 기관에서 빌린 돈입니다. 자본금과는 완전히 다른 개념이에요!

🔴 차입금 vs 자본금
• 차입금: 빌린 돈 → 이자 내고 갚아야 함 → 부채(Liability)
• 자본금: 투자받은 돈 → 갚을 필요 없음 → 자본(Equity)

💸 이자 비용
• 2억원 × 4.5% ÷ 12개월 = 월 75만원
• 이자는 '비용'으로 처리돼서 이익을 깎아먹어요`,
        },
        {
          date: '2022-03-05',
          transactionId: '2022-03-05-001',
          story: `📅 3월 5일, 토요일 오전 11시

강남역 3번 출구. 유진은 부동산 중개인을 따라 좁은 골목길을 걸었다.

"여기입니다. WeWork 강남점이에요."

유리문을 열고 들어서자 세련된 인테리어가 눈에 들어왔다. 밝은 조명, 깔끔한 책상, 커피 향... 이곳에서 일한다는 게 실감이 났다.

"10평 정도 되는 작은 룸인데, 창업하시는 분들이 많이 찾으세요."

공간은 작았지만 유진의 눈에는 완벽했다. 큰 창문으로 들어오는 햇살, 화이트보드 벽면, 6인용 회의 테이블...

"여기로 할게요!"

중개인이 계약서를 꺼내들었다. 보증금 10,000,000원, 계약 종료 시 반환. 월 임차료 1,500,000원. 특약사항이 눈에 들어왔다. 6개월치 임차료 선납 시 10% 할인.

"6개월치를 미리 내시면 900만원이에요. 한 달에 150만원씩 내시는 것보다 90만원 저렴하죠."

유진은 잠시 고민했다. 현금 흐름이 중요한 초기 스타트업에게 19,000,000원은 작은 돈이 아니었다. 하지만 장기적으로는 이득이었다.

"알겠습니다. 보증금 천만원, 6개월치 임차료 900만원... 총 19,000,000원 이체하겠습니다."

계좌이체를 완료하고 열쇠를 받았다. 유진은 빈 사무실에 혼자 섰다.

🔑 언폴드의 첫 번째 사무실.

가슴이 벅찼다.`,
          learningPoint: `💡 보증금과 선급임차료

🏢 보증금 10,000,000원
• 계약 종료 시 돌려받을 수 있는 돈
• '임차보증금'이라는 자산 계정으로 기록
• 돈을 썼지만 나중에 돌려받으니까 자산이에요!

💵 선급임차료 9,000,000원
• 6개월치 임차료를 미리 낸 것
• '선급비용'이라는 자산 계정으로 기록
• 매달 1,500,000원씩 '임차료(비용)'로 전환됩니다

✨ 핵심: 미리 낸 돈은 일단 '자산'이에요. 시간이 지나면서 '비용'으로 바뀝니다.`,
        },
        {
          date: '2022-03-10',
          transactionId: '2022-03-10-001',
          story: `📅 3월 10일, 목요일 오후 3시

사무실 책상 위엔 아직 아무것도 없었다. 유진은 노트북을 주문하기 위해 애플 스토어를 검색했다.

💻 MacBook Pro 14인치 (M1 Pro) 3대. 내 것 1대, 앞으로 채용할 팀원용 2대. 1대당 1,500,000원, 총 4,500,000원.

"일단 3대만... 사람 뽑으면 그때 더 사야지."

체크아웃 버튼을 누르려는데 장바구니에 추천 상품이 떴다.

🪑 사무가구 세트. 높이조절 책상 3개, 인체공학 의자 3개. 총 500,000원.

"허리 생각하면... 싼 의자 쓰다간 나중에 병원비가 더 나와."

유진은 사무가구도 함께 주문했다. 신용카드 결제 완료.

💳 총 결제액: 5,000,000원

배송 완료 예정: 3월 12일

"3일 뒤면 진짜 일을 시작할 수 있겠다."

유진은 빈 사무실을 둘러보며 상상했다. 노트북이 켜져 있고, 의자에 앉아 제품 기획을 하고, 언젠가 이 책상에 팀원들이 앉아서 같이 웃고 떠들고...

🌟 곧 현실이 될 거야.`,
          learningPoint: `💡 비품(Furniture & Fixtures)이란?

장기간 사용할 물건들이에요. 책상, 의자, 노트북처럼 1년 이상 쓸 거죠?

🔧 왜 한 번에 비용처리 안 하나요?
• 5,000,000원을 3월에 전액 비용처리하면 3월 손익이 왜곡돼요 (실제론 5년 쓸 건데!)

📊 감가상각(Depreciation)
• 5년간 나눠서 비용처리합니다
• 5,000,000원 ÷ 5년 ÷ 12개월 = 월 83,333원
• 매달 조금씩 '감가상각비'라는 비용으로 인식해요

✨ 핵심: 오래 쓸 자산은 오래 기간에 걸쳐 비용처리합니다!`,
        },
        {
          date: '2022-03-15',
          transactionId: '2022-03-15-001',
          story: `📅 3월 15일, 화요일 오전 10시

경기도 파주. 유진은 OEM 제조업체 '뷰티팩토리'를 찾아왔다.

"박유진 대표님이시죠? 제품 샘플 받고 감동했어요. 포뮬러가 정말 훌륭하시더라고요."

대표 김철수 씨가 따뜻하게 맞아줬다. 유진은 가방에서 USB를 꺼냈다.

"여기 정확한 배합 비율이랑 제조 공정이 들어있어요. 5년간 연구한 거라..."

김 대표가 서류를 검토하더니 고개를 끄덕였다.

"좋습니다. 일단 시작은 소량으로 하시죠. 100개 어때요?"

"네! 그게 좋을 것 같아요."

김 대표가 견적서를 건넸다. 제품명 Unfold Calming Serum 30ml, 수량 100개, 단가 15,000원, 합계 1,500,000원.

"제품은 내일 배송해드릴게요. 결제는... 창업하신 지 얼마 안 되셨죠? 다음 달 15일까지만 입금해주시면 됩니다."

유진은 깜짝 놀랐다.

"정말요? 외상으로 해주신다는 말씀이세요?"

"스타트업이 현금 흐름 중요하잖아요. 저도 예전에 겪어봐서 알아요. 한 달 정도는 괜찮습니다."

🤝 감사합니다, 대표님! 꼭 기한 안에 입금할게요!

유진은 감격스러웠다. 아직 돈을 내지 않았지만, 내일이면 100개의 제품이 도착한다. 드디어 언폴드의 첫 제품이 세상에 나온다.`,
          learningPoint: `💡 외상 매입(Accounts Payable)

물건은 먼저 받고, 돈은 나중에 내는 거래예요!

📦 회계 처리
• 제품을 받은 순간: 재고자산 1,500,000원 증가 (자산 ↑)
• 아직 돈 안 냄: 매입채무 1,500,000원 증가 (부채 ↑)
• 4월 15일 지급 시: 현금 감소 & 매입채무 감소

💼 왜 외상 거래를 하나요?
• 창업 초기엔 현금이 부족해요
• 제품 먼저 받아서 팔고, 그 돈으로 갚을 수 있죠
• 현금 흐름 관리에 필수적이에요!

⚠️ 주의: 매입채무도 '부채'입니다. 반드시 갚아야 해요!`,
        },
        {
          date: '2022-03-20',
          transactionId: '2022-03-20-001',
          story: `📅 3월 20일, 일요일 저녁 8시

카톡 알림이 울렸다. 외주 개발사 '코드크래프트'의 이민준 대표였다.

💬 박유진 대표님, 홈페이지 완성했습니다! 링크 보내드릴게요.

유진은 심장이 두근거렸다. 2주 전에 의뢰한 언폴드 공식 홈페이지. 클릭했다.

🌐 www.unfold.co.kr

화면이 로딩되자 우아한 베이지 톤의 홈페이지가 나타났다. 제품 소개, 브랜드 스토리, 온라인 주문 시스템까지... 완벽했다.

"와... 진짜 예쁘다..."

유진은 눈물이 날 것 같았다. 화장품 회사 연구원으로 일할 땐 상상도 못 했던 것들. 내 브랜드, 내 제품, 내 홈페이지.

전화가 왔다.

📞 대표님, 마음에 드셨어요?

"네! 완전 만족스러워요! 결제는 어떻게 하면 될까요?"

"총 800만원입니다. 언제 입금 가능하세요?"

유진은 통장 앱을 확인했다. 현금이 생각보다 빨리 줄어들고 있었다. 사무실 보증금, 임차료, 노트북, 사무가구... 3억이 순식간에 2억 8천이 되어 있었다.

"저... 지금 현금 흐름이 조금 빠듯해서요. 25일쯤 보내드려도 될까요?"

"네, 괜찮습니다. 그럼 25일까지 입금 부탁드려요!"

개발비 8,000,000원. 지급 예정일은 3월 25일.

유진은 홈페이지를 다시 한번 둘러봤다. 이제 진짜 온라인 판매를 시작할 수 있다.

✨ 언폴드, 이제 세상에 나갈 준비가 됐어.`,
          learningPoint: `💡 무형자산(Intangible Assets)

홈페이지, 소프트웨어처럼 손에 잡히지 않지만 가치가 있는 자산이에요!

🌐 홈페이지는 왜 자산인가요?
• 3년 이상 사용할 예정 (장기)
• 경제적 효익 발생 (매출 유도)
• 8,000,000원의 가치가 있음

📊 무형자산 상각(Amortization)
• 비품처럼 오래 쓰는 자산이니 나눠서 비용처리!
• 8,000,000원 ÷ 3년 ÷ 12개월 = 월 222,222원
• 매달 '무형자산상각비'로 비용 인식

💳 미지급금
• 홈페이지는 받았지만 아직 안 냈어요
• 미지급금 8,000,000원 (부채 발생!)
• 3월 25일 지급 시: 현금 감소 & 미지급금 소멸`,
        },
        {
          date: '2022-03-25',
          transactionId: '2022-03-25-001',
          story: `📅 3월 25일, 금요일 오전 10시

휴대폰 알람이 울렸다.

⏰ 알림: 홈페이지 개발비 지급일 (800만원)

유진은 며칠 전에 미리 설정해둔 알람이었다. 약속은 지켜야 했다.

"이민준 대표님, 지금 800만원 입금할게요!"

💸 이체 중...

통장 앱 화면을 지켜봤다.

이체 완료. 받는 사람 (주)코드크래프트, 금액 8,000,000원. 잔액 273,100,000원에서 265,100,000원으로 줄어들었다.

"휴... 통장이 점점 줄어드네."

창업 2주 만에 3억이 2억 6천으로 줄었다. 아직 매출은 한 푼도 없는데 돈은 쏜살같이 나가고 있었다.

📱 답장이 왔다.

💬 입금 확인했습니다! 감사합니다. 사업 번창하세요!

유진은 한숨을 쉬었다. 빚을 갚는 기분이었다. 아니, 실제로 빚을 갚은 거였다. 회계 용어로는 '미지급금'이라고 하지만.

"이제 진짜 매출을 내야 해. 더 이상 나갈 돈만 있으면 안 돼."`,
          learningPoint: `💡 미지급금 상환

아주 간단한 거래예요!

📉 회계 처리
• 현금(자산) 8,000,000원 감소 ↓
• 미지급금(부채) 8,000,000원 감소 ↓

✅ 자산도 줄고, 부채도 줄어요. 균형은 그대로!

💡 포인트
• 부채를 갚으면 회사는 '가벼워'집니다
• 하지만 현금도 줄어서 자금 흐름 관리가 중요해요!`,
        },
        {
          date: '2022-03-31',
          transactionId: '2022-03-31-001',
          story: `📅 3월 31일, 목요일 밤 11시 30분

침대에 누워 있던 유진의 휴대폰이 미친 듯이 울리기 시작했다.

띵동! 띵동! 띵동띵동띵동!

📱 주문 알림 27건

"뭐야?!"

유진은 벌떡 일어나 홈페이지 관리자 페이지를 열었다.

🛒 실시간 주문 현황. 주문 건수 50건, 총 수량 50개, 결제 완료 50건.

심장이 터질 것 같았다. 지난 일주일간 인스타그램에 올린 게시물, 지인들에게 보낸 메시지, 화장품 커뮤니티에 올린 소개글... 그게 먹혔다.

💰 판매가 49,000원, 50개 판매, 총 매출 2,450,000원!

"245만원... 진짜 팔렸어! 진짜로!!!"

유진은 소리를 지르며 방방 뛰었다. 서른두 살, 화장품 연구원에서 대표가 된 지 한 달 만에 첫 매출. 245만원이 적은 돈은 아니었지만, 그보다 더 중요한 건...

"사람들이 내 제품을 샀다는 거야!"

새벽 1시까지 50개 전부 포장했다. 하나하나 정성스럽게 박스에 담고, 손편지를 넣고, 브랜드 스티커를 붙였다.

📦 발송 완료: 50개

---

📅 같은 날 오후, 회계 결산 작업

사무실 책상 앞. 유진은 엑셀 파일을 펼쳐놓고 3월 한 달을 정리했다.

📊 3월 매출
제품 판매: 2,450,000원 ✅

📉 3월 비용
임차료 1,500,000원, 감가상각비 83,333원 (비품 5,000,000원 ÷ 5년 ÷ 12개월), 무형자산상각비 222,222원 (홈페이지 8,000,000원 ÷ 3년 ÷ 12개월), 이자비용 750,000원 (차입금 200,000,000원 × 4.5% ÷ 12개월)

💔 당기순손실: 855,555원

"적자네..."

하지만 유진은 웃고 있었다.

"첫 달부터 흑자 내는 회사가 어딨어? 사무실 얻고, 노트북 사고, 홈페이지 만들고... 투자 비용이 많았으니까 당연해."

중요한 건 매출이 발생했다는 것.

유진은 창밖을 바라봤다. 봄밤의 서울, 네온사인이 반짝이고 있었다.

🌃 4월부터는 달라질 거야. 이제 시작이야, 언폴드.

통장 잔액 267,544,445원, 재고자산 50개 (원가 750,000원), 3월 매출 2,450,000원, 순손실 855,555원.

그래도 괜찮았다. 드디어 회사가 돌아가기 시작했으니까.`,
          learningPoint: `💡 창업 첫 달 결산의 의미

🎯 손실이 나도 괜찮아요!

창업 초기에는 거의 모든 회사가 손실을 봅니다. 왜냐면:

1️⃣ 초기 투자 비용
• 사무실, 장비, 홈페이지 등 한꺼번에 지출
• 감가상각비도 매달 나가요

2️⃣ 매출은 천천히 증가
• 첫 달 2,450,000원은 훌륭한 시작!
• 마케팅 효과는 시간이 지나야 나타남

3️⃣ 고정비 부담
• 임차료 1,500,000원, 이자 750,000원 = 매달 고정 지출
• 매출이 늘어야 이걸 커버할 수 있어요

📈 중요한 건 성장 가능성
• 제품 품질 ✅
• 초기 고객 확보 ✅
• 온라인 판매 시스템 ✅

855,555원 손실보다, 2,450,000원 매출이 더 중요합니다!`,
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
          // Match by transactionId first (more precise), fallback to date matching
          const transaction = monthData.transactions.find(
            (t) => scene.transactionId ? t.id === scene.transactionId : t.date === scene.date
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
                            className="mb-3"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">
                                {entry.account}
                              </span>
                              <span className="font-bold text-gray-900">
                                {entry.amount.toLocaleString()}원
                              </span>
                            </div>
                            <div className="text-xs text-red-600 mt-1">
                              {getAccountTypeDescription(entry.account, '차변')}
                            </div>
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
                            className="mb-3"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">
                                {entry.account}
                              </span>
                              <span className="font-bold text-gray-900">
                                {entry.amount.toLocaleString()}원
                              </span>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {getAccountTypeDescription(entry.account, '대변')}
                            </div>
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
