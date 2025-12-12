import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '나현종 | 한양대학교 경영대학 교수',
    short_name: '나현종',
    description: '한양대학교 경영대학 나현종 교수 - 재무회계, 공시, 인공지능, 머신러닝 연구',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
