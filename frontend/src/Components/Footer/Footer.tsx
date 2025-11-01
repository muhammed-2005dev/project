import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faTwitter, faInstagram, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from 'react-i18next';

import img1 from '../Footer/img-1.58cb2030.jpg';
import img2 from '../Footer/img-2.852abb49.jpg';

const Footer: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    return (
        <footer className={`w-full bg-slate-900 text-gray-300 pt-16 pb-9 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* First Column: About + Social media links */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-3">AutoLogic</h2>
                    <p className="text-sm leading-7 mb-4">
                        {t('footer.description')}
                    </p>

                    <div className="flex gap-3 mt-5">
                        <a href="https://facebook.com" target="_blank" className="hover:text-yellow-500 transition-colors">
                            <FontAwesomeIcon icon={faFacebookF} />
                        </a>

                        <a href="https://twitter.com" target="_blank" className="hover:text-yellow-500 transition-colors">
                            <FontAwesomeIcon icon={faTwitter} />
                        </a>

                        <a href="https://instagram.com" target="_blank" className="hover:text-yellow-500 transition-colors">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>

                        <a href="https://google.com" target="_blank" className="hover:text-yellow-500 transition-colors">
                            <FontAwesomeIcon icon={faGoogle} />
                        </a>
                    </div>
                </div>

                {/* Second Column : Recent posts (with date and image) */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">{t('footer.recentPosts')}</h3>

                    {/* First Post */}
                    <div className={`flex gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <img src={img1} alt={isRTL ? 'منشور حديث 1' : 'recent post 1'} className="w-23 h-17 object-cover rounded-md flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium">
                                {isRTL ? 'أهم المشاكل في سيارتك' : 'Most Important Issue For your car.'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {isRTL ? '18 فبراير 2019' : '18 Feb 2019'}
                            </p>
                        </div>
                    </div>


                    {/* Second post */}
                    <div className={`flex gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <img src={img2} alt={isRTL ? 'منشور حديث 2' : 'recent post 2'} className="w-23 h-17 object-cover rounded-md flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium">
                                {isRTL ? 'أهم المشاكل في سيارتك' : 'Most Important Issue For your car.'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {isRTL ? '18 فبراير 2019' : '18 Feb 2019'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Third Column: Address (cointain also logos for location ,email and phone) */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">{t('footer.address')}</h3>
                    <p className="text-sm mb-4">
                        {isRTL ? 'عنوان المكتب الرئيسي' : 'Head Office Address'}
                    </p>

                    <ul className="text-sm list-none">
                        <li className={`flex gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <FontAwesomeIcon icon={faLocationDot} className="text-yellow-500 mt-1" />
                            <p>
                                {isRTL ? '121 شارع الملك، ملبورن الغربية، أستراليا' : '121 King Street, Melbourne West, Australia'}
                            </p>
                        </li>
                        <li className={`flex gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <FontAwesomeIcon icon={faPhone} className="text-yellow-500 mt-1" />
                            <p>
                                {isRTL ? 'الهاتف: 888 123-4587' : 'Phone: 888 123-4587'}
                            </p>
                        </li>
                        <li className={`flex gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <FontAwesomeIcon icon={faEnvelope} className="text-yellow-500 mt-1" />
                            <p>
                                {isRTL ? 'البريد الإلكتروني: info@example.com' : 'Email: info@example.com'}
                            </p>
                        </li>
                    </ul>
                </div>

                {/* Forth Column: Services */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">{t('footer.services')}</h3>
                    <ul className="text-sm  list-none">
                        <li>
                            <NavLink
                                to="/engine-repair"
                                className={`flex items-center gap-2 text-gray-300 hover:text-yellow-500 transition-colors duration-300 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                {isRTL ? 'إصلاح المحرك' : 'Engine Repair'}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/tire-replacement"
                                className={`flex items-center gap-2 text-gray-300 hover:text-yellow-500 transition-colors duration-300 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                {isRTL ? 'استبدال الإطارات' : 'Tire Replacement'}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/transmission"
                                className={`flex items-center gap-2 text-gray-300 hover:text-yellow-500 transition-colors duration-300 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                {isRTL ? 'ناقل الحركة' : 'Transmission'}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/diagnostic"
                                className={`flex items-center gap-2 text-gray-300 hover:text-yellow-500 transition-colors duration-300 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                {isRTL ? 'التشخيص' : 'Diagnostic'}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/batteries"
                                className={`flex items-center gap-2 text-gray-300 hover:text-yellow-500 transition-colors duration-300 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                {isRTL ? 'البطاريات' : 'Batteries'}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/brake-repair"
                                className={`flex items-center gap-2 text-gray-300 hover:text-yellow-500 transition-colors duration-300 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                {isRTL ? 'إصلاح المكابح' : 'Brake Repair'}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>

            {/* bottom line */}
            <div className="max-w-7xl mx-auto px-6 mt-10 border-t border-gray-700 pt-4 text-sm text-center text-gray-400">
                © 2025 AutoLogic. {t('footer.rights')}.
            </div>
        </footer>
    );
};

export default Footer;
