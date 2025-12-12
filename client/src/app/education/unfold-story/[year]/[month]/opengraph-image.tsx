import { ImageResponse } from 'next/og';

export const alt = '언폴드스토리';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const monthNames: Record<string, string> = {
  '01': '1월',
  '02': '2월',
  '03': '3월',
  '04': '4월',
  '05': '5월',
  '06': '6월',
  '07': '7월',
  '08': '8월',
  '09': '9월',
  '10': '10월',
  '11': '11월',
  '12': '12월',
};

export default async function Image({ params }: { params: Promise<{ year: string; month: string }> }) {
  const { year, month } = await params;

  const monthLabel = monthNames[month] || `${parseInt(month)}월`;
  const title = `${year}년 ${monthLabel}`;
  const subtitle = '스토리로 배우는 회계';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #f87171 100%)',
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
          📊
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
          언폴드스토리
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            opacity: 0.9,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>

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
