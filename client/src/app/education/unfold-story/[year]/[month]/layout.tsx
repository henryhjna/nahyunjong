import { Metadata } from 'next';
import { siteConfig } from '@/lib/metadata';

const monthNames: Record<string, string> = {
  '01': '1월',
  '02': '2월',
  '03': '3월',
  '04': '4월',
  '05': '5월',
  '06': '6월',
  '07': '7월',
  '08': '8월',
  '09': '9월',
  '10': '10월',
  '11': '11월',
  '12': '12월',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}): Promise<Metadata> {
  const { year, month } = await params;
  const monthLabel = monthNames[month] || `${parseInt(month)}월`;
  const title = `${year}년 ${monthLabel} - 언폴드스토리`;
  const description = `${year}년 ${monthLabel} 스토리로 배우는 회계 - K-Beauty 스타트업 언폴드의 창업 여정`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: 'article',
      url: `${siteConfig.url}/education/unfold-story/${year}/${month}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export default function UnfoldStoryMonthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
