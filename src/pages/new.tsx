import { Connection } from "@solana/web3.js";

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