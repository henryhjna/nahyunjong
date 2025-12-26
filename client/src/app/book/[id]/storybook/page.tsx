import { Metadata } from 'next';
import StorybookReader from '@/components/book-storybook/StorybookReader';
import { siteConfig } from '@/lib/metadata';

interface StorybookData {
  book: {
    id: number;
    title: string;
    subtitle: string | null;
    authors: string;
    cover_image_url: string | null;
  };
  chapters: Array<{
    id: number;
    title: string;
    order_index: number;
    pages: Array<{
      id: number;
      image_url: string | null;
      text_content: string | null;
      order_index: number;
    }>;
  }>;
  totalPages: number;
}

async function getStorybookData(id: string): Promise<StorybookData | null> {
  try {
    // Server Component에서는 Docker 내부 네트워크 사용
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://server:7341';
    const response = await fetch(`${apiUrl}/api/books/${id}/storybook`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Failed to fetch storybook data:', error);
    return null;
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getStorybookData(id);

  if (!data) {
    return {
      title: '도서를 찾을 수 없습니다',
      description: '요청하신 도서를 찾을 수 없습니다.',
    };
  }

  const title = `${data.book.title} - Storybook`;
  const description = `${data.book.title} 미리보기 - ${data.book.authors} 저`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'book',
      url: `${siteConfig.url}/book/${id}/storybook`,
      images: data.book.cover_image_url
        ? [{ url: data.book.cover_image_url, alt: data.book.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.book.cover_image_url ? [data.book.cover_image_url] : undefined,
    },
  };
}

export default async function StorybookPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const data = await getStorybookData(id);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            도서를 찾을 수 없습니다
          </h1>
          <p className="text-text-secondary">
            요청하신 도서가 존재하지 않거나 공개되지 않았습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StorybookReader
      bookId={id}
      bookTitle={data.book.title}
      bookAuthors={data.book.authors}
      chapters={data.chapters.map(ch => ({
        ...ch,
        book_id: data.book.id,
        created_at: '',
        updated_at: '',
        pages: ch.pages.map(p => ({
          ...p,
          chapter_id: ch.id,
          created_at: '',
          updated_at: '',
        })),
      }))}
      totalPages={data.totalPages}
    />
  );
}
