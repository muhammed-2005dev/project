import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { contactAPI } from "../services/api";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    try {
      setLoading(true);

      // Call the new API
      await contactAPI.sendMessage(data);

      toast.success(t("common.success") || "Message sent successfully");
      reset();
    } catch (error: any) {
      console.error("Error sending message:", error);
      const msg = error.response?.data?.message || "Failed to send message";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: faLocationDot,
      title: t("contact.address"),
      details: t("topbar.address"),
    },
    {
      icon: faPhone,
      title: t("contact.phone"),
      details: t("contact.phoneNumber"),
    },
    {
      icon: faEnvelope,
      title: t("contact.email"),
      details: t("contact.emailAddress"),
    },
    {
      icon: faClock,
      title: isRTL ? "ساعات العمل" : "Working Hours",
      details: t("topbar.hours"),
    },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("contact.title")}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2
                className={`text-2xl font-bold text-slate-800 mb-6 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {isRTL ? "إرسال رسالة" : "Send Message"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.name")}
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: t("contact.nameRequired") || "Name is required",
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("contact.name") || "Name"}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.email")}
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required:
                        t("contact.emailRequired") || "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t("contact.emailInvalid") || "Invalid email",
                      },
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("contact.email") || "Email"}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.phone")}
                  </label>
                  <input
                    type="tel"
                    {...register("phone", {
                      required:
                        t("contact.phoneRequired") || "Phone is required",
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("contact.phone") || "Phone"}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.message")}
                  </label>
                  <textarea
                    {...register("message", {
                      required:
                        t("contact.messageRequired") || "Message is required",
                    })}
                    rows={5}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("contact.message") || "Message"}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {loading && (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  )}
                  {t("contact.send")}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2
                  className={`text-2xl font-bold text-slate-800 mb-6 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {isRTL ? "معلومات الاتصال" : "Contact Information"}
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon
                          icon={info.icon}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-gray-600">{info.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map (Real Google Map) */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2
                  className={`text-2xl font-bold text-slate-800 mb-6 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {isRTL ? "موقعنا" : "Our Location"}
                </h2>

                {/* Map Container */}
                <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                  <iframe
                    title="Company Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d852.9382610628317!2d29.949155291431286!3d31.227570620295158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f5c4eb818bb859%3A0xe4b28ff2fa922b23!2sSkills%20Dynamix!5e0!3m2!1sen!2seg!4v1763665690880!5m2!1sen!2seg"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
