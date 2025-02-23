import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey } from "@solana/web3.js";

const NewPaymentPage: FC = () => {
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const endpoints = [
            'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d',
            'https://api.mainnet-beta.solana.com',
            'https://solana-api.projectserum.com'
        ];

        async function connectToNetwork() {
            for (const endpoint of endpoints) {
                try {
                    const connection = new Connection(endpoint, {
                        commitment: 'confirmed',
                        confirmTransactionInitialTimeout: 120000
                    });
                    
                    // Test connection
                    await connection.getLatestBlockhash();
                    console.log('Connected to:', endpoint);
                    setStatus('Connected to Solana network');
                    setError('');
                    return connection;
                } catch (err) {
                    console.warn(`Failed to connect to ${endpoint}:`, err);
                    setError(`Connection failed: ${err.message}`);
                    continue;
                }
            }
            throw new Error('Failed to connect to any RPC endpoint');
        }

        connectToNetwork().catch(err => {
            setError(`Network error: ${err.message}`);
            console.error('Network error:', err);
        });
    }, []);

    return (
        <div className="p-4">
            {status && <p className="text-green-500">{status}</p>}
            {error && <p className="text-red-500">{error}</p>}
            {/* Your existing payment form */}
        </div>
    );
};

export default NewPaymentPage; 