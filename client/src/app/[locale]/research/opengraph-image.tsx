import {
  createOgImageResponse,
  generateOgImageAlt,
  ogImageSize,
  ogImageContentType,
} from '@/lib/og-image';

export const alt = generateOgImageAlt('연구', 'research');
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImageResponse({
    title: '연구',
    subtitle: '재무회계, 공시, 인공지능, 머신러닝',
    type: 'research',
  });
}
