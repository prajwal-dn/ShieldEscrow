import axios from "axios";

// When deployed on Vercel: "" routes to Vercel Serverless /api/* (permanent & same-origin)
// In Docker (Nginx proxy):  "" routes to Nginx proxy
// In local dev (Vite):      "" routes to Vite dev proxy
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.includes("b4a.run")) {
    return "";
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

export default api;