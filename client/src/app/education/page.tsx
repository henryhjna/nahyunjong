import { Metadata } from 'next';
import EducationClient from './EducationClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '교육',
  description: `${siteConfig.name} 교수의 교육 자료 및 강의. 재무회계, 회계원리 등 회계학 강의 자료.`,
  path: '/education',
  keywords: ['강의', '교육', '재무회계', '회계원리', '대학 강의', '회계학'],
});

export default function EducationPage() {
  const educationSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '교육 자료',
    description: `${siteConfig.name} 교수의 교육 자료 및 강의`,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      affiliation: {
        '@type': 'Organization',
        name: siteConfig.affiliation,
      },
    },
  };

  return (
    <>
      <JsonLd data={educationSchema} />
      <EducationClient />
    </>
  );
}
