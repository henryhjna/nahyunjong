import { Metadata } from 'next';
import BookClient from './BookClient';
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
    title: '책',
    titleEn: 'Books',
    description: `${siteConfig.name} 교수의 출판 도서.`,
    descriptionEn: `Published books by Professor ${siteConfig.nameEn}.`,
    path: '/book',
    locale: locale as Locale,
    keywords: ['저서', '출판', '도서'],
  });
}

export default function BookPage() {
  const bookListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '저서 목록',
    description: `${siteConfig.name} 교수의 출판 도서`,
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
      <JsonLd data={bookListSchema} />
      <BookClient />
    </>
  );
}
