import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { bookingsAPI } from "../../services/api";
import toast from "react-hot-toast";

const UserBookings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    const confirmMsg = isRTL
      ? "هل أنت متأكد من إلغاء هذا الموعد؟"
      : "Are you sure you want to cancel this appointment?";

    if (!window.confirm(confirmMsg)) return;

    try {
      await bookingsAPI.cancel(id);
      toast.success(t("common.success") || "Booking cancelled successfully");
      loadMyBookings(); // Reload list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <FontAwesomeIcon
          icon={faSpinner}
          className="animate-spin text-3xl text-yellow-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {t("dashboard.myBookings")}
      </h2>

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">
            {isRTL
              ? "لم تقم بحجز أي خدمات بعد"
              : "You haven't booked any services yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className={`bg-white rounded-lg shadow-md p-6 border-yellow-500 hover:shadow-lg transition-shadow ${
                isRTL ? "border-r-4" : "border-l-4"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Service Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {t(`status.${booking.status}`)}
                    </span>
                    <span className="text-sm text-gray-500">
                      #{booking._id.slice(-6)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {booking.service?.name || "Service Deleted"}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="text-yellow-500"
                      />
                      {new Date(booking.appointmentDate).toLocaleDateString(
                        isRTL ? "ar-EG" : "en-US"
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-yellow-500"
                      />
                      {booking.appointmentTime}
                    </span>
                    <span className="font-semibold text-green-600">
                      ${booking.estimatedCost}
                    </span>
                  </div>
                </div>

                {/* Car Info */}
                <div className="bg-gray-50 p-3 rounded-lg min-w-[200px]">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    {t("appointment.vehicleDetails")}
                  </p>
                  <p className="font-medium text-gray-800">
                    {booking.car.make} {booking.car.model} ({booking.car.year})
                  </p>
                </div>

                {/* Actions */}
                <div>
                  {booking.status === "pending" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                      {t("common.cancel")}
                    </button>
                  )}
                </div>
              </div>

              {/* Issue Description */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">
                    {t("appointment.issueDescription")}:
                  </span>{" "}
                  {booking.issue.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
