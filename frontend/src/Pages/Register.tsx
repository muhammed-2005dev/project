import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCar } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
// Ensure this import points to your new api.js
import { authAPI } from "../services/api";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // FIX: Made async to wait for API result
  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);

      // 1. Call API
      const response = await authAPI.register(data);

      // 2. Success!
      toast.success(
        isRTL ? "تم إنشاء الحساب بنجاح" : "Account created successfully"
      );

      // Optional: Auto-login (Store token)
      // localStorage.setItem('token', response.data.token);
      // localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // navigate('/');

      // OR: Redirect to Login (Safer/Cleaner)
      navigate("/login");
    } catch (error: any) {
      console.error("Error registering:", error);
      // Show specific error from backend if available
      const msg = error.response?.data?.message || "Failed to register";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCar} className="text-white text-2xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">
              {t("register.title")}
            </h2>
            <p className="mt-2 text-gray-600">
              {isRTL
                ? "انضم إلى عائلة AutoLogic اليوم"
                : "Join the AutoLogic family today"}
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("register.firstName")}
                  </label>
                  <input
                    type="text"
                    {...register("firstName", {
                      required: isRTL
                        ? "الاسم الأول مطلوب"
                        : "First name is required",
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("register.firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("register.lastName")}
                  </label>
                  <input
                    type="text"
                    {...register("lastName", {
                      required: isRTL
                        ? "اسم العائلة مطلوب"
                        : "Last name is required",
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("register.lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("register.email")}
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: isRTL
                      ? "البريد الإلكتروني مطلوب"
                      : "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: isRTL
                        ? "البريد الإلكتروني غير صحيح"
                        : "Invalid email address",
                    },
                  })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  placeholder={t("register.email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("register.phone")}
                </label>
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
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  placeholder={t("register.phone")}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("register.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: isRTL
                        ? "كلمة المرور مطلوبة"
                        : "Password is required",
                      minLength: {
                        value: 6,
                        message: isRTL
                          ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
                          : "Password must be at least 6 characters",
                      },
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-12 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("register.password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("register.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: isRTL
                        ? "تأكيد كلمة المرور مطلوب"
                        : "Confirm password is required",
                      validate: (value) =>
                        value === password ||
                        (isRTL
                          ? "كلمات المرور غير متطابقة"
                          : "Passwords do not match"),
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-12 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("register.confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="terms"
                  className={`${
                    isRTL ? "mr-2" : "ml-2"
                  } block text-sm text-gray-700`}
                >
                  {isRTL ? (
                    <>
                      أوافق على{" "}
                      <NavLink
                        to="/terms"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        الشروط والأحكام
                      </NavLink>{" "}
                      و{" "}
                      <NavLink
                        to="/privacy"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        سياسة الخصوصية
                      </NavLink>
                    </>
                  ) : (
                    <>
                      I agree to the{" "}
                      <NavLink
                        to="/terms"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        Terms and Conditions
                      </NavLink>{" "}
                      and{" "}
                      <NavLink
                        to="/privacy"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        Privacy Policy
                      </NavLink>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {t("register.register")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("register.hasAccount")}{" "}
                <NavLink
                  to="/login"
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  {t("register.login")}
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
