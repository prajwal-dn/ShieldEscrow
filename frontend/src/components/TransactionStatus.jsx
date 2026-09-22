function TransactionStatus({ state, hash }) {
  const getStatus = () => {
    switch (state) {
      case "waiting-signature":
        return {
          color: "orange",
          text: "🖊 Waiting for Signature",
        };

      case "submitting":
        return {
          color: "blue",
          text: "🚀 Submitting Transaction",
        };

      case "success":
        return {
          color: "green",
          text: "✅ Success",
        };

      case "error":
        return {
          color: "red",
          text: "❌ Failed",
        };

      default:
        return {
          color: "gray",
          text: "⚪ Idle",
        };
    }
  };

  const status = getStatus();

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        marginTop: "20px",
        background: "#fafafa",
      }}
    >
      <h3>Latest Transaction</h3>

      <p>
        <strong>Status:</strong>{" "}
        <span style={{ color: status.color }}>
          {status.text}
        </span>
      </p>

      {hash && (
        <p>
          <strong>Transaction Hash:</strong>
          <br />
          <code>{hash}</code>
        </p>
      )}

      <p>
        <strong>Network:</strong> Midnight Devnet (Mock)
      </p>
    </div>
  );
}

export default TransactionStatus;