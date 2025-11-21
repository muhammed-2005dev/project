import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import UserBookings from "../../Components/UserDashboard/UserBookings";
import UserProfile from "../../Components/UserDashboard/UserProfile";

const UserDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("bookings");

  // Safe parsing of user data
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : { firstName: "User" };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Navbar / Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {t("dashboard.userTitle")}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {t("dashboard.welcome")},{" "}
              <span className="font-semibold">{user.firstName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 flex items-center gap-2 cursor-pointer"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              {t("dashboard.logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors cursor-pointer ${
                  isRTL ? "text-right flex-row-reverse" : "text-left"
                } ${
                  activeTab === "bookings"
                    ? `bg-yellow-50 text-yellow-600 ${
                        isRTL ? "border-r-4" : "border-l-4"
                      } border-yellow-500`
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span className="flex-1">{t("dashboard.myBookings")}</span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors cursor-pointer ${
                  isRTL ? "text-right flex-row-reverse" : "text-left"
                } ${
                  activeTab === "profile"
                    ? `bg-yellow-50 text-yellow-600 ${
                        isRTL ? "border-r-4" : "border-l-4"
                      } border-yellow-500`
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FontAwesomeIcon icon={faUser} />
                <span className="flex-1">{t("dashboard.myProfile")}</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === "bookings" ? <UserBookings /> : <UserProfile />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
