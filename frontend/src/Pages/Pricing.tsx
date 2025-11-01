import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const Pricing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const pricingPlans = [
    {
      name: i18n.language === 'ar' ? 'الأساسي' : 'Basic',
      price: '199',
      period: i18n.language === 'ar' ? 'شهرياً' : 'Monthly',
      description: i18n.language === 'ar' ? 'الخطة الأساسية للصيانة الدورية' : 'Basic plan for periodic maintenance',
      features: i18n.language === 'ar' ? [
        'فحص شامل للمحرك',
        'تغيير الزيت والفلتر',
        'فحص الإطارات والضغط',
        'فحص البطارية',
        'فحص الإضاءة',
        'تقرير مفصل عن حالة السيارة'
      ] : [
        'Comprehensive engine inspection',
        'Oil and filter change',
        'Tire and pressure check',
        'Battery check',
        'Lighting check',
        'Detailed car condition report'
      ],
      notIncluded: i18n.language === 'ar' ? [
        'إصلاح الأعطال',
        'تغيير قطع الغيار',
        'خدمة الطوارئ'
      ] : [
        'Fault repairs',
        'Spare parts replacement',
        'Emergency service'
      ],
      popular: false,
      buttonText: i18n.language === 'ar' ? 'اختر الخطة' : 'Choose Plan',
      buttonColor: 'bg-slate-800 hover:bg-slate-700'
    },
    {
      name: i18n.language === 'ar' ? 'المتقدم' : 'Premium',
      price: '399',
      period: i18n.language === 'ar' ? 'شهرياً' : 'Monthly',
      description: i18n.language === 'ar' ? 'الخطة المتقدمة مع خدمات إضافية' : 'Advanced plan with additional services',
      features: i18n.language === 'ar' ? [
        'جميع خدمات الخطة الأساسية',
        'إصلاح الأعطال البسيطة',
        'تغيير قطع الغيار الأساسية',
        'خدمة الطوارئ (خلال ساعات العمل)',
        'ضمان على الخدمات',
        'أولوية في المواعيد',
        'تذكيرات الصيانة'
      ] : [
        'All basic plan services',
        'Minor fault repairs',
        'Basic spare parts replacement',
        'Emergency service (during working hours)',
        'Service warranty',
        'Priority in appointments',
        'Maintenance reminders'
      ],
      notIncluded: i18n.language === 'ar' ? [
        'إصلاح الأعطال الكبيرة',
        'خدمة الطوارئ خارج ساعات العمل'
      ] : [
        'Major fault repairs',
        'Emergency service outside working hours'
      ],
      popular: false,
      buttonText: i18n.language === 'ar' ? 'اختر الخطة' : 'Choose Plan',
      buttonColor: 'bg-slate-800 hover:bg-slate-700'
    },
    {
      name: i18n.language === 'ar' ? 'الفاخر' : 'Deluxe',
      price: '599',
      period: i18n.language === 'ar' ? 'شهرياً' : 'Monthly',
      description: i18n.language === 'ar' ? 'الخطة الفاخرة مع جميع الخدمات' : 'Luxury plan with all services',
      features: i18n.language === 'ar' ? [
        'جميع خدمات الخطة المتقدمة',
        'إصلاح جميع أنواع الأعطال',
        'تغيير جميع قطع الغيار',
        'خدمة الطوارئ 24/7',
        'خدمة التوصيل والاستلام',
        'ضمان شامل',
        'صيانة مجانية لمدة شهر',
        'استشارات فنية مجانية'
      ] : [
        'All advanced plan services',
        'All types of fault repairs',
        'All spare parts replacement',
        '24/7 Emergency service',
        'Pickup and delivery service',
        'Comprehensive warranty',
        'Free maintenance for one month',
        'Free technical consultations'
      ],
      notIncluded: [],
      popular: false,
      buttonText: i18n.language === 'ar' ? 'اختر الخطة' : 'Choose Plan',
      buttonColor: 'bg-slate-800 hover:bg-slate-700'
    }
  ];

  const additionalServices = [
    {
      name: i18n.language === 'ar' ? 'خدمة الطوارئ' : 'Emergency Service',
      price: '150',
      description: i18n.language === 'ar' ? 'خدمة الطوارئ خارج ساعات العمل' : 'Emergency service outside working hours'
    },
    {
      name: i18n.language === 'ar' ? 'توصيل السيارة' : 'Car Delivery',
      price: '50',
      description: i18n.language === 'ar' ? 'توصيل السيارة من وإلى المنزل' : 'Car delivery to and from home'
    },
    {
      name: i18n.language === 'ar' ? 'استبدال البطارية' : 'Battery Replacement',
      price: '300',
      description: i18n.language === 'ar' ? 'استبدال البطارية مع التركيب' : 'Battery replacement with installation'
    },
    {
      name: i18n.language === 'ar' ? 'تغيير الإطارات' : 'Tire Change',
      price: '200',
      description: i18n.language === 'ar' ? 'تغيير الإطارات الأربعة مع الموازنة' : 'Change all four tires with balancing'
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('pricing.title')}</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('pricing.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg p-8 relative pricing-card ${
                  plan.popular ? 'ring-2 ring-yellow-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                    <span className="text-gray-600">
                      {isRTL ? `ريال ${plan.period}` : `${plan.period} Riyal`}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className={`font-semibold text-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'ما يشمل:' : 'Includes:'}
                  </h4>
                  <div className="feature-list">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className={`feature-item flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 flex-shrink-0 icon" />
                        <span className="text-gray-700 text">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {plan.notIncluded.length > 0 && (
                    <>
                      <h4 className={`font-semibold text-slate-800 mt-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'لا يشمل:' : 'Not included:'}
                      </h4>
                      <div className="feature-list">
                        {plan.notIncluded.map((feature, featureIndex) => (
                          <div key={featureIndex} className={`feature-item flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <FontAwesomeIcon icon={faTimes} className="text-red-500 flex-shrink-0 icon" />
                            <span className="text-gray-500 text">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <NavLink
                  to="/appointment"
                  className={`w-full ${plan.buttonColor} text-white py-3 px-6 rounded-lg font-medium transition-colors text-center block`}
                >
                  {plan.buttonText}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Services */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {isRTL ? 'خدمات إضافية' : 'Additional Services'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isRTL ? 'خدمات إضافية يمكنك طلبها حسب الحاجة' : 'Additional services you can request as needed'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{service.name}</h3>
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {service.price} {isRTL ? 'ريال' : 'Riyal'}
                </div>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className={`text-lg font-semibold text-slate-800 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'هل يمكنني تغيير الخطة في أي وقت؟' : 'Can I change my plan at any time?'}
              </h3>
              <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. التغييرات ستكون فعالة من بداية الدورة التالية.' : 'Yes, you can upgrade or downgrade your plan at any time. Changes will be effective from the beginning of the next cycle.'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className={`text-lg font-semibold text-slate-800 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'ما هو الضمان المقدم مع الخطط؟' : 'What warranty is provided with the plans?'}
              </h3>
              <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'نقدم ضمان على جميع الخدمات المقدمة. مدة الضمان تختلف حسب نوع الخدمة والخطة المختارة.' : 'We provide warranty on all services offered. The warranty period varies according to the type of service and the chosen plan.'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className={`text-lg font-semibold text-slate-800 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'هل يمكنني إلغاء الاشتراك؟' : 'Can I cancel my subscription?'}
              </h3>
              <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'نعم، يمكنك إلغاء الاشتراك في أي وقت. لن يتم خصم أي رسوم إضافية بعد الإلغاء.' : 'Yes, you can cancel your subscription at any time. No additional fees will be charged after cancellation.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isRTL ? 'هل تحتاج مساعدة في اختيار الخطة المناسبة؟' : 'Need help choosing the right plan?'}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {isRTL ? 'تواصل معنا وسنساعدك في اختيار الخطة التي تناسب احتياجاتك وميزانيتك' : 'Contact us and we will help you choose the plan that suits your needs and budget'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/contact"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              {isRTL ? 'اتصل بنا' : 'Contact Us'}
            </NavLink>
            <NavLink
              to="/appointment"
              className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-slate-900 transition-colors"
            >
              {isRTL ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
