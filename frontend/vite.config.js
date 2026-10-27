import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function apiRoutesPlugin() {
  return {
    name: "shield-api-routes",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api")) return next();

        // Enhance res with status and json helpers
        res.status = function (code) {
          this.statusCode = code;
          return this;
        };
        res.json = function (data) {
          this.setHeader("Content-Type", "application/json");
          this.end(JSON.stringify(data));
          return this;
        };

        // Parse query params into req.query
        const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        req.query = Object.fromEntries(parsedUrl.searchParams.entries());

        // Parse raw body
        let rawBody = "";
        for await (const chunk of req) {
          rawBody += chunk;
        }
        try {
          req.body = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          req.body = {};
        }

        try {
          const mod = await import("./api/index.js");
          return await mod.default(req, res);
        } catch (err) {
          console.error(`[API Handler Error]:`, err);
          return res.status(500).json({ error: err.message });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiRoutesPlugin(),
  ],
  define: {
    global: "globalThis",
  },
});