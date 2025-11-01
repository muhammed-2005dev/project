import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faUsers, faAward, faClock } from '@fortawesome/free-solid-svg-icons';

const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stats = [
    { icon: faClock, number: '20+', label: t('about.experience') },
    { icon: faUsers, number: '5000+', label: t('about.customers') },
    { icon: faWrench, number: '10000+', label: t('about.projects') },
    { icon: faAward, number: '50+', label: t('about.team') }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('about.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={stat.icon} className="text-white text-2xl" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">{t('about.title')}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {t('about.description')}
              </p>
              <div className="space-y-4">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">{t('about.feature1')}</span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">{t('about.feature2')}</span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">{t('about.feature3')}</span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">{t('about.feature4')}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="About Us" 
                className="rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-bold mb-4">{t('about.vision')}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t('about.visionText')}
              </p>
            </div>
            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-bold mb-4">{t('about.mission')}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t('about.missionText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
