import axios from "axios";

// In production (Nginx on port 80): requests go to /api/* → Nginx proxies to backend:8080
// In local dev (Vite on port 5173): Vite proxy handles it (see vite.config.js)
const api = axios.create({
  baseURL: "",
});

export default api;