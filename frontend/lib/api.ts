import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { clearAccessToken, getAccessToken, setAccessToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

async function refreshAccess(): Promise<string | null> {
  const res = await axios.post<{ access_token: string }>(
    `${baseURL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const token = res.data.access_token;
  setAccessToken(token);
  return token;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/refresh")) {
      original._retry = true;
      try {
        refreshing ??= refreshAccess();
        const token = await refreshing;
        refreshing = null;
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        refreshing = null;
        clearAccessToken();
      }
    }
    return Promise.reject(error);
  }
);

export { baseURL };
