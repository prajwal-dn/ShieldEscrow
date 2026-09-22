// Mock Midnight Wallet Service
// Replace these functions with Midnight SDK later

export const detectWallet = async () => {
  return true;
};

export const connectWallet = async () => {
  return {
    connected: true,
    address: "midnight_test1_qx83k2h7x9w4d5e6r8t9y",
  };
};

export const signTransaction = async () => {
  // Simulate user reading/signing
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    signature: "mock_signature_123456789",
  };
};

export const submitTransaction = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    success: true,
    txHash: "0x8FA23BC987654321ABCDE",
  };
};