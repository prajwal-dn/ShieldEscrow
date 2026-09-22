# TrustPay

> A decentralized escrow platform built on Midnight Blockchain for secure peer-to-peer payments.

## Overview

TrustPay enables buyers and sellers to exchange payments securely using blockchain-powered escrow.

Instead of sending money directly to the seller, funds are locked inside a smart contract. The seller completes the work, and only after the buyer approves are the funds released.

This removes the need for intermediaries while increasing transparency and trust.

---

## Features

- Secure escrow creation
- Midnight smart contract
- Lace Wallet integration
- Wallet authentication
- Escrow dashboard
- Escrow details page
- Buyer approval flow
- Blockchain-backed release flow
- Spring Boot REST API
- React frontend

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend

- Java
- Spring Boot
- REST APIs
- H2 Database

### Blockchain

- Midnight Compact
- Midnight SDK
- Lace Wallet
- DApp Connector API

---

## Project Structure

```
trustpay/
│
├── frontend/
│   ├── React UI
│   ├── Wallet Integration
│   └── Dashboard
│
├── backend/
│   ├── Spring Boot APIs
│   ├── Escrow Management
│   └── H2 Database
│
└── trustpay-midnight/
    ├── Compact Smart Contract
    ├── Midnight SDK
    └── Contract Deployment
```

---

## Current Workflow

```text
Buyer
    ↓
Connect Lace Wallet
    ↓
Create Escrow
    ↓
Spring Boot API
    ↓
Midnight Smart Contract
    ↓
Escrow Stored
    ↓
Seller Completes Work
    ↓
Buyer Approves
    ↓
Wallet Signs Transaction
    ↓
Funds Released
```

---

## Smart Contract

Implemented in Midnight Compact.

Current circuits:

- createEscrow()
- getStatus()
- releaseEscrow()

Each escrow stores:

- Buyer
- Seller
- Amount
- Description
- Status

---

## Frontend

- Landing Page
- Dashboard
- Create Escrow
- Escrow Details
- Wallet Connect
- Wallet Address Display

---

## Backend APIs

```
POST /api/escrows
GET /api/escrows
GET /api/escrows/{id}
```

---

## Wallet Integration

- Detect Lace Wallet
- Connect Wallet
- Display wallet address
- Prepare transaction signing flow

---

## Current Progress

### Completed

- React frontend
- Spring Boot backend
- Midnight smart contract
- Wallet connection
- Dashboard
- Escrow CRUD
- Smart contract compilation

### In Progress

- Smart contract deployment
- Spring Boot ↔ Midnight SDK integration
- Live blockchain transaction execution

---

## Team

### Ishika Thakur

- Backend
- Smart Contracts
- Midnight SDK Integration
- Spring Boot

### Vaishali

- React Frontend
- Wallet Integration
- UI/UX

---

## Future Enhancements

- Multi-escrow support
- Transaction history
- Notifications
- Multi-wallet support
- Production deployment

---

Built for the Midnight x MLH Hackathon 2026.
