import { Metadata } from 'next';
import LabClient from './LabClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateLabSchema } from '@/lib/schema';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '연구실',
  description: `${siteConfig.lab.name} - 회계 빅데이터 및 인공지능 연구실. ${siteConfig.affiliation} ${siteConfig.name} 교수 연구실.`,
  path: '/lab',
  keywords: ['LABA', '연구실', '회계 빅데이터', '인공지능', '대학원', '연구원'],
});

export default function LabPage() {
  const labSchema = generateLabSchema();

  return (
    <>
      <JsonLd data={labSchema} />
      <LabClient />
    </>
  );
}
