import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function apiRoutesPlugin() {
  return {
    name: "shield-api-routes",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api")) return next();

        const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const pathname = parsedUrl.pathname.replace(/\/$/, "");

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

        async function invokeModule(mod) {
          if (typeof mod.default === "function") {
            return await mod.default(req, res);
          }
          const methodFn = mod[req.method];
          if (typeof methodFn === "function") {
            const webReq = {
              json: async () => JSON.parse(rawBody || "{}"),
              headers: new Headers(req.headers),
            };
            const webRes = await methodFn(webReq);
            res.statusCode = webRes.status;
            for (const [k, v] of webRes.headers.entries()) {
              res.setHeader(k, v);
            }
            const resBody = await webRes.text();
            return res.end(resBody);
          }
          throw new Error("No handler found in module");
        }

        try {
          if (pathname === "/api/auth/register") {
            const mod = await import("./api/auth/register.js");
            return await invokeModule(mod);
          }
          if (pathname === "/api/auth/login") {
            const mod = await import("./api/auth/login.js");
            return await invokeModule(mod);
          }
          if (pathname === "/api/escrows/join") {
            const mod = await import("./api/escrows/join.js");
            return await invokeModule(mod);
          }
          if (pathname === "/api/escrows") {
            const mod = await import("./api/escrows/index.js");
            return await invokeModule(mod);
          }

          // Escrow ID subroutes
          const idMatch = pathname.match(/^\/api\/escrows\/([^\/]+)(?:\/([^\/]+))?$/);
          if (idMatch) {
            req.query.id = idMatch[1];
            const action = idMatch[2];

            if (!action) {
              const mod = await import("./api/escrows/[id]/index.js");
              return await invokeModule(mod);
            }
            if (action === "verify-delivery") {
              const mod = await import("./api/escrows/[id]/verify-delivery.js");
              return await invokeModule(mod);
            }
            if (action === "approve") {
              const mod = await import("./api/escrows/[id]/approve.js");
              return await invokeModule(mod);
            }
            if (action === "complete") {
              const mod = await import("./api/escrows/[id]/complete.js");
              return await invokeModule(mod);
            }
            if (action === "dispute") {
              const mod = await import("./api/escrows/[id]/dispute.js");
              return await invokeModule(mod);
            }
            if (action === "resolve-dispute") {
              const mod = await import("./api/escrows/[id]/resolve-dispute.js");
              return await invokeModule(mod);
            }
            if (action === "events") {
              const mod = await import("./api/escrows/[id]/events.js");
              return await invokeModule(mod);
            }
            if (action === "sync-onchain") {
              const mod = await import("./api/escrows/[id]/sync-onchain.js");
              return await invokeModule(mod);
            }
          }

          return res.status(404).json({ error: `API route ${pathname} not found` });
        } catch (err) {
          console.error(`[API Handler Error] ${pathname}:`, err);
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