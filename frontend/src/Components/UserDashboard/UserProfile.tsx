import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  // Get user from local storage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);

  const { register: registerInfo, handleSubmit: submitInfo } = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone
    }
  });

  const { register: registerPass, handleSubmit: submitPass, reset: resetPass } = useForm();

  const onUpdateInfo = async (data: any) => {
    try {
      setLoading(true);
      const res = await authAPI.updateDetails(data);
      // Update local storage
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setLoading(true);
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully');
      resetPass();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Update Info Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
        <form onSubmit={submitInfo(onUpdateInfo)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input {...registerInfo('firstName')} className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input {...registerInfo('lastName')} className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input {...registerInfo('phone')} className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-500" />
          </div>
          <div className="opacity-50">
            <label className="block text-sm font-medium text-gray-700">Email (Cannot be changed)</label>
            <input value={user.email} disabled className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 cursor-pointer">
            Update Profile
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={submitPass(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input type="password" {...registerPass('currentPassword', { required: true })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" {...registerPass('newPassword', { required: true, minLength: 6 })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input type="password" {...registerPass('confirmPassword', { required: true })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-500" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 cursor-pointer">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;