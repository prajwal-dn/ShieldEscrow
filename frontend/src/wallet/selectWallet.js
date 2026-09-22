export const listWallets = () => {
  const injected = window.midnight;

  if (!injected) {
    return [];
  }

  return Object.values(injected);
};

export const selectWallet = () => {
  const wallets = listWallets();

  if (wallets.length === 0) {
    throw new Error(
      "No Midnight wallet found. Please install a Midnight wallet extension."
    );
  }

  return wallets[0];
};