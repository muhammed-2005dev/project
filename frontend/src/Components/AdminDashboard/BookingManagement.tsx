import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSpinner,
  faSearch,
  faCalendar,
  faUser,
  faWrench,
  faHardHat, // Icon for Technician
} from "@fortawesome/free-solid-svg-icons";
import { bookingsAPI } from "../../services/api";
import BookingModal from "./BookingModal"; // Import the new modal
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  service: {
    _id: string;
    name: string;
    price: number;
  };
  technician?: {
    // Added technician field
    _id: string;
    firstName: string;
    lastName: string;
  };
  car: {
    // Added car field for the modal
    make: string;
    model: string;
    year: number;
  };
  issue: {
    description: string;
  };
  status:
    | "pending"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show";
  appointmentDate: string;
  appointmentTime: string;
  estimatedCost: number;
  createdAt: string;
}

const BookingManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Data
  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter, dateFilter, debouncedSearchTerm]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter) params.status = statusFilter;
      if (dateFilter) {
        params.date = dateFilter;
      }

      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.data.bookings);
      setTotalPages(response.data.pages);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: string
  ) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      toast.success(
        isRTL ? "تم تحديث حالة الحجز" : "Booking status updated successfully"
      );
      loadBookings(); // Reload to reflect changes
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update booking status");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!debouncedSearchTerm) return true;
    const term = debouncedSearchTerm.toLowerCase();

    return (
      (booking.customer?.firstName?.toLowerCase() || "").includes(term) ||
      (booking.customer?.lastName?.toLowerCase() || "").includes(term) ||
      (booking.service?.name?.toLowerCase() || "").includes(term)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isRTL ? "إدارة الحجوزات" : "Bookings Management"}
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              {loading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin text-yellow-500"
                />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
            </div>
            <input
              type="text"
              placeholder={
                isRTL ? "البحث في الحجوزات..." : "Search bookings..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
          >
            <option value="">{isRTL ? "جميع الحالات" : "All Status"}</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>

          {/* Date */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div
        className={`space-y-4 transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {filteredBookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* 1. Customer & Service */}
              <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faWrench} className="text-green-500" />
                  {booking.service?.name || "Service Deleted"}
                </div>
                {booking.technician && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 mt-1 bg-purple-50 w-fit px-2 py-1 rounded">
                    <FontAwesomeIcon icon={faHardHat} />
                    Tech: {booking.technician.firstName}
                  </div>
                )}
              </div>

              {/* 2. Date & Cost */}
              <div className="flex flex-col gap-1 min-w-[150px]">
                <div className="flex items-center gap-2 text-gray-700">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="text-gray-400"
                  />
                  {new Date(booking.appointmentDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500 pl-6">
                  {booking.appointmentTime}
                </div>
                <div className="text-sm font-bold text-yellow-600 pl-6">
                  ${booking.estimatedCost}
                </div>
              </div>

              {/* 3. Status & Actions */}
              <div className="flex flex-col items-start gap-3 min-w-35">
                <div className="flex items-center gap-2">
                  {/* Manage Button */}
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 size-7.5 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                    title={isRTL ? "إدارة الحجز" : "Manage Booking"}
                  >
                    <FontAwesomeIcon icon={faEdit} />{" "}
                  </button>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <select
                  value={booking.status}
                  onChange={(e) =>
                    handleUpdateBookingStatus(booking._id, e.target.value)
                  }
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
          >
            {isRTL ? "السابق" : "Previous"}
          </button>

          <span className="px-4 py-2 text-gray-600">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
          >
            {isRTL ? "التالي" : "Next"}
          </button>
        </div>
      )}

      {bookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isRTL ? "لا توجد حجوزات" : "No bookings found"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadBookings} // Reloads list after assigning technician
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingManagement;
