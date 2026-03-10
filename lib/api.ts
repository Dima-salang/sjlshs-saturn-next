import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - handle login redirect if needed
      console.warn("Unauthorized access detected");
    }

    if (error.response?.status === 419) {
      // CSRF Token mismatch - session might have expired
      console.error("Session/CSRF expired");
      // Option: refresh CSRF cookie and retry the request
    }

    return Promise.reject(error);
  },
);

export const getCsrfToken = async () => {
  await api.get("/sanctum/csrf-cookie");
};

export default api;
