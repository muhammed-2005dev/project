import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faWrench, 
  faCalendar, 
  faStar, 
  faCog, 
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faUsers,
  faEnvelope,
  faDollarSign,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { adminApiService } from '../../services/adminApi';
import ServiceManagement from './ServiceManagement';
import UserManagement from './UserManagement';
import BookingManagement from './BookingManagement';
import toast from 'react-hot-toast';

interface DashboardStats {
  overview: {
    totalServices: number;
    activeServices: number;
    totalBlogs: number;
    publishedBlogs: number;
    totalBookings: number;
    pendingBookings: number;
    totalReviews: number;
    totalContacts: number;
    totalUsers: number;
    totalProjects: number;
  };
  monthly: {
    bookings: number;
    revenue: number;
    contacts: number;
  };
  recent: {
    bookings: any[];
    contacts: any[];
    services: any[];
    blogs: any[];
  };
}

const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, usersResponse, bookingsResponse, contactsResponse, servicesResponse, blogsResponse] = await Promise.all([
        adminApiService.getDashboardStats(),
        adminApiService.getUsers({ limit: 5 }),
        adminApiService.getBookings({ limit: 5 }),
        adminApiService.getContacts({ limit: 5 }),
        adminApiService.getServices({ limit: 5 }),
        adminApiService.getBlogs({ limit: 5 })
      ]);

      setDashboardStats(statsResponse.data.data);
      setUsers(usersResponse.data.data.users);
      setBookings(bookingsResponse.data.data.bookings);
      setContacts(contactsResponse.data.data.contacts);
      setServices(servicesResponse.data.data.services);
      setBlogs(blogsResponse.data.data.posts);
      
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', label: t('dashboard.overview'), icon: faChartBar },
    { id: 'users', label: t('dashboard.users'), icon: faUsers },
    { id: 'services', label: t('dashboard.services'), icon: faWrench },
    { id: 'bookings', label: t('dashboard.bookings'), icon: faCalendar },
    { id: 'contacts', label: t('dashboard.contacts'), icon: faEnvelope },
    { id: 'blogs', label: t('dashboard.blogs'), icon: faStar },
    { id: 'settings', label: t('dashboard.settings'), icon: faCog }
  ];

  const renderOverview = () => {
    if (!dashboardStats) return null;

    const stats = [
      { 
        icon: faWrench, 
        label: isRTL ? 'إجمالي الخدمات' : 'Total Services', 
        value: dashboardStats.overview.totalServices, 
        color: 'bg-blue-500' 
      },
      { 
        icon: faCalendar, 
        label: isRTL ? 'الحجوزات' : 'Total Bookings', 
        value: dashboardStats.overview.totalBookings, 
        color: 'bg-green-500' 
      },
      { 
        icon: faUsers, 
        label: isRTL ? 'المستخدمين' : 'Total Users', 
        value: dashboardStats.overview.totalUsers, 
        color: 'bg-purple-500' 
      },
      { 
        icon: faDollarSign, 
        label: isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue', 
        value: `$${dashboardStats.monthly.revenue}`, 
        color: 'bg-yellow-500' 
      }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <FontAwesomeIcon icon={stat.icon} className="text-white text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isRTL ? 'الحجوزات الأخيرة' : 'Recent Bookings'}
            </h3>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.user?.firstName} {booking.user?.lastName}</p>
                    <p className="text-sm text-gray-600">{booking.service?.name || 'Service'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Contacts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isRTL ? 'الرسائل الأخيرة' : 'Recent Contacts'}
            </h3>
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    contact.status === 'new' ? 'bg-red-100 text-red-800' :
                    contact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {contact.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => <UserManagement />;

  const renderServices = () => <ServiceManagement />;

  const renderBookings = () => <BookingManagement />;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'services':
        return renderServices();
      case 'bookings':
        return renderBookings();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-yellow-500 animate-spin mb-4" />
          <p className="text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">
              {isRTL ? 'لوحة التحكم' : 'Admin Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {isRTL ? 'مرحباً' : 'Welcome'}, Admin
              </span>
              <button 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                      activeTab === tab.id
                        ? 'bg-yellow-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
