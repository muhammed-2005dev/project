import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faUser,
  faPhone,
  faEnvelope,
  faCar,
  faWrench,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import { servicesAPI, bookingsAPI } from "../services/api";

interface AppointmentForm {
  service: string;
  appointmentTime: string;
  carMake: string;
  carModel: string;
  carYear: number;
  description: string;
}

const MakeAppointment: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const location = useLocation();

  // Auth Check
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const [services, setServices] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AppointmentForm>();

  // 1. FIX: Run ONCE on mount
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const userJson = localStorage.getItem("user");

      if (!userJson) {
        toast.error("Please login to make an appointment");
        navigate("/login");
        return;
      }

      // If auth is good, load data
      await loadServices();
    };

    checkAuthAndLoad();
  }, []);

  // 2. Fetch Services
  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll({ limit: 100 });
      setServices(response.data.data.services);

      // Check if a service was pre-selected from the Services page
      if (location.state?.selectedServiceId) {
        setValue("service", location.state.selectedServiceId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load services");
    }
  };

  // 3. Fetch Available Slots when Date Changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date: Date) => {
    try {
      setSlotsLoading(true);
      // Format date as YYYY-MM-DD manually to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const response = await bookingsAPI.getAvailableSlots(dateString);
      setTimeSlots(response.data.data.availableSlots);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load time slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const onSubmit = async (data: AppointmentForm) => {
    if (!selectedDate) {
      toast.error(t("appointment.selectDateFirst")); // Using translation
      return;
    }

    try {
      setLoading(true);

      // Construct payload matching backend Booking model
      const payload = {
        service: data.service,
        appointmentDate: selectedDate,
        appointmentTime: data.appointmentTime,
        car: {
          make: data.carMake,
          model: data.carModel,
          year: data.carYear,
        },
        issue: {
          description: data.description,
        },
      };

      await bookingsAPI.create(payload);

      toast.success(t("common.success") || "Appointment booked successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to create booking";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("appointment.title")}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t("appointment.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2
                  className={`text-2xl font-bold text-slate-800 mb-6 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("appointment.bookingInfo")}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* 1. Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faWrench} className="mr-2" />
                      {t("appointment.service")}
                    </label>
                    <select
                      {...register("service", {
                        required:
                          t("appointment.selectServiceError") ||
                          "Please select a service",
                      })}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        isRTL ? "text-right" : "text-left"
                      } cursor-pointer`}
                    >
                      <option value="">{t("appointment.chooseService")}</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name} (${service.price})
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.service.message}
                      </p>
                    )}
                  </div>

                  {/* 2. Car Information */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCar} />{" "}
                      {t("appointment.vehicleDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">
                          {t("appointment.make")}
                        </label>
                        <input
                          type="text"
                          placeholder={isRTL ? "مثال: تويوتا" : "e.g. Toyota"}
                          {...register("carMake", {
                            required: isRTL
                              ? "الشركة مطلوبة"
                              : "Make is required",
                          })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        {errors.carMake && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.carMake.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">
                          {t("appointment.model")}
                        </label>
                        <input
                          type="text"
                          placeholder={isRTL ? "مثال: كورولا" : "e.g. Corolla"}
                          {...register("carModel", {
                            required: isRTL
                              ? "الموديل مطلوب"
                              : "Model is required",
                          })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        {errors.carModel && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.carModel.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">
                          {t("appointment.year")}
                        </label>
                        <input
                          type="number"
                          placeholder="2020"
                          {...register("carYear", {
                            required: isRTL
                              ? "السنة مطلوبة"
                              : "Year is required",
                            min: { value: 1900, message: "Invalid year" },
                            max: {
                              value: new Date().getFullYear() + 1,
                              message: "Invalid year",
                            },
                          })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        {errors.carYear && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.carYear.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                        {t("appointment.date")}
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        maxDate={
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                        dateFormat="dd/MM/yyyy"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                        placeholderText={t("appointment.chooseDate")}
                        wrapperClassName="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        {t("appointment.time")}
                        {slotsLoading && (
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin ml-2 text-yellow-500"
                          />
                        )}
                      </label>
                      <select
                        {...register("appointmentTime", {
                          required: t("appointment.selectTimeError"),
                        })}
                        disabled={!selectedDate || slotsLoading}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 ${
                          isRTL ? "text-right" : "text-left"
                        } cursor-pointer`}
                      >
                        <option value="">{t("appointment.chooseTime")}</option>
                        {timeSlots.map((time, index) => (
                          <option key={index} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {errors.appointmentTime && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.appointmentTime.message}
                        </p>
                      )}
                      {!selectedDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t("appointment.selectDateFirst")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Issue Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("appointment.issueDescription")}
                    </label>
                    <textarea
                      {...register("description", {
                        required: isRTL
                          ? "وصف المشكلة مطلوب"
                          : "Description is required",
                      })}
                      rows={4}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                      placeholder={t("appointment.describeProblem")}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
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
                    {t("appointment.book")}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar: User Info (Read-Only) & Contact */}
            <div className="space-y-6">
              {/* Logged In User Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} /> {t("appointment.yourInfo")}
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-blue-600">
                      {t("appointment.name")}:
                    </span>
                    <span className="font-medium text-slate-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </p>
                  <p className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-blue-600">
                      {t("appointment.email")}:
                    </span>
                    <span className="font-medium text-slate-700">
                      {user?.email}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-blue-600">
                      {t("appointment.phone")}:
                    </span>
                    <span className="font-medium text-slate-700">
                      {user?.phone || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Contact Info (Static) */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3
                  className={`text-lg font-bold text-slate-800 mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("appointment.shopContact")}
                </h3>
                <div className="space-y-3">
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-yellow-500"
                    />
                    <span className="text-gray-700">{t("contact.phoneNumber")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-yellow-500"
                    />
                    <span className="text-gray-700">{t("contact.emailAddress")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-yellow-500"
                    />
                    <span className="text-gray-700">
                      {t("topbar.hours")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeAppointment;
