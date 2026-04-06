import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { locales, isValidLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { DictionaryProvider } from '@/contexts/DictionaryContext';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePersonSchema, generateWebsiteSchema } from '@/lib/schema';
import { siteConfig } from '@/lib/metadata';
import { PageTracker } from '@/components/PageTracker';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';

  return {
    title: {
      default: isKo ? siteConfig.title : `${siteConfig.nameEn} | Professor, Hanyang University`,
      template: `%s | ${isKo ? siteConfig.name : siteConfig.nameEn}`,
    },
    description: isKo
      ? siteConfig.description
      : 'Professor Hyunjong Na - Hanyang University School of Business. Research in financial accounting, AI, and machine learning.',
    keywords: siteConfig.keywords,
    authors: [{ name: isKo ? siteConfig.name : siteConfig.nameEn }],
    openGraph: {
      type: 'website',
      locale: isKo ? 'ko_KR' : 'en_US',
      url: `${siteConfig.url}/${locale}`,
      siteName: isKo ? `${siteConfig.name} | 한양대학교` : `${siteConfig.nameEn} | Hanyang University`,
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: {
        ko: `${siteConfig.url}/ko`,
        en: `${siteConfig.url}/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale as Locale);
  const personSchema = generatePersonSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <JsonLd data={[personSchema, websiteSchema]} />
      <DictionaryProvider dictionary={dictionary} locale={locale as Locale}>
        <PageTracker />
        {children}
      </DictionaryProvider>
    </>
  );
}
