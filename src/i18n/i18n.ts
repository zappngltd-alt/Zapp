import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import yo from './locales/yo.json';
import ha from './locales/ha.json';
import ig from './locales/ig.json';
import 'intl-pluralrules';

const resources = {
  en: { translation: en },
  yo: { translation: yo },
  ha: { translation: ha },
  ig: { translation: ig },
};

const LANGUAGE_KEY = 'user_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      console.log('Error reading language', error);
    }

    const deviceLanguage = Localization.getLocales()[0]?.languageCode;
    callback(deviceLanguage || 'en');
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
        useSuspense: false,
    }
  });

export default i18n;
