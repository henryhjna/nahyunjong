import {
  createOgImageResponse,
  generateOgImageAlt,
  ogImageSize,
  ogImageContentType,
} from '@/lib/og-image';

export const alt = generateOgImageAlt('뉴스', 'news');
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImageResponse({
    title: '뉴스',
    subtitle: '미디어 보도 및 소식',
    type: 'news',
  });
}
