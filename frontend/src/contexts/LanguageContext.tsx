import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  isRTL: boolean;
  changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang).then(() => {
      setLanguage(lang);
      setIsRTL(lang === 'ar');
      localStorage.setItem('i18nextLng', lang);
      
      // Update document attributes
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('class', lang === 'ar' ? 'rtl' : 'ltr');
    });
  };

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng);
      setIsRTL(lng === 'ar');
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ language, isRTL, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
