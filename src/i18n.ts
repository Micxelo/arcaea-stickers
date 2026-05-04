// i18n.ts

import zhTranslation from './locales/zh.json';
import twTranslation from './locales/tw.json';
import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // 检测用户当前使用的语言
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh': { translation: zhTranslation },
      'zh-CN': { translation: zhTranslation },
      'zh-TW': { translation: twTranslation },
      'en': { translation: enTranslation },
      'ja': { translation: jaTranslation },
    },
    fallbackLng: 'en',
    
    debug: true,

    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      caches: [],
    },
  });

export default i18n;

// 字符串模板替换
export function interpolate(template: string, data: Record<string, string | number>): string {
  return template.replace(/{(\w+)}/g, (match, key: string) => {
	// 如果数据中存在 key，使用其字符串形式；否则保留原始占位符
	return key in data ? String(data[key]) : match;
  });
}