/**
 * CLI for interacting with trustpay-midnight Escrow contract
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/compact-js';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

// Must match the privateStateId used at deploy time so the CLI reconnects to the same private state.
const PRIVATE_STATE_ID = 'escrowState';
const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(
  __dirname,
  '..',
  'contracts',
  'managed',
  'escrow'
);

// Load compiled contract
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

// Check if contract is compiled
if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const EscrowContract = await import(pathToFileURL(contractPath).href);

const compiledContract = CompiledContract.make('escrow', EscrowContract.Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

// ─── Providers ─────────────────────────────────────────────────────────────────

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'escrow-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

// Status labels
const ESCROW_STATUS_LABELS: Record<number, string> = {
  0: 'CREATED',
  1: 'FUNDED',
  2: 'RELEASED',
  3: 'DISPUTED',
  4: 'REFUNDED',
};

// ─── Main CLI ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   TrustPay Midnight CLI                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  // Check for deployment
  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network: ${network}\n`);

  try {
    const seed = SEED;

    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed });
    const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
    if (restoredCount > 0) {
      console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state — sync will resume from saved point.`);
    }

    console.log('  Syncing with network...');
    console.log('  ℹ  This may take several minutes depending on network size.');
    console.log('     RPC disconnection messages during sync are normal and can be safely ignored.\n');
    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
    }, 5000);
    const state = await walletCtx.wallet.waitForSyncedState();
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');

    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);

    if (balance === 0n && network !== 'undeployed' && networkConfig.faucet) {
      const address = walletCtx.unshieldedKeystore.getBech32Address();
      console.log('  ⚠ Wallet has no tNight. Fund it from the faucet to send transactions:');
      console.log(`     ${networkConfig.faucet}`);
      console.log(`     Wallet address: ${address}\n`);
    }

    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });

    console.log('  ✅ Connected!\n');

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Create Escrow');
      console.log('  2. Query Escrow Status / Ledger');
      console.log('  3. Release Escrow (to Seller)');
      console.log('  4. Raise Dispute on Escrow');
      console.log('  5. Refund Escrow (to Buyer)');
      console.log('  6. Check wallet balance');
      console.log('  7. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const buyer = await rl.question('  Buyer Address: ');
          const seller = await rl.question('  Seller Address: ');
          const amount = await rl.question('  Amount (e.g. 50 ADA / tNight): ');
          const description = await rl.question('  Description: ');

          console.log('\n  Submitting createEscrow transaction (this may take 30-60 seconds)...');
          try {
            const tx = await deployed.callTx.createEscrow(buyer, seller, amount, description);
            console.log(`\n  ✅ Escrow created successfully!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '2': {
          console.log('\n  Querying escrow ledger from blockchain...');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const ledgerState = EscrowContract.ledger(contractState.data);
              const nextId = ledgerState.nextEscrowId !== undefined ? Number(ledgerState.nextEscrowId) : 0;
              console.log(`\n  📋 Total Escrows Created: ${nextId}`);

              const idInput = await rl.question('  Enter Escrow ID to inspect (or press Enter for summary): ');
              if (idInput.trim()) {
                const escrowId = BigInt(idInput.trim());
                if (ledgerState.escrows && typeof ledgerState.escrows.lookup === 'function') {
                  try {
                    const esc = ledgerState.escrows.lookup(escrowId);
                    if (esc) {
                      const statusNum = Number(esc.status);
                      const statusText = ESCROW_STATUS_LABELS[statusNum] || `UNKNOWN (${statusNum})`;
                      console.log(`\n  ── Escrow #${idInput.trim()} Details ──`);
                      console.log(`  Buyer:       ${esc.buyer}`);
                      console.log(`  Seller:      ${esc.seller}`);
                      console.log(`  Amount:      ${esc.amount}`);
                      console.log(`  Description: ${esc.description}`);
                      console.log(`  Status:      ${statusText} (${statusNum})\n`);
                    } else {
                      console.log(`\n  Escrow #${idInput.trim()} not found.\n`);
                    }
                  } catch (e) {
                    console.log(`\n  Could not find escrow #${idInput.trim()}:`, e instanceof Error ? e.message : e);
                  }
                } else {
                  console.log(`  (Ledger map format does not support direct lookup on this client version)\n`);
                }
              }
            } else {
              console.log('\n  📋 Contract state is currently empty.\n');
            }
          } catch (error) {
            console.error('\n  ❌ Failed to query contract state:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '3': {
          const idInput = await rl.question('  Enter Escrow ID to release: ');
          if (!idInput.trim()) {
            console.log('  Invalid escrow ID.');
            break;
          }
          console.log(`\n  Submitting releaseEscrow for #${idInput.trim()} (this may take 30-60 seconds)...`);
          try {
            const tx = await deployed.callTx.releaseEscrow(BigInt(idInput.trim()));
            console.log(`\n  ✅ Escrow #${idInput.trim()} released successfully!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '4': {
          const idInput = await rl.question('  Enter Escrow ID to dispute: ');
          if (!idInput.trim()) {
            console.log('  Invalid escrow ID.');
            break;
          }
          console.log(`\n  Submitting disputeEscrow for #${idInput.trim()} (this may take 30-60 seconds)...`);
          try {
            const tx = await deployed.callTx.disputeEscrow(BigInt(idInput.trim()));
            console.log(`\n  ✅ Escrow #${idInput.trim()} marked DISPUTED!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '5': {
          const idInput = await rl.question('  Enter Escrow ID to refund: ');
          if (!idInput.trim()) {
            console.log('  Invalid escrow ID.');
            break;
          }
          console.log(`\n  Submitting refundEscrow for #${idInput.trim()} (this may take 30-60 seconds)...`);
          try {
            const tx = await deployed.callTx.refundEscrow(BigInt(idInput.trim()));
            console.log(`\n  ✅ Escrow #${idInput.trim()} refunded to buyer successfully!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '6': {
          console.log('\n  Checking balance...');
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST: ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case '7':
          running = false;
          console.log('\n  👋 Goodbye!\n');
          break;

        default:
          console.log('\n  ❌ Invalid choice. Please enter 1-7.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
