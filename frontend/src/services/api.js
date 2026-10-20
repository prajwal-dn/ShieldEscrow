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

export default api;