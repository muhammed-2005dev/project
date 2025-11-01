import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye, 
  faSpinner,
  faSearch,
  faUserShield,
  faUser,
  faEnvelope,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { adminApiService } from '../../services/adminApi';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getUsers({ 
        page: currentPage, 
        limit: 10,
        role: roleFilter || undefined
      });
      setUsers(response.data.data.users);
      setTotalPages(response.data.pages);
    } catch (error: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminApiService.updateUserRole(userId, newRole);
      toast.success(isRTL ? 'تم تحديث دور المستخدم' : 'User role updated successfully');
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          {isRTL ? 'إدارة المستخدمين' : 'Users Management'}
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {isRTL ? 'إضافة مستخدم' : 'Add User'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في المستخدمين...' : 'Search users...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
            <option value="user">{isRTL ? 'مستخدم' : 'User'}</option>
            <option value="admin">{isRTL ? 'مدير' : 'Admin'}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'المستخدم' : 'User'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الدور' : 'Role'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الحالة' : 'Status'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-white" />
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
                      icon={user.role === 'admin' ? faUserShield : faUser} 
                      className={user.role === 'admin' ? 'text-purple-500' : 'text-blue-500'}
                    />
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? (isRTL ? 'مدير' : 'Admin') : (isRTL ? 'مستخدم' : 'User')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-800"
                      title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="text-green-600 hover:text-green-800"
                      title={isRTL ? 'تعديل' : 'Edit'}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="user">{isRTL ? 'مستخدم' : 'User'}</option>
                      <option value="admin">{isRTL ? 'مدير' : 'Admin'}</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isRTL ? 'لا توجد مستخدمين' : 'No users found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
