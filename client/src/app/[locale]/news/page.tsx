import { Metadata } from 'next';
import NewsClient from './NewsClient';
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
    title: '뉴스',
    titleEn: 'News',
    description: `${siteConfig.name} 교수의 언론 보도 및 미디어 활동.`,
    descriptionEn: `Press coverage and media activities of Professor ${siteConfig.nameEn}.`,
    path: '/news',
    locale: locale as Locale,
    keywords: ['뉴스', '언론 보도', '미디어'],
  });
}

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
