import { Metadata } from 'next';
import BookClient from './BookClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '저서',
  description: `${siteConfig.name} 교수의 출판 도서. 회계학 교재 및 전문 서적.`,
  path: '/book',
  keywords: ['저서', '출판', '회계학 교재', '전문 서적', '도서'],
});

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
