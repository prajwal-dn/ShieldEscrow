// Single master API router for Vercel Serverless Function & local development
import { applyCors } from "./_auth.js";
import handleRegister from "./_handlers/auth/register.js";
import handleLogin from "./_handlers/auth/login.js";
import handleMe from "./_handlers/auth/me.js";
import handleEscrowsList from "./_handlers/escrows/index.js";
import handleEscrowJoin from "./_handlers/escrows/join.js";
import handleEscrowGet from "./_handlers/escrows/id-index.js";
import handleVerifyDelivery from "./_handlers/escrows/verify-delivery.js";
import handleApprove from "./_handlers/escrows/approve.js";
import handleComplete from "./_handlers/escrows/complete.js";
import handleDispute from "./_handlers/escrows/dispute.js";
import handleResolveDispute from "./_handlers/escrows/resolve-dispute.js";
import handleEvents from "./_handlers/escrows/events.js";
import handleSyncOnchain from "./_handlers/escrows/sync-onchain.js";

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Parse path from URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "");

  // Attach parsed query parameters
  req.query = req.query || Object.fromEntries(parsedUrl.searchParams.entries());

  try {
    // Health Check
    if (pathname === "/api/health" || pathname === "/api") {
      return res.status(200).json({ status: "UP", service: "ShieldEscrow Unified Serverless API" });
    }

    // Auth Routes
    if (pathname === "/api/auth/register") {
      return await handleRegister(req, res);
    }
    if (pathname === "/api/auth/login") {
      return await handleLogin(req, res);
    }
    if (pathname === "/api/auth/me") {
      return await handleMe(req, res);
    }

    // Escrow Collection & Join
    if (pathname === "/api/escrows/join") {
      return await handleEscrowJoin(req, res);
    }
    if (pathname === "/api/escrows") {
      return await handleEscrowsList(req, res);
    }

    // Escrow ID Dynamic Subroutes: /api/escrows/:id or /api/escrows/:id/:action
    const match = pathname.match(/^\/api\/escrows\/([^\/]+)(?:\/([^\/]+))?$/);
    if (match) {
      req.query.id = match[1];
      const action = match[2];

      if (!action) {
        return await handleEscrowGet(req, res);
      }
      if (action === "verify-delivery") {
        return await handleVerifyDelivery(req, res);
      }
      if (action === "approve") {
        return await handleApprove(req, res);
      }
      if (action === "complete") {
        return await handleComplete(req, res);
      }
      if (action === "dispute") {
        return await handleDispute(req, res);
      }
      if (action === "resolve-dispute") {
        return await handleResolveDispute(req, res);
      }
      if (action === "events") {
        return await handleEvents(req, res);
      }
      if (action === "sync-onchain") {
        return await handleSyncOnchain(req, res);
      }
    }

    return res.status(404).json({ error: `API route ${pathname} not found` });
  } catch (err) {
    console.error(`[API Router Error] ${pathname}:`, err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
