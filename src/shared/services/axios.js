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
    // Auto redirect on 401 (token expired)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login/register
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error.response?.data || error);
  },
);

export default instance;
