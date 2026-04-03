import { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';

// 사이트 기본 정보
export const siteConfig = {
  name: '나현종',
  nameEn: 'Hyunjong Na',
  title: '나현종 | 한양대학교 경영대학 교수',
  description: '한양대학교 경영대학 나현종 교수 - 재무회계, 공시, 인공지능, 머신러닝 연구. LABA 연구실 운영.',
  url: 'https://nahyunjong.com',
  locale: 'ko_KR',
  email: 'na.hyunjong@gmail.com',
  affiliation: '한양대학교 경영대학',
  jobTitle: '교수',
  lab: {
    name: 'LABA',
    fullName: 'Lab for AI and Business Application',
  },
  researchAreas: ['재무회계', '공시', '인공지능', '머신러닝', '투자', '가치평가'],
  orcid: '0000-0002-6475-128X',
  googleScholarId: 'Y7ki3dEAAAAJ',
  keywords: [
    '나현종',
    '한양대학교',
    '경영대학',
    '회계학',
    '재무회계',
    '공시',
    '인공지능',
    '머신러닝',
    '투자',
    '가치평가',
    'LABA',
    'accounting',
    'professor',
  ],
};

// 페이지별 메타데이터 생성 헬퍼
export function generatePageMetadata({
  title,
  titleEn,
  description,
  descriptionEn,
  path,
  locale = 'ko',
  ogType = 'website',
  keywords = [],
}: {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  path: string;
  locale?: Locale;
  ogType?: 'website' | 'article' | 'book' | 'profile';
  keywords?: string[];
}): Metadata {
  const isKo = locale === 'ko';
  const displayTitle = isKo ? title : (titleEn || title);
  const displayDescription = isKo ? description : (descriptionEn || description);
  const displayName = isKo ? siteConfig.name : siteConfig.nameEn;
  const url = `${siteConfig.url}/${locale}${path}`;

  return {
    title: displayTitle,
    description: displayDescription,
    keywords: [...siteConfig.keywords, ...keywords],
    openGraph: {
      type: ogType,
      url,
      locale: isKo ? 'ko_KR' : 'en_US',
      title: `${displayTitle} | ${displayName}`,
      description: displayDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayTitle} | ${displayName}`,
      description: displayDescription,
    },
    alternates: {
      canonical: url,
      languages: {
        ko: `${siteConfig.url}/ko${path}`,
        en: `${siteConfig.url}/en${path}`,
      },
    },
  };
}
