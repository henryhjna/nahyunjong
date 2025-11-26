import { siteConfig } from '../metadata';

export function generateLabSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ResearchOrganization',
    name: siteConfig.lab.name,
    alternateName: siteConfig.lab.fullName,
    url: `${siteConfig.url}/lab`,
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: '한양대학교',
    },
    member: {
      '@type': 'Person',
      name: siteConfig.name,
      jobTitle: siteConfig.jobTitle,
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.title,
    url: siteConfig.url,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
    },
    description: siteConfig.description,
    inLanguage: 'ko-KR',
  };
}
