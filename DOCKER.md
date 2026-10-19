# 🛡️ ShieldEscrow — Docker Production Guide

## Quick Start (single command)

```bash
# 1. Copy the env template
cp .env.example .env

# 2. (Optional) Edit .env to set real passwords
#    The defaults will work for a local test.

# 3. Build images and spin up all 3 services
docker compose up -d --build

# 4. Open the app
#    Frontend  →  http://localhost
#    Backend   →  http://localhost:8080/api/escrows
```

---

## Service Map

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| `db` | `shield_db` | internal only (3306 in dev) | MariaDB 11 — persistent named volume |
| `backend` | `shield_backend` | 8080 | Spring Boot REST API |
| `frontend` | `shield_frontend` | **80** | Nginx serving React + proxying `/api/*` → backend |

> **In production** you'd put a real TLS termination proxy (Caddy/Traefik) in front of port 80.

---

## Useful Commands

```bash
# Live logs from all services
docker compose logs -f

# Logs from only the backend
docker compose logs -f backend

# Rebuild a single service after code change
docker compose up -d --build backend

# Stop everything (keeps DB volume)
docker compose down

# Stop and WIPE the database volume (full reset)
docker compose down -v

# Shell into the running backend container
docker exec -it shield_backend sh

# Shell into MariaDB
docker exec -it shield_db mariadb -u shielduser -pShield@1234 shieldescrow
```

---

## How the Startup Order Works

```
db ─(healthy?)─► backend ─(healthy?)─► frontend
```

- **`db`** must pass its MariaDB health check before `backend` starts.
- **`backend`** must pass `/actuator/health` before `frontend` starts.
- This prevents "connection refused" errors on first boot.

---

## Environment Variables

All secrets live in `.env` (gitignored). See `.env.example` for a full list:

| Variable | Used by | Default |
|----------|---------|---------|
| `DB_ROOT_PASSWORD` | `db` | `rootSecret123` |
| `DB_NAME` | `db`, `backend` | `shieldescrow` |
| `DB_USER` | `db`, `backend` | `shielduser` |
| `DB_PASSWORD` | `db`, `backend` | `Shield@1234` |

---

## Local Dev (without Docker)

```bash
# Backend (needs local MariaDB running)
cd trustpay
./mvnw spring-boot:run

# Frontend
cd frontend
npm run dev        # → http://localhost:5173
```
