import { selectWallet, listWallets } from "../wallet/selectWallet";

export const detectWallet = async () => {
  const wallets = listWallets();
  return wallets.length > 0;
};

/**
 * Retrieve authorization headers from saved session token.
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("shield_escrow_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const connectWallet = async (network = "preprod") => {
  try {
    const wallet = selectWallet();
    const api = await wallet.connect(network);
    const { unshieldedAddress } = await api.getUnshieldedAddress();
    return {
      connected: true,
      api,
      address: unshieldedAddress,
    };
  } catch (err) {
    console.error("Wallet connection failed:", err.message);
    throw new Error("Failed to connect wallet. Please ensure a Midnight-compatible wallet extension (Lace, Nightly) is installed and unlocked.");
  }
};

export const signTransaction = async (escrowDetails, walletApi = null) => {
  try {
    if (walletApi && typeof walletApi.signData === "function") {
      const payload = new TextEncoder().encode(JSON.stringify(escrowDetails || { action: "release", timestamp: Date.now() }));
      const signature = await walletApi.signData(payload);
      return { signature };
    }
  } catch (err) {
    console.warn("[ShieldEscrow] Using testnet signature simulation:", err.message);
  }
  // Simulated cryptographic signature for preprod testnet
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    signature: "midnight_testnet_sig_" + Math.random().toString(36).substring(2, 15),
    isSimulated: true,
  };
};

/**
 * Preprod Testnet Simulation for transaction submission.
 * Clearly flagged as simulated until Midnight mainnet node integration is active.
 */
export const submitTransaction = async (id, action = "release") => {
  console.warn("[ShieldEscrow] Running in preprod testnet simulation mode.");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const txHash = "sim_tx_" + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return {
    success: true,
    txHash,
    isSimulated: true,
    action,
    network: "midnight-preprod",
    timestamp: new Date().toISOString(),
  };
};