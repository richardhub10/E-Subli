import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations } from '../utils/translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('EN');

  useEffect(() => {
    // Load saved language on startup
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('appLanguage');
        if (savedLang && ['EN', 'PH', 'KPM'].includes(savedLang)) {
          setLanguageState(savedLang as Language);
        }
      } catch (e) {
        console.error("Failed to load language", e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (e) {
      console.error("Failed to save language", e);
    }
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Fallback to key
    }
    return translations[key][language] || translations[key]['EN']; // Fallback to EN if missing
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
