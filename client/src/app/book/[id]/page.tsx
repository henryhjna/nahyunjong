import { Metadata } from 'next';
import BookDetailClient from './BookDetailClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/lib/metadata';

interface BookData {
  id: number;
  title: string;
  subtitle: string | null;
  authors: string;
  publisher: string | null;
  published_date: string | null;
  isbn: string | null;
  cover_image_url: string | null;
  description: string | null;
}

async function getBook(id: string): Promise<BookData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';
    const response = await fetch(`${apiUrl}/api/books/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return {
      title: '도서를 찾을 수 없습니다',
      description: '요청하신 도서를 찾을 수 없습니다.',
    };
  }

  const description = book.description
    ? book.description.slice(0, 160) + (book.description.length > 160 ? '...' : '')
    : `${book.title} - ${book.authors} 저`;

  return {
    title: book.title,
    description,
    openGraph: {
      title: book.title,
      description,
      type: 'book',
      url: `${siteConfig.url}/book/${id}`,
      images: book.cover_image_url ? [{ url: book.cover_image_url, alt: book.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: book.title,
      description,
      images: book.cover_image_url ? [book.cover_image_url] : undefined,
    },
  };
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  const bookSchema = book ? {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.authors,
    },
    publisher: book.publisher ? {
      '@type': 'Organization',
      name: book.publisher,
    } : undefined,
    datePublished: book.published_date,
    isbn: book.isbn,
    description: book.description,
    image: book.cover_image_url,
  } : null;

  return (
    <>
      {bookSchema && <JsonLd data={bookSchema} />}
      <BookDetailClient id={id} />
    </>
  );
}
