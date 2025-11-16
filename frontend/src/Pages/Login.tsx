import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCar,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
// Ensure this import points to your new api.js
import { authAPI } from "../services/api";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);

      // 1. Call API
      const response = await authAPI.login(data);

      // 2. Extract Data
      const {
        token,
        data: { user },
      } = response.data;

      // 3. Store in LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Success!
      toast.success(isRTL ? "تم تسجيل الدخول بنجاح" : "Login successful");

      // 5. Redirect to Dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error logging in:", error);
      const msg = error.response?.data?.message || "Failed to log in";
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
              {t("login.title")}
            </h2>
            <p className="mt-2 text-gray-600">
              {isRTL
                ? "مرحباً بك مرة أخرى في AutoLogic"
                : "Welcome back to AutoLogic"}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("login.email")}
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
                  placeholder={t("login.email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: isRTL
                        ? "كلمة المرور مطلوبة"
                        : "Password is required",
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-12 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("login.password")}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className={`${
                      isRTL ? "mr-2" : "ml-2"
                    } block text-sm text-gray-700`}
                  >
                    {isRTL ? "تذكرني" : "Remember me"}
                  </label>
                </div>

                {/* Removed Forgot Password link as we removed that feature */}
                {/* <div className="text-sm">...</div> */}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {t("login.login")}
              </button>
            </form>

            <div className="mt-6">
              {/* ... Social Login placeholders removed for simplicity ... */}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("login.noAccount")}{" "}
                <NavLink
                  to="/register"
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  {t("login.register")}
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
