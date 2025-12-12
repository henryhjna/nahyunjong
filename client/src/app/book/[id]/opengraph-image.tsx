import { ImageResponse } from 'next/og';

export const alt = '도서 상세';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface BookData {
  id: number;
  title: string;
  authors: string;
  publisher: string | null;
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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  const title = book?.title || '도서';
  const subtitle = book ? `${book.authors}${book.publisher ? ` | ${book.publisher}` : ''}` : '';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #fb923c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: 60,
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 24,
            fontSize: 48,
            marginBottom: 40,
          }}
        >
          📖
        </div>

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '8px 20px',
            borderRadius: 999,
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          도서
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? 42 : 56,
            fontWeight: 700,
            marginBottom: subtitle ? 16 : 32,
            textAlign: 'center',
            maxWidth: '90%',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Subtitle (Authors/Publisher) */}
        {subtitle && (
          <div
            style={{
              fontSize: 28,
              opacity: 0.9,
              marginBottom: 32,
              textAlign: 'center',
              maxWidth: '80%',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            HN
          </div>
          <div
            style={{
              fontSize: 24,
              opacity: 0.9,
            }}
          >
            나현종 | 한양대학교
          </div>
        </div>

        {/* Website URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            opacity: 0.7,
          }}
        >
          nahyunjong.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
