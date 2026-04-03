import { createOgImageResponse, generateOgImageAlt, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const alt = generateOgImageAlt('생각', 'thoughts');
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImageResponse({
    title: '생각',
    subtitle: 'Essays & Columns',
    type: 'thoughts',
  });
}
