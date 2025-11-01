import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWrench, 
  faCog, 
  faCar, 
  faCircle, 
  faBatteryHalf, 
  faSearch, 
  faOilCan, 
  faSnowflake 
} from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Services: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      setServices(response.data.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (category) => {
    const iconMap = {
      'Engine': faWrench,
      'Transmission': faCog,
      'Brakes': faCar,
      'Tires': faCircle,
      'Electrical': faBatteryHalf,
      'Diagnostic': faSearch,
      'Oil': faOilCan,
      'AC': faSnowflake
    };
    return iconMap[category] || faWrench;
  };

  const getServiceData = (service) => {
    if (isRTL) {
      return {
        title: service.nameAr || service.name,
        description: service.descriptionAr || service.description,
        price: service.priceAr || `من ${service.price} ريال`,
        category: service.categoryAr || service.category
      };
    }
    return {
      title: service.name,
      description: service.description,
      price: `From ${service.price} SAR`,
      category: service.category
    };
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('services.title')}</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('services.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {services.map((service, index) => {
                const serviceData = getServiceData(service);
                const icon = getServiceIcon(service.category);
                
                return (
                  <div key={service._id || index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="text-center">
                      <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={icon} className="text-white text-2xl" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{serviceData.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{serviceData.description}</p>
                      <div className="text-yellow-600 font-semibold mb-4">{serviceData.price}</div>
                      <NavLink
                        to="/appointment"
                        className="inline-block bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {isRTL ? 'احجز الآن' : 'Book Now'}
                      </NavLink>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {isRTL ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isRTL 
                ? 'نحن نقدم خدمات عالية الجودة مع ضمان الرضا التام لعملائنا'
                : 'We provide high-quality services with complete customer satisfaction guarantee'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faWrench} className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {isRTL ? 'خبرة واسعة' : 'Wide Experience'}
              </h3>
              <p className="text-gray-600">
                {isRTL 
                  ? 'أكثر من 20 عاماً من الخبرة في مجال صيانة وإصلاح السيارات'
                  : 'More than 20 years of experience in car maintenance and repair'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faSearch} className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {isRTL ? 'تشخيص دقيق' : 'Accurate Diagnosis'}
              </h3>
              <p className="text-gray-600">
                {isRTL 
                  ? 'استخدام أحدث أجهزة التشخيص لتحديد المشاكل بدقة'
                  : 'Using the latest diagnostic equipment to accurately identify problems'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCar} className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {isRTL ? 'قطع غيار أصلية' : 'Original Parts'}
              </h3>
              <p className="text-gray-600">
                {isRTL 
                  ? 'نستخدم قطع الغيار الأصلية فقط لضمان الجودة والأداء'
                  : 'We use only original parts to ensure quality and performance'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isRTL ? 'هل تحتاج إلى مساعدة؟' : 'Need Help?'}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {isRTL 
              ? 'تواصل معنا اليوم واحصل على استشارة مجانية حول احتياجات سيارتك'
              : 'Contact us today and get a free consultation about your car needs'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/appointment"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              {isRTL ? 'احجز موعد' : 'Book Appointment'}
            </NavLink>
            <NavLink
              to="/contact"
              className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-slate-900 transition-colors"
            >
              {isRTL ? 'اتصل بنا' : 'Contact Us'}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
