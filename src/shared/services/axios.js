import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor: attach JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: always return response.data
instance.interceptors.response.use(
  (response) => {
    console.log('>>>>>RESPONSE TU API<<<<<:', response);
    return response.data;
  },
  (error) => {
    // Centralized error logging
    console.error('++++++RESPONSE ERROR TU API++++++:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message
    });
    
    // Auto redirect on 401 (token expired)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login/register
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    
    // Extract user-friendly error message
    let userMessage = "Lỗi kết nối đến server";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle specific error messages
      if (errorData.message) {
        userMessage = errorData.message;
      } else if (errorData.error) {
        userMessage = errorData.error;
      }
      
      // Handle field validation errors
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = errorData.errors
          .map(e => e.field ? `${e.field}: ${e.message}` : e.message)
          .join(', ');
        userMessage = `Validation Error: ${fieldErrors}`;
      }
      
      // Handle specific status codes
      switch (error.response.status) {
        case 400:
          if (userMessage.includes('waypoints')) {
            userMessage = "Lỗi waypoints: " + userMessage;
          } else if (userMessage.includes('drone')) {
            userMessage = "Lỗi drone: " + userMessage;
          } else if (userMessage.includes('altitude')) {
            userMessage = "Lỗi độ cao: " + userMessage;
          } else {
            userMessage = "Dữ liệu không hợp lệ: " + userMessage;
          }
          break;
        case 403:
          userMessage = "Không có quyền thực hiện thao tác này!";
          break;
        case 404:
          userMessage = "Không tìm thấy dữ liệu!";
          break;
        case 409:
          userMessage = "Xung đột dữ liệu: " + userMessage;
          break;
        case 500:
          userMessage = "Lỗi server. Vui lòng thử lại sau!";
          break;
      }
    } else if (error.code === 'ECONNABORTED') {
      userMessage = "Timeout - Server không phản hồi!";
    } else if (error.message) {
      userMessage = error.message;
    }
    
    // Create enhanced error object with user-friendly message
    const enhancedError = {
      ...error.response?.data,
      message: userMessage,
      originalError: error,
      status: error.response?.status
    };
    
    return Promise.reject(enhancedError);
  },
);

export default instance;
