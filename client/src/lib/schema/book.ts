import { siteConfig } from '../metadata';

export interface Book {
  id: number;
  title: string;
  subtitle?: string;
  authors: string;
  publisher: string;
  published_date: string;
  isbn?: string;
  description?: string;
  cover_image_url?: string;
  purchase_url?: string;
}

export function generateBookSchema(book: Book) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: book.authors.split(',').map((author) => ({
      '@type': 'Person',
      name: author.trim(),
    })),
    publisher: {
      '@type': 'Organization',
      name: book.publisher,
    },
    datePublished: book.published_date,
    url: `${siteConfig.url}/book/${book.id}`,
  };

  if (book.isbn) {
    schema.isbn = book.isbn;
  }

  if (book.description) {
    schema.description = book.description;
  }

  if (book.cover_image_url) {
    const imageUrl = book.cover_image_url.startsWith('http')
      ? book.cover_image_url
      : `${process.env.NEXT_PUBLIC_API_URL}${book.cover_image_url}`;
    schema.image = imageUrl;
  }

  if (book.subtitle) {
    schema.alternativeHeadline = book.subtitle;
  }

  return schema;
}

export function generateBookListSchema(books: Book[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${siteConfig.name} 저서`,
    description: `${siteConfig.name} 교수의 저서 목록`,
    numberOfItems: books.length,
    itemListElement: books.map((book, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateBookSchema(book),
    })),
  };
}
