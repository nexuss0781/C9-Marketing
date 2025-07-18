import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not set in your environment variables.");
}

const api = axios.create({ baseURL });

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: any) => Promise.reject(error));

export default api;
