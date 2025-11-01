import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageDebug: React.FC = () => {
  const { i18n } = useTranslation();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Current Language: {i18n.language}</div>
      <div>Stored Language: {localStorage.getItem('i18nextLng')}</div>
      <div>Available Languages: {i18n.languages.join(', ')}</div>
      <div>Is RTL: {i18n.language === 'ar' ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default LanguageDebug;
