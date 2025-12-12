import { ImageResponse } from 'next/og';

export const ogImageSize = {
  width: 1200,
  height: 630,
};

export const ogImageContentType = 'image/png';

export type OgImageType =
  | 'default'
  | 'profile'
  | 'research'
  | 'education'
  | 'lab'
  | 'book'
  | 'news'
  | 'unfold-story';

const gradients: Record<OgImageType, string> = {
  default: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
  profile: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
  research: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a78bfa 100%)',
  education: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%)',
  lab: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #3b82f6 100%)',
  book: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #fb923c 100%)',
  news: 'linear-gradient(135deg, #166534 0%, #16a34a 50%, #4ade80 100%)',
  'unfold-story': 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #f87171 100%)',
};

const icons: Record<OgImageType, string> = {
  default: 'HN',
  profile: '👤',
  research: '📄',
  education: '📚',
  lab: '🔬',
  book: '📖',
  news: '📰',
  'unfold-story': '📊',
};

interface OgImageParams {
  title: string;
  subtitle?: string;
  type?: OgImageType;
  badge?: string;
}

export function createOgImageResponse({
  title,
  subtitle,
  type = 'default',
  badge,
}: OgImageParams): ImageResponse {
  const gradient = gradients[type];
  const icon = icons[type];
  const showLogo = type === 'default' || type === 'profile';

  return new ImageResponse(
    (
      <div
        style={{
          background: gradient,
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
        {/* Icon or Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: showLogo ? 120 : 100,
            height: showLogo ? 120 : 100,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 24,
            fontSize: showLogo ? 56 : 48,
            fontWeight: showLogo ? 700 : 400,
            marginBottom: 40,
          }}
        >
          {icon}
        </div>

        {/* Badge */}
        {badge && (
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
            {badge}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? 48 : 64,
            fontWeight: 700,
            marginBottom: subtitle ? 16 : 32,
            textAlign: 'center',
            maxWidth: '90%',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: 32,
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
      ...ogImageSize,
    }
  );
}

// Helper to generate alt text
export function generateOgImageAlt(title: string, type: OgImageType = 'default'): string {
  const typeLabels: Record<OgImageType, string> = {
    default: '',
    profile: '프로필',
    research: '연구',
    education: '교육',
    lab: '연구실',
    book: '도서',
    news: '뉴스',
    'unfold-story': '언폴드스토리',
  };

  const label = typeLabels[type];
  return label ? `${title} - ${label} | 나현종` : `${title} | 나현종`;
}
