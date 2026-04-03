import { ImageResponse } from 'next/og';

export const alt = '뉴스 상세';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface NewsData {
  id: number;
  title: string;
  source: string | null;
  published_at: string;
}

async function getNews(slug: string): Promise<NewsData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';
    const response = await fetch(`${apiUrl}/api/news/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);

  const title = news?.title || '뉴스';
  const subtitle = news
    ? `${news.source || ''}${news.source ? ' | ' : ''}${formatDate(news.published_at)}`
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #16a34a 50%, #4ade80 100%)',
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
          📰
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
          뉴스
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? 36 : title.length > 25 ? 44 : 52,
            fontWeight: 700,
            marginBottom: subtitle ? 16 : 32,
            textAlign: 'center',
            maxWidth: '90%',
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>

        {/* Subtitle (Source/Date) */}
        {subtitle && (
          <div
            style={{
              fontSize: 24,
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
