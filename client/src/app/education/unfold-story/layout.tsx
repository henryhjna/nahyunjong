import { Metadata } from 'next';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '언폴드스토리',
  description: `스토리로 배우는 회계 - K-Beauty 스타트업 창업 스토리를 통해 배우는 회계원리. ${siteConfig.name} 교수 제작.`,
  path: '/education/unfold-story',
  keywords: ['언폴드스토리', '회계 교육', '스타트업 회계', '회계원리', '재무제표', 'K-Beauty'],
});

export default function UnfoldStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
