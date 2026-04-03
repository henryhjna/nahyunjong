import { Metadata } from 'next';
import ThoughtsClient from './ThoughtsClient';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    title: '생각',
    titleEn: 'Thoughts',
    description: `${siteConfig.name}의 에세이, 칼럼, 그리고 생각의 조각들.`,
    descriptionEn: `Essays, columns, and fragments of thought by ${siteConfig.nameEn}.`,
    path: '/thoughts',
    locale: locale as Locale,
    keywords: ['에세이', '칼럼', '생각', 'essay'],
  });
}

export default function ThoughtsPage() {
  return <ThoughtsClient />;
}
