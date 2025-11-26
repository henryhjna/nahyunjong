import { siteConfig } from '../metadata';

export interface PersonSchemaOptions {
  includeOrg?: boolean;
}

export function generatePersonSchema(options: PersonSchemaOptions = {}) {
  const { includeOrg = true } = options;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    givenName: '현종',
    familyName: '나',
    jobTitle: siteConfig.jobTitle,
    email: siteConfig.email,
    url: siteConfig.url,
    knowsAbout: siteConfig.researchAreas,
    sameAs: [
      `https://orcid.org/${siteConfig.orcid}`,
      `https://scholar.google.com/citations?user=${siteConfig.googleScholarId}`,
    ],
  };

  if (includeOrg) {
    schema.worksFor = {
      '@type': 'Organization',
      name: siteConfig.affiliation,
    };
    schema.affiliation = {
      '@type': 'CollegeOrUniversity',
      name: '한양대학교',
    };
  }

  return schema;
}

export function generateProfilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: generatePersonSchema(),
    name: `${siteConfig.name} - 프로필`,
    description: siteConfig.description,
    url: `${siteConfig.url}/about`,
  };
}
