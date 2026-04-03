import { Metadata } from 'next';
import ResearchClient from './ResearchClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    title: '연구',
    titleEn: 'Research',
    description: `${siteConfig.name} 교수의 학술 논문 및 연구 성과. ${siteConfig.researchAreas.join(', ')} 분야 연구.`,
    descriptionEn: `Academic publications and research by Professor ${siteConfig.nameEn}.`,
    path: '/research',
    locale: locale as Locale,
    keywords: ['학술 논문', '연구 성과', 'SSCI', 'SCI', 'KCI', ...siteConfig.researchAreas],
  });
}

export default function ResearchPage() {
  const publicationListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '연구 논문 목록',
    description: `${siteConfig.name} 교수의 학술 논문 및 연구 성과`,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      affiliation: {
        '@type': 'Organization',
        name: siteConfig.affiliation,
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [],
    },
  };

  return (
    <>
      <JsonLd data={publicationListSchema} />
      <ResearchClient />
    </>
  );
}
