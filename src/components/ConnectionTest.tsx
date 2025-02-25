import { FC, useEffect, useState } from 'react';
import { Connection } from "@solana/web3.js";

const ConnectionTest: FC = () => {
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function testConnection() {
            const endpoint = "https://solana-mainnet.g.alchemy.com/v2/auyEX2SJHVi3Jv4QOOYpIw4kk5LyVdls";
            
            try {
                setStatus(`Trying connection to Alchemy...`);
                
                const connection = new Connection(endpoint, {
                    commitment: 'confirmed',
                    confirmTransactionInitialTimeout: 60000,
                    wsEndpoint: undefined,
                    disableRetryOnRateLimit: false
                });

                // Test the connection
                await connection.getLatestBlockhash();
                setStatus(`✅ Connected to Alchemy`);
                setError('');
            } catch (err) {
                console.error(`Failed to connect to Alchemy`);
                setError(err.message);
                setStatus('❌ Connection failed');
            }
        }

        testConnection();
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