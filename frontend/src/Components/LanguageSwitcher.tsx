import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { changeLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-gray-200 hover:text-yellow-500 transition-colors">
        <FontAwesomeIcon icon={faGlobe} />
        <span className="text-sm">{i18n.language === 'ar' ? 'العربية' : 'English'}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-md shadow-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <button
          onClick={() => changeLanguage('ar')}
          className={`block w-full px-4 py-2 text-sm text-right hover:bg-gray-100 transition-colors ${
            i18n.language === 'ar' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-700'
          }`}
        >
          العربية
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`block w-full px-4 py-2 text-sm text-right hover:bg-gray-100 transition-colors ${
            i18n.language === 'en' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-700'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
