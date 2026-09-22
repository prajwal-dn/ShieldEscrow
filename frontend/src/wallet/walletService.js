import { selectWallet } from "./selectWallet";

export async function connectWallet() {
  const wallet = selectWallet();

  // Connect to the network your wallet is actually on
  const api = await wallet.connect("mainnet");

  const { unshieldedAddress } = await api.getUnshieldedAddress();

  return {
    connected: true,
    api,
    address: unshieldedAddress,
  };
}