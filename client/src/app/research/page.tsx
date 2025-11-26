import { Metadata } from 'next';
import ResearchClient from './ResearchClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '연구',
  description: `${siteConfig.name} 교수의 학술 논문 및 연구 성과. ${siteConfig.researchAreas.join(', ')} 분야 연구.`,
  path: '/research',
  keywords: ['학술 논문', '연구 성과', 'SSCI', 'SCI', 'KCI', ...siteConfig.researchAreas],
});

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
