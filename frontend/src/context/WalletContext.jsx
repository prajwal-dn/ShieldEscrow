import { createContext, useContext, useState } from "react";

const WalletContext = createContext();


export function WalletProvider({ children }) {

  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");


  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,

        connected,
        setConnected,

        address,
        setAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}


export function useWallet() {
  return useContext(WalletContext);
}