// API Service Layer for Frontend-Backend Communication
import axios from "axios";
import { mockAPI } from "./mockData";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // 5 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API calls with fallback to mock data
const apiCall = async (apiFunction, mockFunction) => {
  try {
    return await apiFunction();
  } catch (error) {
    console.warn("API call failed, using mock data:", error.message);
    return await mockFunction();
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.get("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgotpassword", { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/resetpassword/${token}`, { password }),
  updateDetails: (userData) => api.put("/auth/updatedetails", userData),
  updatePassword: (passwords) => api.put("/auth/updatepassword", passwords),
};

// Services API
export const servicesAPI = {
  getAll: (params = {}) =>
    apiCall(
      () => api.get("/services", { params }),
      () => mockAPI.services.getAll()
    ),
  getById: (id) =>
    apiCall(
      () => api.get(`/services/${id}`),
      () => mockAPI.services.getById(id)
    ),
  create: (serviceData) => api.post("/services", serviceData),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`),
  getByCategory: (category) => api.get(`/services/category/${category}`),
  getCategories: () => api.get("/services/categories/list"),
  getFeatured: () => api.get("/services/featured/list"),
  search: (query) => api.get(`/services/search?q=${query}`),
};

// Projects API
export const projectsAPI = {
  getAll: (params = {}) =>
    apiCall(
      () => api.get("/projects", { params }),
      () => mockAPI.projects.getAll()
    ),
  getById: (id) =>
    apiCall(
      () => api.get(`/projects/${id}`),
      () => mockAPI.projects.getById(id)
    ),
  create: (projectData) => api.post("/projects", projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  getByService: (serviceId) => api.get(`/projects/service/${serviceId}`),
  getFeatured: () => api.get("/projects/featured/list"),
  search: (query) => api.get(`/projects/search?q=${query}`),
};

// Blog API
export const blogAPI = {
  getAll: (params = {}) =>
    apiCall(
      () => api.get("/blog", { params }),
      () => mockAPI.blogs.getAll()
    ),
  getById: (id) =>
    apiCall(
      () => api.get(`/blog/${id}`),
      () => mockAPI.blogs.getById(id)
    ),
  create: (postData) => api.post("/blog", postData),
  update: (id, postData) => api.put(`/blog/${id}`, postData),
  delete: (id) => api.delete(`/blog/${id}`),
  getByCategory: (category) => api.get(`/blog/category/${category}`),
  getCategories: () => api.get("/blog/categories/list"),
  getTags: () => api.get("/blog/tags/list"),
  getFeatured: () => api.get("/blog/featured/list"),
  search: (query) => api.get(`/blog/search?q=${query}`),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post("/bookings", bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/bookings/${id}`),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getByService: (serviceId) => api.get(`/bookings/service/${serviceId}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

// Reviews API
export const reviewsAPI = {
  getAll: (params = {}) =>
    apiCall(
      () => api.get("/reviews", { params }),
      () => mockAPI.reviews.getAll()
    ),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (reviewData) => api.post("/reviews", reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  getByService: (serviceId) => api.get(`/reviews/service/${serviceId}`),
  getByUser: (userId) => api.get(`/reviews/user/${userId}`),
  getFeatured: () => api.get("/reviews/featured/list"),
};

// Contact API
export const contactAPI = {
  sendMessage: (messageData) => api.post("/contact", messageData),
  getAll: (params = {}) => api.get("/contact", { params }),
  getById: (id) => api.get(`/contact/${id}`),
  updateStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) =>
    api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadMultiple: (formData) =>
    api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteImage: (publicId) => api.delete(`/upload/image/${publicId}`),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: (params = {}) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};

export default api;
