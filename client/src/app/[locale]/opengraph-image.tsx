import { ImageResponse } from 'next/og'

export const alt = '나현종 | 한양대학교 경영대학 교수'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
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
        {/* HN Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 24,
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          HN
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          나현종
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 36,
            opacity: 0.9,
            marginBottom: 32,
          }}
        >
          한양대학교 경영대학 교수
        </div>

        {/* Research Areas */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['재무회계', '공시', '인공지능', '머신러닝'].map((area) => (
            <div
              key={area}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '12px 24px',
                borderRadius: 999,
                fontSize: 24,
              }}
            >
              {area}
            </div>
          ))}
        </div>

        {/* Website URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 24,
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
  )
}
