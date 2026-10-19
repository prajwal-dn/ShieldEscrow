# 🌐 Midnight Testnet Deployment Guide

> **Phase 3 — Midnight Preprod Testnet**
> This guide walks you through deploying the ShieldEscrow smart contract to the live Midnight **preprod** testnet and wiring its address back into the Spring Boot backend.

---

## Prerequisites

| Requirement | How to Check | Install / Fix |
|---|---|---|
| Node.js ≥ 22 | `node --version` | [nodejs.org](https://nodejs.org) |
| Docker Desktop | `docker --version` | [docker.com](https://docker.com) |
| Compact Compiler | `compact --version` | See §1 below |
| yarn (v1.x) | `yarn --version` | `npm i -g yarn` |

---

## Step 1 — Verify the Compact Compiler

The `compact` CLI is installed globally and must be on your PATH:

```powershell
# Check version (should be 0.23+)
compact --version

# If not found, find it
where compact
# Or check npm global bin:
npm root -g
```

If the compiler is missing, download it from the [Midnight Developer Portal](https://docs.midnight.network).

---

## Step 2 — Compile the Smart Contract

```powershell
cd e:\ShieldEscrow\trustpay-midnight

# Install dependencies (if not already done)
yarn install

# Compile escrow.compact → contracts/managed/escrow/
npm run compile
```

Expected output:
```
✓ Compiling contracts/escrow.compact ...
✓ Output written to contracts/managed/escrow/
```

Verify the output exists:
```powershell
ls contracts/managed/escrow/contract/index.js
```

---

## Step 3 — Start the Proof Server

The proof server generates ZK proofs locally before submitting transactions to the chain.

```powershell
# Start the Docker-based proof server
npm run proof-server:start

# Verify it's running on port 6300
curl http://localhost:6300/health
```

> **Note:** The proof server image is ~2 GB. The first pull may take several minutes.

---

## Step 4 — Fund a Preprod Wallet

```powershell
# Run the interactive deploy script
npm run deploy
```

At the prompt, choose **[1] Create new wallet**.

> ⚠️ **SAVE YOUR SEED PHRASE** — copy the 64-character hex seed shown and store it somewhere safe. You'll need it to run the CLI later.

The script will display your wallet address:
```
Wallet Address: midnight1qq...
Balance: 0 tNight
```

Visit the **faucet** to fund it:
- 🚰 **Preprod Faucet:** https://midnight-tmnight-preprod.nethermind.dev
- Paste your wallet address and request test tokens
- Wait ~30 seconds for on-chain confirmation

The deploy script will detect the funds automatically and continue.

---

## Step 5 — Deploy the Contract

After funding, the script continues automatically through:

1. **DUST token setup** — registers your tNight for DUST generation (needed for tx fees)
2. **Contract deployment** — submits the compiled escrow contract to preprod
3. **Saves results** to `.midnight-state.json`

```
─── Step 4: Deploy Contract ────────────────────────────────────
  Setting up providers...
  Deploying contract (this may take 30-60 seconds)...

  ✅ Contract deployed successfully!

  Contract Address: 0200d43a7f...
```

---

## Step 6 — Record the Contract Address in the Backend

Once deployed, copy the contract address and update the Spring Boot backend so new escrows are pre-linked to the on-chain contract.

**Option A — Environment Variable (recommended for Docker):**
```powershell
# In docker-compose.yml backend environment section, add:
MIDNIGHT_CONTRACT_ADDRESS=<your-contract-address>
```

**Option B — Via the API (for individual escrows):**
```powershell
# Sync any existing escrow to the deployed contract
curl -X POST "http://localhost:8080/api/escrows/1/sync-onchain" `
  -d "contractAddress=<your-contract-address>&txHash=<deploy-txhash>&status=FUNDED"
```

---

## Step 7 — Interact via the CLI

```powershell
# Make sure the active network is set to preprod
tsx src/network.ts preprod

# Run the interactive CLI
npm run cli
```

Available CLI actions:
```
─── Menu ───────────────────────────────────────────────────────
  1. Store a message
  2. Read current message
  3. Check wallet balance
  4. Exit
```

> **Coming next:** The CLI will be extended with full escrow operations (createEscrow, releaseEscrow, getStatus).

---

## Step 8 — Restore Wallet for CLI Sessions

If you need to restore your wallet (e.g. on a different machine):

```powershell
# Run deploy with restore option
npm run deploy
# Choose [2] Restore from seed
# Enter your 64-character seed
```

Or set the env variable to skip the prompt:
```powershell
$env:MIDNIGHT_WALLET_SEED = "your-64-char-hex-seed"
npm run cli
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Contract not compiled! Run: npm run compile` | Run `npm run compile` first |
| Proof server timeout | Check Docker: `docker logs proof-server` |
| `Insufficient DUST` during deploy | Wait 5 min after DUST registration |
| Wallet sync takes forever | Normal on first run — can take 3–10 min |
| `ERR_MODULE_NOT_FOUND` for `compact-js` | Run `yarn install` again |
| Network error from indexer | Check internet, try again — preprod occasionally has downtime |

---

## Network Reference

| Network | Indexer | Faucet |
|---|---|---|
| **preprod** | `https://indexer.preprod.midnight.network/api/v3/graphql` | https://midnight-tmnight-preprod.nethermind.dev |
| preview | `https://indexer.preview.midnight.network/api/v4/graphql` | https://midnight-tmnight-preview.nethermind.dev |
| undeployed | `http://localhost:8088` | n/a |

---

## Architecture

```
Browser (React DApp)
       │
       ▼
Spring Boot REST API (port 8080)
  • POST /api/escrows         → creates DB record
  • POST /api/escrows/{id}/sync-onchain → links contractAddress + txHash
  • WS   /ws                 → STOMP push notifications
       │
       ▼ (optional on-chain verification)
Midnight SDK (trustpay-midnight)
  • npm run deploy  → deploys contract to preprod
  • npm run cli     → calls on-chain circuits
       │
       ▼
Midnight Preprod Blockchain
  • escrow.compact circuits: createEscrow, releaseEscrow, getStatus
```
