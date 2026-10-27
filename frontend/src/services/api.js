import axios from "axios";

// Production (Vercel Serverless) / Docker proxy / local Vite proxy:
// Default to "" to route requests to same-origin /api/*
// Set VITE_API_URL only if pointing to an external dedicated backend service
const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || "";
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Automatically inject JWT authentication token on all requests
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("shield_escrow_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("[API] Could not attach auth token:", err);
  }
  return config;
});

export default api;