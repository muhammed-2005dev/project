import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faCog,
  faCar,
  faCircle,
  faBatteryHalf,
  faSearch,
  faOilCan,
  faSnowflake,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { servicesAPI } from "../services/api";
import toast from "react-hot-toast";

const Services: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll({ limit: 100 }); // Fetch all active services
      setServices(response.data.data.services);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      Engine: faWrench,
      Transmission: faCog,
      Brakes: faCar,
      Tires: faCircle,
      Electrical: faBatteryHalf,
      Diagnostic: faSearch,
      Oil: faOilCan,
      AC: faSnowflake,
    };
    return iconMap[category] || faWrench;
  };

  // Handle Booking Click - Pre-select the service
  const handleBookNow = (serviceId: string) => {
    navigate("/appointment", { state: { selectedServiceId: serviceId } });
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("services.title")}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t("services.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-yellow-500 animate-spin"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {services.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 text-lg">
                  No services found. Check back later!
                </div>
              ) : (
                services.map((service) => {
                  const icon = getServiceIcon(service.category);
                  const imageUrl =
                    service.images && service.images.length > 0
                      ? service.images[0].url
                      : null;

                  return (
                    <div
                      key={service._id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                    >
                      {/* Image Section */}
                      <div className="h-48 bg-gray-100 relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <FontAwesomeIcon
                              icon={icon}
                              className="text-slate-300 text-6xl"
                            />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-yellow-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                          <FontAwesomeIcon
                            icon={icon}
                            className="text-white text-lg"
                          />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3 flex-grow">
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <div className="text-yellow-600 font-bold text-lg">
                            ${service.price}
                          </div>
                          <button
                            onClick={() => handleBookNow(service._id)}
                            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium cursor-pointer"
                          >
                            {isRTL ? "احجز الآن" : "Book Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Why Choose Us (Static Content) */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {isRTL ? "لماذا تختارنا؟" : "Why Choose Us?"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isRTL
                ? "نحن نقدم خدمات عالية الجودة مع ضمان الرضا التام لعملائنا"
                : "We provide high-quality services with complete customer satisfaction guarantee"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                <FontAwesomeIcon icon={faWrench} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {isRTL ? "خبرة واسعة" : "Wide Experience"}
              </h3>
              <p className="text-gray-600">
                {isRTL
                  ? "أكثر من 20 عاماً من الخبرة في مجال صيانة وإصلاح السيارات"
                  : "More than 20 years of experience in car maintenance and repair"}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                <FontAwesomeIcon icon={faSearch} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {isRTL ? "تشخيص دقيق" : "Accurate Diagnosis"}
              </h3>
              <p className="text-gray-600">
                {isRTL
                  ? "استخدام أحدث أجهزة التشخيص لتحديد المشاكل بدقة"
                  : "Using the latest diagnostic equipment to accurately identify problems"}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                <FontAwesomeIcon icon={faCar} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {isRTL ? "قطع غيار أصلية" : "Original Parts"}
              </h3>
              <p className="text-gray-600">
                {isRTL
                  ? "نستخدم قطع الغيار الأصلية فقط لضمان الجودة والأداء"
                  : "We use only original parts to ensure quality and performance"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isRTL ? "هل تحتاج إلى مساعدة؟" : "Need Help?"}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {isRTL
              ? "تواصل معنا اليوم واحصل على استشارة مجانية حول احتياجات سيارتك"
              : "Contact us today and get a free consultation about your car needs"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/appointment"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              {isRTL ? "احجز موعد" : "Book Appointment"}
            </NavLink>
            <NavLink
              to="/contact"
              className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-slate-900 transition-colors"
            >
              {isRTL ? "اتصل بنا" : "Contact Us"}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
