<div align="center">

# 🛡️ ShieldEscrow

### Privacy-First Decentralized Escrow Platform

**Secure peer-to-peer payments powered by the Midnight Blockchain — no intermediaries, no trust issues.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MariaDB](https://img.shields.io/badge/MariaDB-13-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org/)
[![Midnight](https://img.shields.io/badge/Midnight-Blockchain-7C3AED?style=for-the-badge)](https://midnight.network/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📖 Overview

**ShieldEscrow** is a decentralized escrow application that eliminates the need for trusted third parties in peer-to-peer transactions.

Instead of sending funds directly to a seller — which carries risk — ShieldEscrow **locks the funds inside a Midnight smart contract**. The seller completes the agreed work, and only after the buyer approves are the funds cryptographically released. In the event of a disagreement, built-in dispute resolution allows arbitration and full buyer refunds. This creates a trustless, transparent, and privacy-preserving payment flow.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔒 **Secure Escrow** | Funds locked in smart contract until buyer approval |
| 🛡️ **Privacy-First** | Powered by Midnight's zero-knowledge blockchain |
| 👛 **Multi-Wallet Support** | Connect via Lace, Eternl, Nami, Flint, or Typhon with CIP-30 auto-detection |
| 📊 **Escrow Dashboard** | Real-time view of active, completed, released, and refunded escrows |
| ⚡ **Instant Release** | One-click approval triggers on-chain fund release |
| ⚖️ **Dispute Resolution** | Freeze contested escrows and arbitrate fund distribution (release or refund) |
| 📜 **Audit History** | Complete activity timeline of all contract events, timestamps, and actors |
| 🔔 **Live Notifications** | Real-time WebSocket push notifications + email dispatch alerts |
| 🗄️ **Persistent Storage** | MariaDB backend — persistent relational storage with transaction guards |
| 🔗 **REST API** | Clean Spring Boot API for all escrow operations and lifecycle state transitions |

---

## 🏗️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### 🖥️ Frontend
- **React 19** + Vite 8
- **React Router v7**
- **Axios** for API calls
- **Tailwind CSS v4**
- **STOMP / SockJS** for WebSocket notifications
- **Multi-Wallet CIP-30 / Midnight DApp Connector**

</td>
<td valign="top" width="33%">

### ⚙️ Backend
- **Java 21**
- **Spring Boot 3.3**
- **Spring Data JPA**
- **MariaDB** (persistent)
- **Spring WebSocket STOMP Broker**
- **EmailNotificationService**

</td>
<td valign="top" width="33%">

### ⛓️ Blockchain
- **Midnight Compact 0.23+**
- **Midnight JS SDK**
- **Lace & CIP-30 Wallets**
- **Zero-Knowledge Proof Server**

</td>
</tr>
</table>

---

## 📁 Project Structure

```
ShieldEscrow/
│
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Navbar, EscrowCard, WalletStatus, ActivityTimeline, NotificationToast, WalletPickerModal
│   │   ├── pages/             # Landing, Dashboard, CreateEscrow, EscrowDetails
│   │   ├── context/           # WalletContext provider with multi-wallet API support
│   │   ├── services/          # Axios API service & transaction signing
│   │   ├── hooks/             # useEscrowNotifications WebSocket hook
│   │   └── wallet/            # Multi-wallet selector (Lace, Eternl, Nami, Flint)
│   ├── Dockerfile             # Multi-stage production frontend Docker image
│   ├── nginx.conf             # Production reverse proxy configuration
│   └── index.html
│
├── trustpay/                  # Spring Boot backend
│   ├── src/main/java/
│   │   ├── controller/        # EscrowController REST endpoints
│   │   ├── service/           # EscrowService business logic & EmailNotificationService
│   │   ├── model/             # Escrow entity, EscrowEvent entity & EscrowStatus enum
│   │   ├── repository/        # JPA repositories (Escrow, EscrowEvent)
│   │   ├── dto/               # Request/Response DTOs & EscrowNotification
│   │   └── config/            # CORS & WebSocket configuration
│   └── Dockerfile             # Multi-stage production backend Docker image
│
├── trustpay-midnight/         # Midnight smart contract & CLI
│   ├── contracts/             # escrow.compact smart contract
│   ├── src/                   # deploy.ts, cli.ts, wallet.ts, network.ts
│   └── tsconfig.json          # TypeScript configuration
│
├── docker-compose.yml         # Containerized production stack (MariaDB + Backend + Frontend)
├── DOCKER.md                  # Comprehensive Docker deployment guide
└── MIDNIGHT_TESTNET.md        # Midnight Preprod Testnet deployment guide
```

---

## 🔄 Escrow Flow

```
Buyer connects Wallet (Lace / Eternl / Nami / Flint)
         │
         ▼
   Creates an Escrow
   (amount, seller, description)
         │
         ▼
Spring Boot API saves escrow to MariaDB & broadcasts WebSocket event
         │
         ▼
Midnight Smart Contract locks the funds
         │
         ▼
   Seller completes work (Mark Completed)
         │
         ▼
    Buyer approves OR raises dispute
    ├── If Approved: Funds Released to Seller ✅
    └── If Disputed: Escrow Frozen ⚠️
             │
             ▼
        Arbitration & Dispute Resolution
        ├── Resolve & Release to Seller
        └── Resolve & Refund to Buyer 🔄
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/escrows` | Fetch all escrows |
| `POST` | `/api/escrows` | Create a new escrow |
| `GET` | `/api/escrows/{id}` | Get escrow by ID |
| `POST` | `/api/escrows/{id}/complete` | Mark work as completed |
| `POST` | `/api/escrows/{id}/approve` | Approve & release funds to seller |
| `POST` | `/api/escrows/{id}/dispute` | Raise dispute and freeze escrow |
| `POST` | `/api/escrows/{id}/resolve-dispute` | Arbitrate dispute (release or refund) |
| `GET` | `/api/escrows/{id}/events` | Fetch full audit trail and activity timeline |
| `POST` | `/api/escrows/{id}/sync-onchain` | Synchronize on-chain tx hash & status |

---

## ⛓️ Smart Contract

Written in **Midnight Compact**, the smart contract manages the entire escrow lifecycle on-chain.

**Circuits:**
```
createEscrow(buyer, seller, amount, description)
getStatus(escrowId)
releaseEscrow(escrowId)
disputeEscrow(escrowId)
refundEscrow(escrowId)
```

**On-chain fields per escrow:**

| Field | Type | Description |
|---|---|---|
| `buyer` | `Opaque<"string">` | Buyer's wallet address |
| `seller` | `Opaque<"string">` | Seller's wallet address |
| `amount` | `Opaque<"string">` | Locked amount in tNight / tDUST |
| `description` | `Opaque<"string">` | Work description |
| `status` | `Uint<8>` | 0: CREATED, 1: FUNDED, 2: RELEASED, 3: DISPUTED, 4: REFUNDED |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+
- **Java 21** (Eclipse Temurin recommended)
- **MariaDB** or **MySQL**
- **Lace Wallet** (or compatible Cardano/Midnight wallet)

---

### Option A: Running with Docker (Recommended)

Run the entire stack with a single command:

```bash
docker compose up -d --build
```

- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:8080
- **MariaDB:** localhost:3306

See [DOCKER.md](DOCKER.md) for full instructions, production overrides, and healthchecks.

---

### Option B: Running Locally

#### 1. Database Setup
```sql
CREATE DATABASE shieldescrow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Start the Backend
```bash
cd trustpay
./mvnw clean spring-boot:run
```
Backend runs at → `http://localhost:8080`

#### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at → `http://localhost:5173`

#### 4. Midnight Smart Contract CLI & Deploy
```bash
cd trustpay-midnight
npm install
npm run build
npm run deploy    # Interactive deployment to Midnight preprod testnet
npm run cli       # Interactive CLI for creating, viewing, releasing, and refunding escrows
```
See [MIDNIGHT_TESTNET.md](MIDNIGHT_TESTNET.md) for preprod testnet faucet, proof server, and deploy walkthrough.

---

## 📊 Current Status

### ✅ Completed
- [x] React frontend with modern responsive glassmorphism UI & routing
- [x] Spring Boot REST API with strict state transition validation
- [x] MariaDB persistent storage with automatic schema evolution
- [x] Multi-wallet support (Lace, Eternl, Nami, Flint, Typhon) with auto-detection & picker modal
- [x] Escrow dashboard & CRUD with real-time status counters
- [x] Smart contract written in Midnight Compact (`escrow.compact`)
- [x] Full contract circuits: Create, Inspect, Release, Dispute, and Refund
- [x] Spring Boot ↔ Midnight SDK & DApp connector live integration
- [x] Smart contract deployment pipeline to Midnight testnet ([MIDNIGHT_TESTNET.md](MIDNIGHT_TESTNET.md))
- [x] Interactive CLI for contract interactions (`npm run cli`)
- [x] Transaction history & immutable audit log (`ActivityTimeline.jsx` + `EscrowEvent` entity)
- [x] Live WebSocket push notifications (`/topic/escrows`) + Email alerting service
- [x] Dispute resolution mechanism (Raise dispute, Freeze escrow, Arbitrate & Award/Refund)
- [x] Production deployment with Docker Compose & Nginx reverse proxy ([DOCKER.md](DOCKER.md))
