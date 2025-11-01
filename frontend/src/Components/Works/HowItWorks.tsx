import React from "react";
import { useTranslation } from 'react-i18next';
import step1 from "./img-1.d11736ff.jpg";
import step2 from "./img-2.ec4d0e91.jpg";
import step3 from "./img-3.fceb8519.jpg";
import step4 from "./img-4.260c3f82.jpg";

function HowItWorks() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    return (
        <section className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-yellow-500 font-semibold text-sm uppercase mb-2">
                    {isRTL ? 'عملية العمل' : 'Work Process'}
                </h2>
                <h1 className="text-4xl font-bold text-slate-900 mb-5">
                    {isRTL ? 'كيف نعمل' : 'How it Work'}
                </h1>
                <div className="w-16 h-1 bg-yellow-500 mx-auto mb-12"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div className="flex flex-col items-center text-center">
                        <img src={step1} alt={isRTL ? 'اختر الخدمة' : 'Choose Service'} className="rounded-md mb-4 w-full object-cover" />
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="bg-yellow-500 text-white font-bold text-lg w-8 h-8 flex items-center justify-center rounded-sm">
                                1
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg">
                                {isRTL ? 'اختر خدمتك' : 'Choose Your Service'}
                            </h3>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center">
                        <img src={step2} alt={isRTL ? 'احجز موعد' : 'Make Appointment'} className="rounded-md mb-4 w-full object-cover" />
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="bg-yellow-500 text-white font-bold text-lg w-8 h-8 flex items-center justify-center rounded-sm">
                                2
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg">
                                {isRTL ? 'احجز موعدك' : 'Make An Appointment'}
                            </h3>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center">
                        <img src={step3} alt={isRTL ? 'أكد طلبك' : 'Confirm Request'} className="rounded-md mb-4 w-full object-cover" />
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="bg-yellow-500 text-white font-bold text-lg w-8 h-8 flex items-center justify-center rounded-sm">
                                3
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg">
                                {isRTL ? 'أكد طلبك' : 'Confirm Your Request'}
                            </h3>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center">
                        <img src={step4} alt={isRTL ? 'نصلح سيارتك' : 'Pick Your Car'} className="rounded-md mb-4 w-full object-cover" />
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="bg-yellow-500 text-white font-bold text-lg w-8 h-8 flex items-center justify-center rounded-sm">
                                4
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg">
                                {isRTL ? 'نصلح سيارتك' : 'We fix your car'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
