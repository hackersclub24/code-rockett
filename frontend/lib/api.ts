import axios from "axios";
import { auth } from "./firebase";

const runtimeApiBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : "http://localhost:8000/api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || runtimeApiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add retry interceptor for timeout/network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry logic: only retry for timeouts and network errors, not auth/client errors
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    config.retry += 1;
    
    if (
      (error.code === 'ECONNABORTED' || !error.response) &&
      config.retry <= 2
    ) {
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * config.retry));
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

// Interceptor to add Firebase Auth Token to requests
api.interceptors.request.use(
  async (config) => {
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
