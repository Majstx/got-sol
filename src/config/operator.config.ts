// Operator wallet configuration
export const OPERATOR_CONFIG = {
    // The operator's public key that will act as fee payer
    publicKey: "YOUR_OPERATOR_WALLET_ADDRESS",
    
    // Minimum balance required for operations (in SOL)
    minimumBalance: 0.1,
    
    // Fee settings
    transactionFee: 0.001, // SOL per transaction
    splitFee: 0.1 // 10% fee for split payments
}; 