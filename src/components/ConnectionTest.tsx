import { FC, useEffect, useState } from 'react';
import { Connection, clusterApiUrl } from "@solana/web3.js";

const ConnectionTest: FC = () => {
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function testConnection() {
            // Array of RPC endpoints to try
            const endpoints = [
                'https://api.mainnet-beta.solana.com',
                'https://solana-api.projectserum.com',
                clusterApiUrl('mainnet-beta'),
                'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d'
            ];

            for (const endpoint of endpoints) {
                try {
                    setStatus(`Trying connection to ${endpoint.split('?')[0]}...`);
                    
                    const connection = new Connection(endpoint, {
                        commitment: 'confirmed',
                        confirmTransactionInitialTimeout: 60000,
                        wsEndpoint: undefined,
                        disableRetryOnRateLimit: false
                    });

                    // Test the connection
                    await connection.getLatestBlockhash();
                    setStatus(`✅ Connected to ${endpoint.split('?')[0]}`);
                    setError('');
                    return; // Success - exit the loop
                } catch (err) {
                    console.warn(`Failed to connect to ${endpoint.split('?')[0]}`);
                    continue; // Try next endpoint
                }
            }

            // If we get here, all endpoints failed
            throw new Error("Unable to connect to any Solana RPC endpoint");
        }

        testConnection().catch(err => {
            setError(err.message);
            setStatus('❌ Connection failed');
        });
    }, []);

    return (
        <div className="p-4 rounded-lg bg-gray-800 text-white">
            <h2 className="text-xl font-bold mb-4">Network Status</h2>
            <p className="mb-2">{status}</p>
            {error && (
                <p className="text-red-400">
                    Error: {error}
                </p>
            )}
        </div>
    );
};

export default ConnectionTest; 