import { siteConfig } from '../metadata';

export interface Publication {
  id?: number;
  title: string;
  title_en?: string;
  authors: string;
  journal: string;
  journal_en?: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  abstract?: string;
}

export function generateScholarlyArticleSchema(publication: Publication) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: publication.title_en || publication.title,
    name: publication.title,
    author: publication.authors.split(',').map((author) => ({
      '@type': 'Person',
      name: author.trim(),
    })),
    datePublished: `${publication.year}`,
    publisher: {
      '@type': 'Organization',
      name: publication.journal_en || publication.journal,
    },
    isPartOf: {
      '@type': 'Periodical',
      name: publication.journal_en || publication.journal,
    },
  };

  if (publication.doi) {
    schema.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: publication.doi,
    };
    schema.url = `https://doi.org/${publication.doi}`;
  }

  if (publication.abstract) {
    schema.abstract = publication.abstract;
  }

  if (publication.volume) {
    schema.volumeNumber = publication.volume;
  }

  if (publication.issue) {
    schema.issueNumber = publication.issue;
  }

  if (publication.pages) {
    schema.pagination = publication.pages;
  }

  return schema;
}

export function generatePublicationListSchema(publications: Publication[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${siteConfig.name} 연구 논문`,
    description: `${siteConfig.name} 교수의 학술 논문 목록`,
    numberOfItems: publications.length,
    itemListElement: publications.map((pub, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateScholarlyArticleSchema(pub),
    })),
  };
}

// Google Scholar 메타 태그 생성
export function generateCitationMeta(publication: Publication) {
  const meta: { name: string; content: string }[] = [
    { name: 'citation_title', content: publication.title },
    { name: 'citation_publication_date', content: `${publication.year}` },
    { name: 'citation_journal_title', content: publication.journal },
  ];

  // 저자 분리
  publication.authors.split(',').forEach((author) => {
    meta.push({ name: 'citation_author', content: author.trim() });
  });

  if (publication.doi) {
    meta.push({ name: 'citation_doi', content: publication.doi });
  }

  if (publication.volume) {
    meta.push({ name: 'citation_volume', content: publication.volume });
  }

  if (publication.issue) {
    meta.push({ name: 'citation_issue', content: publication.issue });
  }

  if (publication.pages) {
    const [firstPage, lastPage] = publication.pages.split('-');
    if (firstPage) meta.push({ name: 'citation_firstpage', content: firstPage.trim() });
    if (lastPage) meta.push({ name: 'citation_lastpage', content: lastPage.trim() });
  }

  return meta;
}
