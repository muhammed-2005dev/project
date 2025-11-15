import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
  faSearch,
  faUserShield,
  faUser,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import { usersAPI } from "../../services/api";
import UserModal from "./UserModal";
import toast from "react-hot-toast";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "technician";
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 1. Debounce Logic: Update 'debouncedSearchTerm' 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1); // Reset to page 1 if search changes
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Load Data when Debounced Term, Role, or Page changes
  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, debouncedSearchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({
        page: currentPage,
        limit: 10,
        role: roleFilter || undefined,
        query: debouncedSearchTerm || undefined, // Use the debounced term
      });
      setUsers(response.data.data.users);
      setTotalPages(response.data.pages);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !window.confirm(
        isRTL
          ? "هل أنت متأكد من حذف هذا المستخدم؟"
          : "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }

    try {
      await usersAPI.delete(id);
      toast.success(isRTL ? "تم حذف المستخدم" : "User deleted successfully");
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      toast.success(
        isRTL ? "تم تحديث دور المستخدم" : "User role updated successfully"
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (error: any) {
      toast.error("Failed to update user role");
    }
  };

  // 3. REMOVED BLOCKING LOADER
  // We removed the "if (loading) return <Spinner>" block.
  // Instead, the UI stays visible while loading.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isRTL ? "إدارة المستخدمين" : "Users Management"}
        </h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {isRTL ? "إضافة مستخدم" : "Add User"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            {/* Show spinner icon if loading, otherwise show search icon */}
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
              placeholder={isRTL ? "البحث..." : "Search users..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
          >
            <option value="">{isRTL ? "جميع الأدوار" : "All Roles"}</option>
            <option value="user">{isRTL ? "مستخدم" : "User"}</option>
            <option value="admin">{isRTL ? "مدير" : "Admin"}</option>
            <option value="technician">{isRTL ? "فني" : "Technician"}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
        {/* Add a slight fade effect when loading data */}
        <div
          className={`transition-opacity duration-200 ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isRTL ? "المستخدم" : "User"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isRTL ? "البريد الإلكتروني" : "Email"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isRTL ? "الدور" : "Role"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isRTL ? "الحالة" : "Status"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isRTL ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-white"
                          />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={
                          user.role === "admin"
                            ? faUserShield
                            : user.role === "technician"
                            ? faTools
                            : faUser
                        }
                        className={
                          user.role === "admin"
                            ? "text-purple-500"
                            : user.role === "technician"
                            ? "text-slate-600"
                            : "text-blue-500"
                        }
                      />
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "technician"
                            ? "bg-slate-100 text-slate-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive
                        ? isRTL
                          ? "نشط"
                          : "Active"
                        : isRTL
                        ? "غير نشط"
                        : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowModal(true);
                        }}
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                        title={isRTL ? "تعديل" : "Edit"}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title={isRTL ? "حذف" : "Delete"}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>

                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateUserRole(user._id, e.target.value)
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1 cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="technician">Technician</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
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

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isRTL ? "لا توجد مستخدمين" : "No users found"}
          </p>
        </div>
      )}

      {/* Modal */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadUsers}
        userToEdit={editingUser}
      />
    </div>
  );
};

export default UserManagement;
