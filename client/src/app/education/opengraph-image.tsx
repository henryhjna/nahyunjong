import {
  createOgImageResponse,
  generateOgImageAlt,
  ogImageSize,
  ogImageContentType,
} from '@/lib/og-image';

export const alt = generateOgImageAlt('교육', 'education');
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImageResponse({
    title: '교육',
    subtitle: '강의 자료 및 학습 콘텐츠',
    type: 'education',
  });
}
