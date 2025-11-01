import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Error404: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-yellow-500 mb-4">404</div>
          <div className="w-32 h-32 mx-auto mb-8 bg-gray-200 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faHome} className="text-6xl text-gray-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">{t('error.404')}</h1>
          <p className="text-xl text-gray-600 mb-8">{t('error.notFound')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <NavLink
            to="/"
            className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faHome} />
            {t('error.goHome')}
          </NavLink>
          
          <button
            onClick={() => window.history.back()}
            className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {t('error.goBack')}
          </button>
        </div>

        {/* Additional Help */}
        <div className={`mt-12 p-6 bg-white rounded-lg shadow-lg ${isRTL ? 'text-right' : 'text-left'}`}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('error.needHelp')}</h3>
          <p className="text-gray-600 mb-4">
            {t('error.helpText')}
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <NavLink
              to="/services"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              {t('nav.services')}
            </NavLink>
            <NavLink
              to="/contact"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              {t('nav.contact')}
            </NavLink>
            <NavLink
              to="/about"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              {t('nav.about')}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;
