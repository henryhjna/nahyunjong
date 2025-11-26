import { Metadata } from 'next';
import NewsClient from './NewsClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '뉴스',
  description: `${siteConfig.name} 교수의 언론 보도 및 미디어 활동.`,
  path: '/news',
  keywords: ['뉴스', '언론 보도', '미디어', '인터뷰', '기사'],
});

export default function NewsPage() {
  const newsListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '뉴스 및 미디어',
    description: `${siteConfig.name} 교수의 언론 보도 및 미디어 활동`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [],
    },
  };

  return (
    <>
      <JsonLd data={newsListSchema} />
      <NewsClient />
    </>
  );
}
