<div align="center">

# 🛡️ ShieldEscrow

### Privacy-First Decentralized Escrow Platform

**Secure peer-to-peer payments powered by the Midnight Blockchain — no intermediaries, no trust issues.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MariaDB](https://img.shields.io/badge/MariaDB-13-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org/)
[![Midnight](https://img.shields.io/badge/Midnight-Blockchain-7C3AED?style=for-the-badge)](https://midnight.network/)

</div>

---

## 📖 Overview

**ShieldEscrow** is a decentralized escrow application that eliminates the need for trusted third parties in peer-to-peer transactions.

Instead of sending funds directly to a seller — which carries risk — ShieldEscrow **locks the funds inside a Midnight smart contract**. The seller completes the agreed work, and only after the buyer approves are the funds cryptographically released. This creates a trustless, transparent, and privacy-preserving payment flow.



---

## ✨ Features

| Feature | Description |
|---|---|
| 🔒 **Secure Escrow** | Funds locked in smart contract until buyer approval |
| 🛡️ **Privacy-First** | Powered by Midnight's zero-knowledge blockchain |
| 👛 **Lace Wallet** | Seamless wallet connect & transaction signing |
| 📊 **Escrow Dashboard** | Real-time view of all active and released escrows |
| ⚡ **Instant Release** | One-click approval triggers on-chain fund release |
| 🗄️ **Persistent Storage** | MariaDB backend — data survives restarts |
| 🔗 **REST API** | Clean Spring Boot API for all escrow operations |

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
- **Midnight DApp Connector API**

</td>
<td valign="top" width="33%">

### ⚙️ Backend
- **Java 21**
- **Spring Boot 3.3**
- **Spring Data JPA**
- **MariaDB** (persistent)
- **REST APIs**

</td>
<td valign="top" width="33%">

### ⛓️ Blockchain
- **Midnight Compact**
- **Midnight SDK**
- **Lace Wallet**
- **DApp Connector API**

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
│   │   ├── components/        # Navbar, EscrowCard, WalletStatus, Loader
│   │   ├── pages/             # Landing, Dashboard, CreateEscrow, EscrowDetails
│   │   ├── context/           # Wallet context provider
│   │   ├── services/          # Axios API service
│   │   └── wallet/            # Lace wallet integration
│   └── index.html
│
├── trustpay/                  # Spring Boot backend
│   └── src/main/java/
│       ├── controller/        # EscrowController REST endpoints
│       ├── service/           # EscrowService business logic
│       ├── model/             # Escrow entity & EscrowStatus enum
│       ├── repository/        # JPA repository
│       ├── dto/               # Request/Response DTOs
│       └── config/            # CORS & app configuration
│
└── trustpay-midnight/         # Midnight smart contract
    ├── contracts/             # Compact smart contract source
    └── scripts/               # Deployment & interaction scripts
```

---

## 🔄 Escrow Flow

```
Buyer connects Lace Wallet
         │
         ▼
  Creates an Escrow
  (amount, seller, description)
         │
         ▼
Spring Boot API saves escrow to MariaDB
         │
         ▼
Midnight Smart Contract locks the funds
         │
         ▼
   Seller completes work
         │
         ▼
    Buyer approves
         │
         ▼
Wallet signs the release transaction
         │
         ▼
      Funds Released ✅
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/escrows` | Fetch all escrows |
| `POST` | `/api/escrows` | Create a new escrow |
| `GET` | `/api/escrows/{id}` | Get escrow by ID |
| `POST` | `/api/escrows/{id}/complete` | Mark work as completed |
| `POST` | `/api/escrows/{id}/approve` | Approve & release funds |

---

## ⛓️ Smart Contract

Written in **Midnight Compact**, the smart contract manages the entire escrow lifecycle on-chain.

**Circuits:**
```
createEscrow(buyer, seller, amount, description)
getStatus(escrowId)
releaseEscrow(escrowId)
```

**On-chain fields per escrow:**

| Field | Type | Description |
|---|---|---|
| `buyer` | `Address` | Buyer's wallet address |
| `seller` | `Address` | Seller's wallet address |
| `amount` | `Uint64` | Locked amount in tDUST |
| `description` | `String` | Work description |
| `status` | `Enum` | CREATED → COMPLETED → RELEASED |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Java 21** (Eclipse Temurin recommended)
- **MariaDB** or **MySQL**
- **Lace Wallet** browser extension

---

### 1. Clone the repository

```bash
git clone https://github.com/prajwal-dn/ShieldEscrow.git
cd ShieldEscrow
```

### 2. Set up the database

```sql
CREATE DATABASE shieldescrow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure the backend

```bash
cd trustpay/src/main/resources
cp application.properties.example application.properties
```

Edit `application.properties` and fill in your database credentials:

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/shieldescrow
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. Start the backend

```bash
cd trustpay
./mvnw spring-boot:run
```

Backend runs at → `http://localhost:8080`

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 📊 Current Status

### ✅ Completed
- [x] React frontend with full routing
- [x] Spring Boot REST API
- [x] MariaDB persistent storage
- [x] Lace Wallet integration
- [x] Escrow dashboard & CRUD
- [x] Smart contract (Midnight Compact)
- [x] Smart contract compilation

### 🔄 In Progress
- [ ] Smart contract deployment to Midnight testnet
- [ ] Spring Boot ↔ Midnight SDK live integration
- [ ] On-chain transaction execution

### 🔮 Planned
- [ ] Transaction history & audit log
- [ ] Email / push notifications
- [ ] Multi-wallet support
- [ ] Dispute resolution mechanism
- [ ] Production deployment

---

