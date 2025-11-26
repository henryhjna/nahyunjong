import { Metadata } from 'next';
import AboutClient from './AboutClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateProfilePageSchema } from '@/lib/schema';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '소개',
  description: `${siteConfig.name} 교수 프로필 - ${siteConfig.affiliation}. 학력, 경력, 수상 내역 소개.`,
  path: '/about',
  ogType: 'profile',
  keywords: ['프로필', '교수 소개', '학력', '경력'],
});

export default function AboutPage() {
  const profileSchema = generateProfilePageSchema();

  return (
    <>
      <JsonLd data={profileSchema} />
      <AboutClient />
    </>
  );
}
