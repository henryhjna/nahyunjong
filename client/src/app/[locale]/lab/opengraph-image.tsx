import {
  createOgImageResponse,
  generateOgImageAlt,
  ogImageSize,
  ogImageContentType,
} from '@/lib/og-image';

export const alt = generateOgImageAlt('LABA 연구실', 'lab');
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImageResponse({
    title: 'LABA',
    subtitle: 'Lab for Accounting Big data and Artificial intelligence',
    type: 'lab',
  });
}
