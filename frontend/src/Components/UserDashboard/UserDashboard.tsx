import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import UserBookings from "./UserBookings";
import UserProfile from "./UserProfile";

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar / Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, <span className="font-semibold">{user.firstName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 flex items-center gap-2 cursor-pointer"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
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
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                  activeTab === "bookings"
                    ? "bg-yellow-50 text-yellow-600 border-l-4 border-yellow-500"
                    : "text-gray-600 hover:bg-gray-50"
                } cursor-pointer`}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                  activeTab === "profile"
                    ? "bg-yellow-50 text-yellow-600 border-l-4 border-yellow-500"
                    : "text-gray-600 hover:bg-gray-50"
                } cursor-pointer`}
              >
                <FontAwesomeIcon icon={faUser} />
                My Profile
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
