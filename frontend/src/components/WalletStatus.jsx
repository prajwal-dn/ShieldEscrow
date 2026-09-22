import { useWallet } from "../context/WalletContext";
import { connectWallet } from "../wallet/walletService";


function WalletStatus() {

  const {
    connected,
    setConnected,
    setWallet,
    address,
    setAddress
  } = useWallet();


  const handleConnect = async () => {

    try {

      const wallet = await connectWallet();


      setConnected(wallet.connected);

      setWallet(wallet.api);

      setAddress(wallet.address);


    } catch(err) {

      console.error("FULL WALLET ERROR:", err);

      alert(err.message);

    }

  };


  return (
    <div
      style={{
        display:"flex",
        alignItems:"center",
        gap:"12px",
      }}
    >

      {
        connected ? (

          <>
            <span
              style={{
                color:"#22c55e",
                fontWeight:"bold",
              }}
            >
              🟢 Connected
            </span>


            <span
              style={{
                color:"white",
              }}
            >
              {address.substring(0,15)}...
            </span>

          </>


        ) : (

          <button
            onClick={handleConnect}

            style={{
              background:"#38bdf8",
              color:"#0f172a",
              border:"none",
              padding:"10px 18px",
              borderRadius:"8px",
              cursor:"pointer",
              fontWeight:"600",
            }}

          >
            Connect Wallet
          </button>

        )
      }


    </div>
  );
}


export default WalletStatus;