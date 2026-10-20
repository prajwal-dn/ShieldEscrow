<div align="center">

# 🛡️ ShieldEscrow

### Enterprise-Grade, Privacy-First Decentralized Escrow Platform

**Trustless peer-to-peer settlement powered by Midnight Zero-Knowledge Smart Contracts.**

[![Live Application](https://img.shields.io/badge/Live_Deployment-shield--escrow.vercel.app-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://shield-escrow.vercel.app/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Database](https://img.shields.io/badge/Database-MySQL_/_MariaDB-003545?style=for-the-badge&logo=mysql&logoColor=white)](https://mariadb.org/)
[![Midnight](https://img.shields.io/badge/Blockchain-Midnight_Network-7C3AED?style=for-the-badge)](https://midnight.network/)
[![Docker](https://img.shields.io/badge/Containers-Docker_Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**🌐 Production Deployment:** [https://shield-escrow.vercel.app](https://shield-escrow.vercel.app/)

</div>

---

## 📌 Executive Summary

**ShieldEscrow** is a decentralized escrow protocol engineered to eliminate counterparty risk and intermediaries in peer-to-peer commerce and service agreements. 

Traditional payment systems rely on expensive third-party arbiters, centralized custody, and opaque processes. ShieldEscrow replaces centralized custody with **Midnight Zero-Knowledge smart contracts**, guaranteeing that capital remains cryptographically locked until mutually agreed deliverables are fulfilled. Built-in multi-stage state transitions, dispute arbitration, and immutable audit logs deliver non-repudiation and commercial privacy.

---

## 🏛️ System Architecture

ShieldEscrow employs a hybrid on-chain / off-chain architecture designed for sub-second user responsiveness and zero-knowledge on-chain finality:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Presentation Tier                        │
│   React 19 SPA • Tailwind CSS v4 • CIP-30 / Midnight DApp Connector    │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼ (REST / JSON)                   ▼ (ZK Proofs / RPC)
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│          API & Gateway Tier          │  │       Blockchain Tier        │
│  • Vercel Edge Serverless Functions  │  │  • Midnight Preprod Network  │
│  • Spring Boot 3.3 Microservice      │  │  • Compact Smart Contracts   │
│  • WebSocket STOMP Event Broker      │  │  • ZK Proof Server (Port 6300│
└──────────────────┬───────────────────┘  └──────────────┬───────────────┘
                   │                                     │
                   ▼ (Persistent Storage)                ▼ (State Records)
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│           Persistence Tier           │  │      On-Chain Ledgers        │
│  • Aiven Managed MySQL / MariaDB 11  │  │  • escrows: Map<ID, Escrow>  │
│  • Immutable `escrow_events` Audit   │  │  • nextEscrowId: Uint<32>    │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Core Architecture Components:

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | High-performance user interface, real-time counters, responsive dashboard |
| **Wallet Connector** | CIP-30 & Midnight DApp API | Auto-discovers Lace, Nightly, Eternl, Nami, Flint with dev-mode failover |
| **Serverless API** | Vercel Edge Serverless Functions | Global edge-cached REST endpoints connecting directly to cloud persistence |
| **Enterprise API** | Java 21, Spring Boot 3.3, JPA | High-throughput backend with WebSocket broadcasting and email alerting |
| **Persistence** | Aiven Cloud MySQL / MariaDB 11 | Relational state machine storage with automated schema synchronization |
| **Smart Contract** | Midnight Compact (v0.23+) | Zero-knowledge cryptographic escrow lock, release, dispute, and refund |

---

## 🔄 Escrow State Machine & Lifecycle Flow

Every escrow follows a deterministic, tamper-resistant finite state machine:

```
            ┌─────────────────────────────────────────┐
            │                 CREATED                 │
            │  Buyer deposits funds into escrow lock  │
            └────────────────────┬────────────────────┘
                                 │
                                 ▼
            ┌─────────────────────────────────────────┐
            │             WORK COMPLETED              │
            │     Seller delivers agreed services     │
            └────────────┬───────────────────────┬────┘
                         │                       │
      [Buyer Approves]   │                       │  [Disagreement]
                         ▼                       ▼
            ┌──────────────────────┐   ┌──────────────────────┐
            │       RELEASED       │   │       DISPUTED       │
            │ Funds paid to Seller │   │ Escrow locked/frozen │
            └──────────────────────┘   └──────────┬───────────┘
                                                  │
                                        [Arbitration Decision]
                                                  │
                                 ┌────────────────┴────────────────┐
                                 ▼                                 ▼
                      ┌──────────────────────┐          ┌──────────────────────┐
                      │   RESOLVED: RELEASE  │          │   RESOLVED: REFUND   │
                      │  Settled to Seller   │          │  Returned to Buyer   │
                      └──────────────────────┘          └──────────────────────┘
```

---

## ⚡ Key Capabilities

### 🛡️ Cryptographic Trust & Privacy
- **Zero-Knowledge Execution:** Powered by Midnight Compact smart contracts ensuring on-chain verification without leaking private business metadata.
- **Atomic Settlement:** Funds cannot be siphoned or redirected; release is governed strictly by cryptographic authorization.

### 👛 Universal Wallet Interoperability
- **Native Extension Detection:** Automatic discovery of injected browser providers (`window.midnight` and `window.cardano`).
- **Supported Wallets:** Lace, Nightly, Eternl, Nami, Flint, and Typhon.
- **Graceful Sandbox Mode:** Automatic sandbox wallet provider enabling seamless testing in environments without browser extensions.

### ⚖️ Dispute Resolution & Arbitration
- **One-Click Freeze:** Disputed agreements immediately transition to `DISPUTED`, locking the funds against unilateral withdrawals.
- **Bilateral Arbitration:** Support for structured resolution pathways: awarding payment to the provider or remitting a full refund to the buyer.

### 📜 Immutable Audit Trails
- **Event Journal:** Every status change, signature, and approval creates an unalterable `EscrowEvent` timestamped with the actor address.
- **On-Chain Synchronization:** Ability to link on-chain transaction hashes directly to the corresponding database record.

---

## 🔌 REST API Specification

The platform exposes unified REST endpoints available across both the serverless cloud edge and Spring Boot deployments:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/escrows` | Retrieve list of all escrows |
| `POST` | `/api/escrows` | Initialize and fund a new escrow agreement |
| `GET` | `/api/escrows/{id}` | Retrieve comprehensive escrow details by ID |
| `POST` | `/api/escrows/{id}/complete` | Mark work as delivered by seller |
| `POST` | `/api/escrows/{id}/approve` | Release locked funds to seller |
| `POST` | `/api/escrows/{id}/dispute` | Initiate dispute and freeze escrow |
| `POST` | `/api/escrows/{id}/resolve-dispute` | Arbitrate dispute (`RELEASE` to seller or `REFUND` to buyer) |
| `GET` | `/api/escrows/{id}/events` | Retrieve complete audit trail for compliance verification |
| `POST` | `/api/escrows/{id}/sync-onchain` | Associate on-chain transaction hash with escrow record |

---

## ⛓️ Smart Contract Circuits (`escrow.compact`)

The Midnight Compact contract implements four state circuits:

```compact
struct Escrow {
    buyer:       Opaque<"string">;
    seller:      Opaque<"string">;
    amount:      Opaque<"string">;
    description: Opaque<"string">;
    status:      Uint<8>; // 0: CREATED, 1: COMPLETED, 2: RELEASED, 3: DISPUTED, 4: REFUNDED
}
```

| Circuit | Inputs | State Transition | Description |
|---|---|---|---|
| `createEscrow` | `buyer, seller, amount, description` | `→ 0 (CREATED)` | Allocates auto-increment ID, records deposit |
| `getStatus` | `escrowId` | Read-only | Returns current byte state of the escrow |
| `releaseEscrow` | `escrowId` | `→ 2 (RELEASED)` | Validates authorization and releases funds |
| `disputeEscrow` | `escrowId` | `→ 3 (DISPUTED)` | Locks funds pending arbitrator determination |
| `refundEscrow` | `escrowId` | `→ 4 (REFUNDED)` | Remits full escrow balance back to buyer |

---

## 📁 Repository Structure

```
ShieldEscrow/
│
├── frontend/                  # Modern React 19 Single-Page Application
│   ├── api/                   # Production Serverless API routes (Edge MySQL connection)
│   ├── src/
│   │   ├── components/        # Navbar, EscrowCard, WalletPickerModal, ActivityTimeline, Toast
│   │   ├── pages/             # Dashboard, CreateEscrow, EscrowDetails, Landing
│   │   ├── context/           # WalletContext provider with CIP-30 extension detection
│   │   ├── services/          # Unified Axios client & transaction signing protocol
│   │   └── hooks/             # WebSocket notification hooks
│   ├── Dockerfile             # Multi-stage production Nginx image
│   ├── vercel.json            # Edge routing and SPA rewrite rules
│   └── nginx.conf             # Production reverse proxy configuration
│
├── trustpay/                  # Enterprise Spring Boot Backend
│   ├── src/main/java/
│   │   ├── controller/        # EscrowController REST API
│   │   ├── service/           # EscrowService, EmailNotificationService
│   │   ├── model/             # Escrow, EscrowEvent, EscrowStatus entities
│   │   ├── repository/        # Spring Data JPA interfaces
│   │   └── config/            # CORS & WebSocket STOMP broker configuration
│   └── Dockerfile             # Multi-stage Eclipse Temurin Java 21 image
│
├── trustpay-midnight/         # Midnight Smart Contracts & TypeScript Tooling
│   ├── contracts/             # escrow.compact smart contract
│   ├── src/                   # deploy.ts, cli.ts, network.ts, wallet.ts
│   └── tsconfig.json          # TypeScript configuration
│
├── docker-compose.yml         # Containerized production stack (MariaDB + Backend + Frontend)
├── DOCKER.md                  # Comprehensive Docker Compose operations guide
└── MIDNIGHT_TESTNET.md        # Midnight Preprod network deployment guide
```

---

## 🚀 Quickstart Guide

### Option 1: Docker Compose (All-In-One Local Deployment)

Spin up the entire architecture (MariaDB, Spring Boot Backend, and Nginx Frontend) with a single command:

```bash
docker compose up -d --build
```

- **Frontend Application:** `http://localhost:80`
- **Backend API:** `http://localhost:8080`
- **Database (MariaDB):** `localhost:3306`

*See [DOCKER.md](DOCKER.md) for health checks, environment parameters, and container troubleshooting.*

---

### Option 2: Local Development Setup

#### 1. Database Provisioning
```sql
CREATE DATABASE shieldescrow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Accessible at `http://localhost:5173`.

#### 3. Start Spring Boot Backend (Optional)
```bash
cd trustpay
./mvnw clean spring-boot:run
```
Accessible at `http://localhost:8080`.

#### 4. Midnight Smart Contract Tooling
```bash
cd trustpay-midnight
npm install
npm run build
npm run deploy    # Deploy to Midnight Preprod Testnet
npm run cli       # Interactive CLI for creating and inspecting on-chain escrows
```

*See [MIDNIGHT_TESTNET.md](MIDNIGHT_TESTNET.md) for testnet faucet, proof server configuration, and contract verification details.*

---

## 🔒 Security & Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `DATABASE_URL` | Serverless / Backend | JDBC / MySQL connection string (`mysql://user:pass@host:port/db`) |
| `SPRING_DATASOURCE_USERNAME` | Backend | Database credentials |
| `SPRING_DATASOURCE_PASSWORD` | Backend | Database credentials |
| `MIDNIGHT_CONTRACT_ADDRESS` | Backend / Midnight | Deployed Midnight Compact contract address |
| `VITE_API_URL` | Frontend | External backend URL (leave blank for same-origin serverless routing) |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
