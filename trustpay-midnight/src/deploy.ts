console.log("A");
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import { Buffer } from 'buffer';
console.log("A");
// Midnight SDK imports
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { unshieldedToken } from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { createKeystore, InMemoryTransactionHistoryStorage, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { recordDeployment } from "./network";
// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;
console.log("B");
// Set network to preprod
setNetworkId('preprod');


// Preprod network configuration
const CONFIG = {
  indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
};

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
console.log("STEP 1 - Before dynamic import");
const Escrow = await import(pathToFileURL(contractPath).href);
console.log("STEP 2 - After dynamic import");
console.log("STEP 3 - Before CompiledContract.make");
const compiledContract = CompiledContract.make(
    'escrow',
    Escrow.Contract
)
.pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
);
console.log("STEP 4 - After CompiledContract.make");
// ─── Wallet Functions ──────────────────────────────────────────────────────────

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function createWallet(seed: string) {
  const keys = deriveKeys(seed);
  const networkId = getNetworkId();
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const shieldedConfig = {
    networkId,
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
  };

  const unshieldedConfig = {
    networkId,
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  };

  const dustConfig = {
    networkId,
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
  };

  const wallet = await WalletFacade.init({
    configuration: { ...shieldedConfig, ...unshieldedConfig, ...dustConfig },
    shielded: (cfg: any) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg: any) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg: any) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

// Workaround for wallet SDK signRecipe bug
function signTransactionIntents(tx: { intents?: Map<number, any> }, signFn: (payload: Uint8Array) => ledger.Signature, proofMarker: 'proof' | 'pre-proof'): void {
  if (!tx.intents || tx.intents.size === 0) return;
  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;
    const cloned = ledger.Intent.deserialize<ledger.SignatureEnabled, ledger.Proofish, ledger.PreBinding>('signature', proofMarker, 'pre-binding', intent.serialize());
    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);
    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map((_: any, i: number) => cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature);
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }
    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map((_: any, i: number) => cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature);
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }
    tx.intents.set(segment, cloned);
  }
}

async function createProviders(walletCtx: Awaited<ReturnType<typeof createWallet>>) {
  const state = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  const walletProvider = {
    getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signFn = (payload: Uint8Array) => walletCtx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletProvider.getCoinPublicKey();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'escrow-state',
      accountId,
      privateStoragePasswordProvider: () => `${Buffer.from(accountId, 'hex').toString('base64')}!`,
    }),
    publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

// ─── Main Deploy Script ────────────────────────────────────────────────────────

async function main() {
    console.log("STEP 5 - Inside main");
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║            Deploy TrustPay Escrow Contract                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Check if contract is compiled
  if (!fs.existsSync(path.join(zkConfigPath, 'contract', 'index.js'))) {
    console.error('Contract not compiled! Run: npm run compile');
    process.exit(1);
  }

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    // 1. Wallet setup
    console.log('─── Step 1: Wallet Setup ───────────────────────────────────────\n');
    const choice = await rl.question('  [1] Create new wallet\n  [2] Restore from seed\n  > ');

    const seed = choice.trim() === '2'
      ? await rl.question('\n  Enter your 64-character seed: ')
      : toHex(Buffer.from(generateRandomSeed()));

    if (choice.trim() !== '2') {
      console.log(`\n  ⚠️  SAVE THIS SEED (you'll need it later):\n  ${seed}\n`);
    }

    console.log('  Creating wallet...');
    const walletCtx = await createWallet(seed);

    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frame = 0;
    const syncSpinner = setInterval(() => {
      process.stdout.write(`\r  ${frames[frame++ % frames.length]} Syncing with network (this may take 30-60 seconds)...`);
    }, 80);
    const state = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.throttleTime(5000), Rx.filter((s) => s.isSynced)));
    clearInterval(syncSpinner);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');
    const address = walletCtx.unshieldedKeystore.getBech32Address();
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;

    console.log(`\n  Wallet Address: ${address}`);
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);

    // 2. Fund wallet if needed
    if (balance === 0n) {
      console.log('─── Step 2: Fund Your Wallet ───────────────────────────────────\n');
      console.log('  Visit: https://faucet.preprod.midnight.network/');
      console.log(`  Address: ${address}\n`);
      console.log('  Waiting for funds...');

      await Rx.firstValueFrom(
        walletCtx.wallet.state().pipe(
          Rx.throttleTime(10000),
          Rx.filter((s) => s.isSynced),
          Rx.map((s) => s.unshielded.balances[unshieldedToken().raw] ?? 0n),
          Rx.filter((b) => b > 0n),
        ),
      );
      console.log('  Funds received!\n');
    }

    // 3. Register for DUST
    console.log('─── Step 3: DUST Token Setup ───────────────────────────────────\n');
    const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

    if (dustState.dust.availableCoins.length > 0) {
      console.log(`  DUST tokens already available (${dustState.dust.balance(new Date()).toLocaleString()} DUST)`);
    } else {
      const nightUtxos = dustState.unshielded.availableCoins.filter((c: any) => !c.meta?.registeredForDustGeneration);
      if (nightUtxos.length > 0) {
        console.log('  Registering for DUST generation...');
        const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
          nightUtxos,
          walletCtx.unshieldedKeystore.getPublicKey(),
          (payload) => walletCtx.unshieldedKeystore.signData(payload),
        );
        const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
        await walletCtx.wallet.submitTransaction(finalized);
      }

      console.log('  Waiting for DUST tokens to accrue (this may take a few minutes)...');
      await Rx.firstValueFrom(
        walletCtx.wallet.state().pipe(
          Rx.throttleTime(10000),
          Rx.filter((s) => s.isSynced),
          Rx.tap((s) => {
            const dustBal = s.dust.balance(new Date());
            const coins = s.dust.availableCoins.length;
            if (dustBal > 0n) console.log(`  DUST balance: ${dustBal.toLocaleString()} (${coins} coins)`);
          }),
          Rx.filter((s) => s.dust.availableCoins.length >= 2),
        ),
      );
    }
    console.log('  DUST tokens ready!\n');

    // 4. Deploy contract
    console.log('─── Step 4: Deploy Contract ────────────────────────────────────\n');
    console.log('  Setting up providers...');
    const providers = await createProviders(walletCtx);

    console.log('  Deploying contract (this may take 30-60 seconds)...\n');
    const deployed = await deployContract(providers, {
      compiledContract,
      privateStateId: 'escrowState',
      initialPrivateState: {},
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;
    console.log('  ✅ Contract deployed successfully!\n');
    console.log(`  Contract Address: ${contractAddress}\n`);

    // 5. Save deployment info
recordDeployment(
    "preprod",
    contractAddress,
    address.toString()
);

console.log("Deployment saved.");

    await walletCtx.wallet.stop();
    console.log('─── Deployment Complete! ───────────────────────────────────────\n');
    console.log('  Next: Run `npm run cli` to create and manage escrows.\n');
  } finally {
    rl.close();
  }
}

main().catch(console.error);
