import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language, TranslationDictionary } from './types';
import { translations } from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'kongshan_app_language_pref';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && (saved === 'zh-TW' || saved === 'zh-CN' || saved === 'en')) {
      return saved;
    }
    // Default to zh-TW for traditional users
    return 'zh-TW';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : (language === 'zh-CN' ? 'zh-Hans' : 'zh-Hant');
  }, [language]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations[language] || translations['zh-TW']
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
