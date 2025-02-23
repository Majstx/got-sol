export const PAYMENT_CONFIG = {
    // Minimum transaction amount in SOL
    minimumAmount: 0.001,
    
    // Network fee in SOL
    networkFee: 0.000005,
    
    // Operator fee (percentage as decimal)
    operatorFee: 0.01, // 1%
    
    // Buffer for processing (in SOL)
    processingBuffer: 0.0001,

    // Export type
    type: 'payment'
};

// Export the type
export type PaymentConfig = typeof PAYMENT_CONFIG; 