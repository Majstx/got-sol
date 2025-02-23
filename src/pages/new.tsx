import { FC } from 'react';
import { Connection } from "@solana/web3.js";

const NewPaymentPage: FC = () => {
    // Use a more reliable RPC endpoint
    const connection = new Connection(
        'https://api.mainnet-beta.solana.com',
        {
            commitment: 'confirmed',
            wsEndpoint: undefined,
            confirmTransactionInitialTimeout: 120000
        }
    );

    // Add error logging
    connection.getLatestBlockhash()
        .then(blockhash => {
            console.log('Connection successful:', blockhash);
        })
        .catch(error => {
            console.error('Connection failed:', error);
        });

    return (
        <div>
            {/* Your payment form JSX */}
        </div>
    );
};

// Fix the default export
export default NewPaymentPage; 