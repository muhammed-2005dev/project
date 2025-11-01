import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faUser, faPhone, faEnvelope, faCar } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';

interface AppointmentForm {
  service: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

const MakeAppointment: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentForm>();

  const services = isRTL ? [
    'فحص شامل للمحرك',
    'تغيير الزيت والفلتر',
    'فحص وإصلاح المكابح',
    'فحص وتغيير الإطارات',
    'فحص وتغيير البطارية',
    'فحص نظام التكييف',
    'تشخيص الأعطال',
    'صيانة دورية شاملة',
    'خدمة طوارئ',
    'خدمة أخرى'
  ] : [
    'Complete Engine Inspection',
    'Oil and Filter Change',
    'Brake Inspection and Repair',
    'Tire Inspection and Change',
    'Battery Inspection and Change',
    'Air Conditioning System Check',
    'Fault Diagnosis',
    'Comprehensive Periodic Maintenance',
    'Emergency Service',
    'Other Service'
  ];

  const timeSlots = isRTL ? [
    '08:00 ص',
    '09:00 ص',
    '10:00 ص',
    '11:00 ص',
    '12:00 م',
    '01:00 م',
    '02:00 م',
    '03:00 م',
    '04:00 م',
    '05:00 م',
    '06:00 م'
  ] : [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM'
  ];

  const onSubmit = (data: AppointmentForm) => {
    if (!selectedDate || !selectedTime) {
      toast.error(isRTL ? 'يرجى اختيار التاريخ والوقت' : 'Please select date and time');
      return;
    }
    
    console.log('Appointment data:', {
      ...data,
      date: selectedDate,
      time: selectedTime
    });
    toast.success(isRTL ? 'تم حجز الموعد بنجاح' : 'Appointment booked successfully');
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('appointment.title')}</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('appointment.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Appointment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className={`text-2xl font-bold text-slate-800 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'معلومات الحجز' : 'Booking Information'}
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faCar} className="mr-2" />
                      {t('appointment.service')}
                    </label>
                    <select
                      {...register('service', { required: isRTL ? 'يرجى اختيار الخدمة' : 'Please select a service' })}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <option value="">{isRTL ? 'اختر الخدمة المطلوبة' : 'Choose the required service'}</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-red-500 text-sm mt-1">{errors.service.message}</p>
                    )}
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                        {t('appointment.date')}
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                        dateFormat="dd/MM/yyyy"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholderText={isRTL ? 'اختر التاريخ' : 'Choose date'}
                        excludeDates={[new Date()]} // Exclude today
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        {t('appointment.time')}
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                      >
                        <option value="">{isRTL ? 'اختر الوقت' : 'Choose time'}</option>
                        {timeSlots.map((time, index) => (
                          <option key={index} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        {t('appointment.name')}
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: isRTL ? 'الاسم مطلوب' : 'Name is required' })}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholder={t('appointment.name')}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                        {t('appointment.phone')}
                      </label>
                      <input
                        type="tel"
                        {...register('phone', { 
                          required: isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required',
                          pattern: {
                            value: /^[0-9+\-\s()]+$/,
                            message: isRTL ? 'رقم الهاتف غير صحيح' : 'Invalid phone number'
                          }
                        })}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholder={t('appointment.phone')}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      {t('appointment.email')}
                    </label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address'
                        }
                      })}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={t('appointment.email')}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('appointment.message')}
                    </label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={t('appointment.message')}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                  >
                    {t('appointment.book')}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className={`text-lg font-bold text-slate-800 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FontAwesomeIcon icon={faPhone} className="text-yellow-500" />
                    <span className="text-gray-700">888 123-4587</span>
                  </div>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FontAwesomeIcon icon={faEnvelope} className="text-yellow-500" />
                    <span className="text-gray-700">info@example.com</span>
                  </div>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
                    <span className="text-gray-700">
                      {isRTL ? 'الاثنين - الجمعة: 8:00 ص - 6:00 م' : 'Monday - Friday: 8:00 AM - 6:00 PM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className={`text-lg font-bold text-slate-800 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'ساعات العمل' : 'Working Hours'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">
                      {isRTL ? 'الاثنين - الجمعة' : 'Monday - Friday'}
                    </span>
                    <span className="text-gray-800">
                      {isRTL ? '8:00 ص - 6:00 م' : '8:00 AM - 6:00 PM'}
                    </span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">
                      {isRTL ? 'السبت' : 'Saturday'}
                    </span>
                    <span className="text-gray-800">
                      {isRTL ? '9:00 ص - 4:00 م' : '9:00 AM - 4:00 PM'}
                    </span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">
                      {isRTL ? 'الأحد' : 'Sunday'}
                    </span>
                    <span className="text-gray-800">
                      {isRTL ? 'مغلق' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className={`text-lg font-bold text-red-800 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'خدمة الطوارئ' : 'Emergency Service'}
                </h3>
                <p className={`text-red-700 text-sm mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'للطوارئ خارج ساعات العمل' : 'For emergencies outside working hours'}
                </p>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FontAwesomeIcon icon={faPhone} className="text-red-600" />
                  <span className="text-red-800 font-semibold">999 123-4567</span>
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
