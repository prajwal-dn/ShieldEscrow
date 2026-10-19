/**
 * Enumerate every wallet extension that has injected into window.midnight
 * or window.cardano (Lace, Nightly, etc.) and return a normalised list.
 */
export const listWallets = () => {
  const discovered = [];

  // Midnight-native extensions (e.g. Midnight Lace)
  const midnightInjected = window.midnight;
  if (midnightInjected && typeof midnightInjected === "object") {
    for (const [key, wallet] of Object.entries(midnightInjected)) {
      if (wallet && typeof wallet.connect === "function") {
        discovered.push({
          key,
          name: wallet.name || key,
          icon: wallet.icon || null,
          connect: wallet.connect.bind(wallet),
          network: "midnight",
        });
      }
    }
  }

  // Cardano-compatible extensions that also support Midnight (e.g. Nightly)
  const cardanoInjected = window.cardano;
  if (cardanoInjected && typeof cardanoInjected === "object") {
    for (const [key, wallet] of Object.entries(cardanoInjected)) {
      if (
        wallet &&
        typeof wallet.enable === "function" &&
        // avoid duplicates if the same wallet registers under both namespaces
        !discovered.find((w) => w.key === key)
      ) {
        discovered.push({
          key,
          name: wallet.name || key,
          icon: wallet.icon || null,
          enable: wallet.enable.bind(wallet),
          connect: null,           // Cardano-style: use .enable() instead
          network: "cardano",
        });
      }
    }
  }

  // Fallback for local development when no extension is installed
  if (discovered.length === 0) {
    discovered.push({
      key: "mock_dev_wallet",
      name: "Mock Dev Wallet",
      icon: null,
      connect: async () => ({
        getUnshieldedAddress: async () => ({ unshieldedAddress: "midnight_preprod1_mock" }),
        signData: async () => "mock_signature_xyz_123",
      }),
      network: "midnight",
    });
  }

  return discovered;
};

/**
 * Silently pick the first detected wallet (used when there is only one).
 * Throws if nothing is found.
 */
export const selectWallet = () => {
  const wallets = listWallets();
  if (wallets.length === 0) {
    throw new Error(
      "No Midnight/Cardano wallet found. Install Lace or Midnight Nightly."
    );
  }
  return wallets[0];
};