import type { Locale } from './config';

export type Dictionary = typeof import('@/dictionaries/ko.json');

const dictionaries = {
  ko: () => import('@/dictionaries/ko.json').then((m) => m.default),
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
