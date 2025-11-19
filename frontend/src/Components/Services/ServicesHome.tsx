import React from "react";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCarBattery,
    faTools,
    faOilCan,
    faTired,
    faCog,
    faCarSide
} from "@fortawesome/free-solid-svg-icons";

function ServicesHome() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <section className={`py-20 bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-yellow-500 font-semibold text-sm uppercase mb-2">
                    {t('services.subtitle')}
                </h2>
                <h1 className="text-4xl font-bold mb-5">
                    {t('services.title')}
                </h1>
                <div className="w-16 h-1 bg-yellow-500 mx-auto mb-12"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

                    {/* Card 1 */}
                    <div className="p-10 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
                        <FontAwesomeIcon icon={faTools} className="text-yellow-500 text-4xl" />
                        <h3 className="text-xl font-semibold text-slate-900">{t('services.diagnostic')}</h3>
                        <p className="text-gray-600 text-sm">
                            {isRTL ? 'خدمات التشخيص المتقدمة لجميع أنواع السيارات' : 'Advanced diagnostic services for all types of vehicles'}
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-10 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
                        <FontAwesomeIcon icon={faCarBattery} className="text-yellow-500 text-4xl" />
                        <h3 className="text-xl font-semibold text-slate-900">{t('services.battery')}</h3>
                        <p className="text-gray-600 text-sm">
                            {isRTL ? 'فحص واستبدال البطاريات بجودة عالية' : 'High-quality battery inspection and replacement'}
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-10 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
                        <FontAwesomeIcon icon={faOilCan} className="text-yellow-500 text-4xl" />
                        <h3 className="text-xl font-semibold text-slate-900">{t('services.brakes')}</h3>
                        <p className="text-gray-600 text-sm">
                            {isRTL ? 'صيانة وإصلاح أنظمة المكابح' : 'Brake system maintenance and repair'}
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="p-10 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
                        <FontAwesomeIcon icon={faCarSide} className="text-yellow-500 text-4xl" />
                        <h3 className="text-xl font-semibold text-slate-900">{t('services.engine')}</h3>
                        <p className="text-gray-600 text-sm">
                            {isRTL ? 'إصلاح وصيانة المحركات المتخصصة' : 'Specialized engine repair and maintenance'}
                        </p>
                    </div>

                    {/* Card 5 */}
                    <div className="p-10 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
                        <FontAwesomeIcon icon={faTired} className="text-yellow-500 text-4xl" />
                        <h3 className="text-xl font-semibold text-slate-900">{t('services.tires')}</h3>
                        <p className="text-gray-600 text-sm">
                            {isRTL ? 'استبدال وموازنة الإطارات' : 'Tire replacement and balancing'}
                        </p>
                    </div>

                    {/* Card 6 */}
                    <div className="p-10 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
                        <FontAwesomeIcon icon={faCog} className="text-yellow-500 text-4xl" />
                        <h3 className="text-xl font-semibold text-slate-900">{t('services.transmission')}</h3>
                        <p className="text-gray-600 text-sm">
                            {isRTL ? 'صيانة وإصلاح ناقل الحركة' : 'Transmission maintenance and repair'}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default ServicesHome;
