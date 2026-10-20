import axios from "axios";

// In production on Vercel: VITE_API_URL = https://your-app.koyeb.app
// In Docker (Nginx proxy):  VITE_API_URL = "" → Nginx proxies /api/* to backend:8080
// In local dev (Vite):      VITE_API_URL = "" → Vite proxy handles it (see vite.config.js)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export default api;