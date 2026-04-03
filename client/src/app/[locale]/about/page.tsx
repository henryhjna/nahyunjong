import { Metadata } from 'next';
import AboutClient from './AboutClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateProfilePageSchema } from '@/lib/schema';
import { generatePageMetadata, siteConfig } from '@/lib/metadata';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    title: '소개',
    titleEn: 'About',
    description: `${siteConfig.name} 교수 프로필 - ${siteConfig.affiliation}. 학력, 경력, 수상 내역 소개.`,
    descriptionEn: `Professor ${siteConfig.nameEn} - ${siteConfig.affiliation}. Education, career, and awards.`,
    path: '/about',
    locale: locale as Locale,
    ogType: 'profile',
    keywords: ['프로필', '교수 소개', '학력', '경력'],
  });
}

export default function AboutPage() {
  const profileSchema = generateProfilePageSchema();

  return (
    <>
      <JsonLd data={profileSchema} />
      <AboutClient />
    </>
  );
}
