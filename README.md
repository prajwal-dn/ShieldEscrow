<div align="center">

# 🛡️ ShieldEscrow

### Enterprise-Grade, Zero-Knowledge Escrow Protocol with AI-Powered Deliverable Verification

**Trustless peer-to-peer settlement powered by Midnight ZK Smart Contracts & Google Gemini 3.5 Flash AI Arbitration.**

[![Live Application](https://img.shields.io/badge/Live_DApp-ShieldEscrow-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](http://localhost:5173)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Midnight](https://img.shields.io/badge/Blockchain-Midnight_Preprod-7C3AED?style=for-the-badge)](https://midnight.network/)
[![AI Engine](https://img.shields.io/badge/AI_Arbitrator-Gemini_3.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📌 Overview

**ShieldEscrow** is a decentralized, privacy-first escrow protocol engineered to eliminate counterparty risk and payment disputes in digital commerce, freelance development, and B2B contracts.

Traditional escrow services charge **3%–10% in fees**, take **5–14 business days** to settle, and rely on human arbiters who lack the technical expertise to inspect software, codebases, or APIs. 

ShieldEscrow solves this by pairing:
1. **Midnight Zero-Knowledge Smart Contracts** for non-custodial capital locking.
2. **A Common Treaty Session** where buyers and sellers agree on explicit, machine-readable acceptance criteria before work begins.
3. **Google Gemini 3.5 Flash AI Engine** that inspects the seller's submitted deliverable link against every agreed rule, granting a **Green Signal** to authorize instant payout.

---

## ⚡ The 4-Step Trustless Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    THE SHIELDESCROW WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

 1. COMMON SESSION          2. CAPITAL & RULES         3. DELIVERABLE LINK        4. GREEN SIGNAL
 [Buyer & Seller]           [Buyer Action]             [Seller Action]            [Gemini AI Engine]
         │                          │                          │                          │
  Both parties sign up       Buyer locks funds in       Seller completes work      Gemini audits link
  with verified Gmail/ID     Midnight ZK escrow         and pastes public link     against all rules.
  and join shared room       and sets explicit          (GitHub repo, demo app,    Green signal auto-
  via invite link.           inspection criteria.       or release artifact).      releases the payout!
         │                          │                          │                          │
         ▼                          ▼                          ▼                          ▼
 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
 │ BUY-xxxxxx    │ ───────▶ │ Funds Locked  │ ───────▶ │ Link: https://│ ───────▶ │ ✅ Score: 98% │
 │ SEL-xxxxxx    │          │ Rules Active  │          │ github.com/...│          │ Payout Settled│
 └───────────────┘          └───────────────┘          └───────────────┘          └───────────────┘
```

---

## 🚀 Core Features

### 1. Dual-Sided Shared Treaty Sessions
* **Buyer View**: Deposits capital, defines rules/rubric, and monitors AI arbitration.
* **Seller View**: Reviews agreed criteria, submits deliverable link with delivery walkthrough notes, and triggers AI verification.
* **One-Click Treaty Link**: Buyers generate a shareable session invite (`/escrow/:id`) allowing the counterparty to bind their seller identity to the contract.

### 2. AI Escrow Arbitrator & Verification Engine
* Powered directly by **Google Gemini 3.5 Flash**.
* Strictly audits public deliverable links against written contract rules.
* Produces an itemized **Criteria Evaluation Rubric** scoring each requirement (0–100%).
* **Green Signal**: On passing score, automatically authorizes state change to `AI_APPROVED` / `COMPLETED`.

### 3. Verified Multi-Tenant Authentication
* **Strict Gmail Validation**: Enforces legitimate Google accounts (`@gmail.com`).
* **Custom Usernames**: Optional unique `@handle` for human-readable identity.
* **Standardized Identity IDs**: Deterministic `USR-XXXXXX`, `BUY-XXXXXX`, and `SEL-XXXXXX` identifiers guaranteeing privacy and non-repudiation.

### 4. Midnight Network Zero-Knowledge Integration
* Zero-knowledge proofs prevent counterparty eavesdropping on transaction values and private addresses.
* Compatible with the Midnight Preprod testnet and Midnight Lace / DApp Connector extension.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Presentation Tier                        │
│   React 19 SPA • Tailwind CSS v4 • CIP-30 / Midnight DApp Connector    │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼ (REST / JSON)                   ▼ (ZK Proofs / RPC)
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│          API & Gateway Tier          │  │       Blockchain Tier        │
│  • Vite Integrated Node Handlers     │  │  • Midnight Preprod Network  │
│  • Gemini 3.5 Flash Arbitration API  │  │  • Compact Smart Contracts   │
│  • Claude Code Proxy Bridge (:3456)  │  │  • ZK Proof Server (:6300)   │
└──────────────────┬───────────────────┘  └──────────────┬───────────────┘
                   │                                     │
                   ▼ (Persistent Storage)                ▼ (State Records)
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│           Persistence Tier           │  │      On-Chain Ledgers        │
│  • MySQL / MariaDB 11 Database       │  │  • escrows: Map<ID, Escrow>  │
│  • In-Memory Zero-Config Fallback    │  │  • immutable audit events    │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, Tailwind CSS v4, React Router 7, React Icons
* **AI Engine**: Google Gemini 3.5 Flash (`generateContent` with JSON output schemas)
* **Blockchain**: Midnight Preprod Testnet, Compact ZK Contract Language, `@midnight-ntwrk/dapp-connector-api`
* **Backend**: Node.js ES Modules with integrated Vite API middleware
* **Security & Auth**: Bcrypt.js, JSON Web Tokens (JWT), Strict Gmail Pattern Validation

---

## 📦 Getting Started

### Prerequisites
* **Node.js** v20+ or v24+
* **Google Gemini API Key** ([Get one at Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Install
```bash
git clone https://github.com/prajwal-dn/ShieldEscrow.git
cd ShieldEscrow/frontend
npm install
```

### 2. Environment Configuration
Copy `.env.example` in the project root to `.env`:
```bash
cp .env.example .env
```
Add your credentials:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
JWT_SECRET=your_jwt_secret_key_minimum_32_chars
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📋 What All Changes Are Needed to Make It Production-Ready

While ShieldEscrow's core architecture and AI-driven escrow workflow are fully implemented and functional, the following production-grade enhancements are recommended before deploying with mainnet financial capital:

### 1. Timed Inspection Window (Safety Buffer)
* **Current**: AI Green Signal triggers instant settlement.
* **Production Recommendation**: Implement a **24–48 hour challenge window** after the Green Signal. 
  - If the buyer confirms, payment is released immediately.
  - If the buyer does nothing, funds auto-release after 48h (protecting sellers against ghosting).
  - If contested, the AI evaluation serves as primary objective evidence for human/multi-sig arbiters.

### 2. CI/CD & GitHub Webhook Verification (Anti-Spoofing)
* **Current**: Seller submits a public URL (e.g. GitHub repo link).
* **Production Recommendation**: Integrate GitHub OAuth / Webhooks to programmatically verify:
  - Commit SHA ownership
  - Automated test execution logs (`npm test` / CI pipeline exit code 0)
  - Release artifact hashes

### 3. Prompt Injection Defense & Sandboxed Code Review
* **Current**: Direct prompt framing to Gemini 3.5 Flash.
* **Production Recommendation**: Strip and sanitize submitted repositories to prevent adversarial prompt injection (e.g., hidden instructions in markdown files attempting to force `passed: true`).

### 4. Database Persistence Hardening
* **Current**: Resilient hybrid architecture using MySQL pool with in-memory zero-config fallback.
* **Production Recommendation**: Deploy a managed cloud database (e.g. Supabase Postgres, Neon, or AWS RDS MySQL) with automated daily snapshots and encrypted connection pooling.

### 5. Multi-Sig Arbiter DAO
* **Current**: Direct buyer/seller dispute resolution.
* **Production Recommendation**: Introduce a 2-of-3 multi-signature dispute resolution scheme involving an elected community arbitrator or oracle for contested claims.

### 6. Midnight Mainnet Transition
* **Current**: Configured for Midnight Preprod testnet using `tNight` test tokens.
* **Production Recommendation**: Audit the Compact smart contracts and deploy to Midnight Mainnet upon mainnet launch.

---

## 📄 License
This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
