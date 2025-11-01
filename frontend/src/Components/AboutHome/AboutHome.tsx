import React from "react";
import { useTranslation } from 'react-i18next';
import aboutImage from "./kate-ibragimova-iFQpqbLMOFU-unsplash.jpg";

function AboutHome() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <section className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">

                {/* Left side */}
                <div className={`flex-1 text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
                    <h2 className="text-yellow-500 font-semibold text-sm uppercase mb-2">
                        {t('about.subtitle')}
                    </h2>

                    <h1 className="text-4xl font-bold text-slate-900 mb-6">
                        {t('about.title')}
                    </h1>
                    <div className="w-16 h-1 bg-yellow-500 mb-12"></div>

                    <div className="text-slate-700 text-base leading-relaxed mb-6">
                        <p>
                            {t('about.description')}
                        </p>
                    </div>

                    <button className="bg-yellow-500 hover:bg-yellow-600 font-semibold px-6 py-3 rounded-md transition text-white">
                        {t('nav.about')}
                    </button>
                </div>

                {/* Right side */}
                <div className="flex-1">
                    <img src={aboutImage} alt="About Company" className="rounded-2xl w-full object-cover" />
                </div>
            </div>
        </section>
    );
}

export default AboutHome;
