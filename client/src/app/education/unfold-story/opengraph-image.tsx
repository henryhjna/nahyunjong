import {
  createOgImageResponse,
  generateOgImageAlt,
  ogImageSize,
  ogImageContentType,
} from '@/lib/og-image';

export const alt = generateOgImageAlt('언폴드스토리', 'unfold-story');
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImageResponse({
    title: '언폴드스토리',
    subtitle: '스토리로 배우는 회계',
    type: 'unfold-story',
  });
}
