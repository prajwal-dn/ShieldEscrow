import { createContext, useContext, useState, useCallback } from "react";
import { listWallets } from "../wallet/selectWallet";
import WalletPickerModal from "../components/WalletPickerModal";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [wallet, setWallet]       = useState(null);
  const [walletApi, setWalletApi] = useState(null);
  const [connected, setConnected] = useState(false);
  const [address, setAddress]     = useState("");
  const [walletError, setWalletError] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const connectWith = useCallback(async (walletDef) => {
    setShowPicker(false);
    setWalletError("");
    try {
      let resolvedAddress = "";
      let resolvedApi = null;

      if (walletDef.network === "midnight" && typeof walletDef.connect === "function") {
        const api = await walletDef.connect("preprod");
        const addrRes = await api.getUnshieldedAddress?.();
        resolvedAddress =
          typeof addrRes === "string"
            ? addrRes
            : (addrRes?.unshieldedAddress || addrRes?.address || "");
        resolvedApi = api;
      } else if (walletDef.network === "cardano" && typeof walletDef.enable === "function") {
        const api = await walletDef.enable();
        const addrs = await api.getUsedAddresses();
        resolvedAddress = addrs?.[0] || "cardano_addr_unknown";
        resolvedApi = api;
      }

      if (!resolvedAddress) {
        throw new Error("Wallet connected but no address was returned.");
      }

      setWallet(walletDef);
      setWalletApi(resolvedApi);
      setAddress(resolvedAddress);
      setConnected(true);
    } catch (err) {
      console.error("Wallet connection failed:", err.message);
      setWallet(null);
      setWalletApi(null);
      setAddress("");
      setConnected(false);
      setWalletError(err.message || "Failed to connect wallet. Please try again.");
    }
  }, []);

  /**
   * Top-level connect flow:
   *  1. If 0 wallets  → show "no wallet" modal
   *  2. If 1 wallet   → connect silently
   *  3. If >1 wallets → open picker so user can choose
   */
  const initiateConnect = useCallback(() => {
    const wallets = listWallets();
    if (wallets.length === 1) {
      // Auto-connect the single wallet
      connectWith(wallets[0]);
    } else {
      // Show picker (handles 0 wallets + multi-wallet)
      setShowPicker(true);
    }
  }, [connectWith]);

  const disconnect = useCallback(() => {
    setWallet(null);
    setWalletApi(null);
    setAddress("");
    setConnected(false);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletApi,
        setWallet,
        connected,
        setConnected,
        address,
        setAddress,
        walletError,
        setWalletError,
        initiateConnect,
        disconnect,
      }}
    >
      {children}

      {/* Global multi-wallet picker — rendered once at provider level */}
      {showPicker && (
        <WalletPickerModal
          onSelect={connectWith}
          onClose={() => setShowPicker(false)}
        />
      )}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}