import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin Dashboard API
export const adminApiService = {
  // Get dashboard statistics
  getDashboardStats: () => adminApi.get('/admin/dashboard'),
  
  // Users management
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    adminApi.get('/admin/users', { params }),
  
  getUserById: (id: string) => adminApi.get(`/admin/users/${id}`),
  
  updateUserRole: (id: string, role: string) =>
    adminApi.put(`/admin/users/${id}/role`, { role }),
  
  // Bookings management
  getBookings: (params?: { page?: number; limit?: number; status?: string; dateFrom?: string; dateTo?: string }) =>
    adminApi.get('/admin/bookings', { params }),
  
  updateBookingStatus: (id: string, status: string) =>
    adminApi.put(`/admin/bookings/${id}/status`, { status }),
  
  // Contacts management
  getContacts: (params?: { page?: number; limit?: number; status?: string }) =>
    adminApi.get('/admin/contacts', { params }),
  
  updateContactStatus: (id: string, status: string) =>
    adminApi.put(`/admin/contacts/${id}/status`, { status }),
  
  // Analytics
  getAnalytics: (period?: string) =>
    adminApi.get('/admin/analytics', { params: { period } }),
  
  // System health
  getSystemHealth: () => adminApi.get('/admin/health'),
  
  // Services management
  getServices: (params?: { page?: number; limit?: number; category?: string; featured?: boolean; active?: boolean }) =>
    adminApi.get('/services', { params }),
  
  createService: (serviceData: any) => adminApi.post('/services', serviceData),
  
  updateService: (id: string, serviceData: any) => adminApi.put(`/services/${id}`, serviceData),
  
  deleteService: (id: string) => adminApi.delete(`/services/${id}`),
  
  // Blog management
  getBlogs: (params?: { page?: number; limit?: number; category?: string; featured?: boolean; search?: string }) =>
    adminApi.get('/blog', { params }),
  
  createBlog: (blogData: any) => adminApi.post('/blog', blogData),
  
  updateBlog: (id: string, blogData: any) => adminApi.put(`/blog/${id}`, blogData),
  
  deleteBlog: (id: string) => adminApi.delete(`/blog/${id}`),
  
  updateBlogStatus: (id: string, status: string) =>
    adminApi.put(`/blog/${id}/status`, { status }),
  
  // Reviews management
  getReviews: (params?: { page?: number; limit?: number; rating?: number }) =>
    adminApi.get('/reviews', { params }),
  
  updateReviewStatus: (id: string, status: string) =>
    adminApi.put(`/reviews/${id}/status`, { status }),
  
  deleteReview: (id: string) => adminApi.delete(`/reviews/${id}`),
  
  // Projects management
  getProjects: (params?: { page?: number; limit?: number; status?: string }) =>
    adminApi.get('/projects', { params }),
  
  createProject: (projectData: any) => adminApi.post('/projects', projectData),
  
  updateProject: (id: string, projectData: any) => adminApi.put(`/projects/${id}`, projectData),
  
  deleteProject: (id: string) => adminApi.delete(`/projects/${id}`),
};

export default adminApi;
