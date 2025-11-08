// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      language: 'Language',
      english: 'English',
      hindi: 'Hindi',
      privacy_policy: 'Privacy Policy',
      // ... more keys
    },
  },
  hi: {
    translation: {
      language: 'भाषा',
      english: 'अंग्रेज़ी',
      hindi: 'हिन्दी',
      privacy_policy: 'गोपनीयता नीति',
      // ... more keys
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
