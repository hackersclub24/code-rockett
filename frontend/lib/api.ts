import axios from "axios";
import { auth } from "./firebase";

const runtimeApiBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : "http://localhost:8000/api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || runtimeApiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Firebase Auth Token to requests
api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
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
