import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { usersAPI } from "../../services/api";
import toast from "react-hot-toast";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: any;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    isActive: true,
  });

  // Reset or Populate form
  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          firstName: userToEdit.firstName,
          lastName: userToEdit.lastName,
          email: userToEdit.email,
          phone: userToEdit.phone || "",
          password: "", // Don't fill password on edit for security
          role: userToEdit.role,
          isActive: userToEdit.isActive,
        });
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          role: "user",
          isActive: true,
        });
      }
    }
  }, [isOpen, userToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data (remove empty password if editing so we don't overwrite it with "")
      const dataToSend: any = { ...formData };
      if (userToEdit && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (userToEdit) {
        await usersAPI.update(userToEdit._id, dataToSend);
        toast.success("User updated successfully");
      } else {
        await usersAPI.create(dataToSend);
        toast.success("User created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {userToEdit ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 cursor-pointer"
              >
                <option value="user">User</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center h-full pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Account
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {userToEdit
                ? "New Password (leave blank to keep current)"
                : "Password"}
            </label>
            <input
              type="password"
              name="password"
              // Password is required only when creating a NEW user
              required={!userToEdit}
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading && (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            )}
            {userToEdit ? "Update User" : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
