import { Metadata } from 'next';
import LabClient from './LabClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateLabSchema } from '@/lib/schema';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    title: '랩',
    titleEn: 'Lab',
    description: `${siteConfig.lab.name} - AI와 비즈니스 응용 연구실. ${siteConfig.affiliation} ${siteConfig.name} 교수 운영.`,
    descriptionEn: `${siteConfig.lab.name} - ${siteConfig.lab.fullName}. Directed by Professor ${siteConfig.nameEn}.`,
    path: '/lab',
    locale: locale as Locale,
    keywords: ['LABA', '연구실', 'AI', '빅데이터', '로보틱스'],
  });
}

export default function LabPage() {
  const labSchema = generateLabSchema();

  return (
    <>
      <JsonLd data={labSchema} />
      <LabClient />
    </>
  );
}
