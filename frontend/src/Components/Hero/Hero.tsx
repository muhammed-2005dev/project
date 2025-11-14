import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import hero1 from "./igor-constantino-aXxu0nVMGmk-unsplash.jpg";
import hero2 from "./joseph-pillado-n99UTGfbvFQ-unsplash.jpg";
import hero3 from "./kate-ibragimova-bEGTsOCnHro-unsplash.jpg";
import { contactAPI } from "../../services/api.js";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function Hero() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const images = [hero1, hero2, hero3];
  const [current, setCurrent] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  // Slider images changes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = (data: ContactForm) => {
    console.log("Contact form data:", data);
    toast.success(
      isRTL ? "تم إرسال الرسالة بنجاح" : "Message sent successfully"
    );
    // Here you would typically send the data to your backend API
    sendMessage(data);
    reset();
  };

  const sendMessage = (data: ContactForm) => {
    try {
      contactAPI.sendMessage(data);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleBookAppointment = () => {
    navigate("/appointment");
  };

  return (
    <section
      className={`relative w-full min-h-[100vh] flex flex-col justify-center bg-cover bg-center transition-all duration-700 ${
        isRTL ? "rtl" : "ltr"
      }`}
      style={{ backgroundImage: `url(${images[current]})` }}
    >
      {/* to make the image more dark to make the text look more clear */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-6 py-16 gap-10 items-center text-white">
        {/* Left side*/}
        <div
          className={`max-w-xl text-center md:text-left flex-1 ${
            isRTL ? "md:text-right" : "md:text-left"
          }`}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-18">
            {t("hero.title")}
          </h1>
          <p className="text-base sm:text-lg mb-6">{t("hero.subtitle")}</p>
          <button
            onClick={handleBookAppointment}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-md transition"
          >
            {t("hero.button")}
          </button>
        </div>

        {/* Right side form */}
        <div className="bg-white text-slate-800 p-8 rounded-xl w-full sm:w-[90%] md:w-[45%] lg:w-[35%] flex-1">
          <h2
            className={`text-2xl font-semibold mb-5 text-center ${
              isRTL ? "md:text-right" : "md:text-left"
            }`}
          >
            {t("contact.title")}
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div>
              <input
                type="text"
                {...register("name", {
                  required: isRTL ? "الاسم مطلوب" : "Name is required",
                })}
                placeholder={t("contact.name")}
                className={`border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:border-yellow-500 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                {...register("email", {
                  required: isRTL
                    ? "البريد الإلكترونى مطلوب"
                    : "Email is required",
                })}
                placeholder={t("contact.email")}
                className={`border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:border-yellow-500 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="tel"
                {...register("phone", {
                  required: isRTL
                    ? "رقم الهاتف مطلوب"
                    : "Phone number is required",
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: isRTL
                      ? "رقم الهاتف غير صحيح"
                      : "Invalid phone number",
                  },
                })}
                placeholder={t("contact.phone")}
                className={`border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:border-yellow-500 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <textarea
                {...register("message", {
                  required: isRTL ? "الرسالة مطلوبة" : "Message is required",
                })}
                placeholder={t("contact.message")}
                rows={4}
                className={`border border-gray-300 p-4 rounded-md w-full resize-none focus:outline-none focus:border-yellow-500 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-md font-semibold transition"
            >
              {t("contact.send")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Hero;
