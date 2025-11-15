// API Service Layer for Frontend-Backend Communication
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we are NOT already on the login page
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- API DEFINITIONS ---

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
  updateDetails: (userData) => api.put("/auth/me", userData), // Fixed path
  changePassword: (passwords) => api.put("/auth/change-password", passwords), // Fixed path
  logout: () => api.post("/auth/logout"), // Changed to POST
};

// Services API
export const servicesAPI = {
  getAll: (params) => api.get("/services", { params }),
  getById: (id) => api.get(`/services/${id}`),
  getCategories: () => api.get("/services/categories/list"),
  // Admin Only
  create: (formData) =>
    api.post("/services", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/services/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/services/${id}`),
  deleteImage: (id, imageId) => api.delete(`/services/${id}/images/${imageId}`),
};

// Blog API
export const blogAPI = {
  getAll: (params) => api.get("/blog", { params }),
  getById: (id) => api.get(`/blog/${id}`),
  getBySlug: (slug) => api.get(`/blog/slug/${slug}`),
  getCategories: () => api.get("/blog/categories/list"),
  getTags: () => api.get("/blog/tags/list"),
  getFeatured: () => api.get("/blog/featured/list"),
  // Admin Only
  create: (formData) =>
    api.post("/blog", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/blog/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/blog/${id}`),
  updateStatus: (id, status) => api.put(`/blog/${id}/status`, { status }),
  deleteImage: (id, imageId) => api.delete(`/blog/${id}/images/${imageId}`),
};

// Bookings API
export const bookingsAPI = {
  // Public/User
  create: (bookingData) => api.post("/bookings", bookingData),
  getMyBookings: (params) => api.get("/bookings/my-bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getAvailableSlots: (date) =>
    api.get(`/bookings/available-slots?date=${date}`),

  // Admin Only
  getAll: (params) => api.get("/bookings", { params }),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  assignTechnician: (id, technicianId) =>
    api.put(`/bookings/${id}/assign`, { technician: technicianId }),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// Contact API
export const contactAPI = {
  sendMessage: (data) => api.post("/contact", data),
  // Admin Only
  getAll: (params) => api.get("/contact", { params }),
  getById: (id) => api.get(`/contact/${id}`),
  updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
  resolve: (id) => api.put(`/contact/${id}/resolve`),
  close: (id) => api.put(`/contact/${id}/close`),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Users API (Admin Only)
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }), // Uses routes/users.js
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleActive: (id, isActive) =>
    api.put(`/users/${id}/${isActive ? "activate" : "deactivate"}`),
  getTechnicians: () => api.get("/users/technicians/list"),
};

// Admin Stats API
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
};

export default api;
