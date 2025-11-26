import { Metadata } from 'next';

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
    fullName: 'Lab for Accounting Big data and Artificial intelligence',
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

// 기본 메타데이터 생성
export function generateBaseMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: `${siteConfig.name} | 한양대학교`,
      title: siteConfig.title,
      description: siteConfig.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: siteConfig.url,
    },
    ...overrides,
  };
}

// 페이지별 메타데이터 생성 헬퍼
export function generatePageMetadata({
  title,
  description,
  path,
  ogType = 'website',
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  ogType?: 'website' | 'article' | 'book' | 'profile';
  keywords?: string[];
}): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    openGraph: {
      type: ogType,
      url,
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}
