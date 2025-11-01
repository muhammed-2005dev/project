import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faEye, 
  faSpinner,
  faSearch,
  faCalendar,
  faUser,
  faWrench,
  faDollarSign,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { adminApiService } from '../../services/adminApi';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  service: {
    _id: string;
    name: string;
    nameAr: string;
    price: number;
  };
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

const BookingManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter, dateFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params: any = { 
        page: currentPage, 
        limit: 10
      };
      
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) {
        const today = new Date();
        const filterDate = new Date(dateFilter);
        params.dateFrom = filterDate.toISOString().split('T')[0];
        params.dateTo = filterDate.toISOString().split('T')[0];
      }

      const response = await adminApiService.getBookings(params);
      setBookings(response.data.data.bookings);
      setTotalPages(response.data.pages);
    } catch (error: any) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await adminApiService.updateBookingStatus(bookingId, newStatus);
      toast.success(isRTL ? 'تم تحديث حالة الحجز' : 'Booking status updated successfully');
      loadBookings();
    } catch (error: any) {
      toast.error('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { en: string; ar: string } } = {
      'pending': { en: 'Pending', ar: 'في الانتظار' },
      'confirmed': { en: 'Confirmed', ar: 'مؤكد' },
      'in-progress': { en: 'In Progress', ar: 'قيد التنفيذ' },
      'completed': { en: 'Completed', ar: 'مكتمل' },
      'cancelled': { en: 'Cancelled', ar: 'ملغي' }
    };
    return isRTL ? statusMap[status]?.ar : statusMap[status]?.en;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isRTL ? 'إدارة الحجوزات' : 'Bookings Management'}
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في الحجوزات...' : 'Search bookings...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
            <option value="pending">{isRTL ? 'في الانتظار' : 'Pending'}</option>
            <option value="confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</option>
            <option value="in-progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
            <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
            <option value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Customer Info */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.user.firstName} {booking.user.lastName}
                  </h3>
                  <p className="text-gray-600">{booking.user.email}</p>
                  {booking.user.phone && (
                    <p className="text-sm text-gray-500">{booking.user.phone}</p>
                  )}
                </div>
              </div>

              {/* Service Info */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faWrench} className="text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {isRTL ? booking.service.nameAr : booking.service.name}
                  </h4>
                  <p className="text-yellow-600 font-bold">${booking.service.price}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendar} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.scheduledDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ${booking.totalAmount}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <select
                    value={booking.status}
                    onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="pending">{isRTL ? 'في الانتظار' : 'Pending'}</option>
                    <option value="confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</option>
                    <option value="in-progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
                    <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                    <option value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
                  </select>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>{isRTL ? 'ملاحظات:' : 'Notes:'}</strong> {booking.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {isRTL ? 'السابق' : 'Previous'}
          </button>
          
          <span className="px-4 py-2 text-gray-600">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {isRTL ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isRTL ? 'لا توجد حجوزات' : 'No bookings found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
