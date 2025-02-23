import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey } from "@solana/web3.js";

const NewPaymentPage: FC = () => {
    const [connection, setConnection] = useState<Connection | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        const endpoints = [
            'https://solana-mainnet.g.alchemy.com/v2/demo',
            'https://api.mainnet-beta.solana.com',
            'https://rpc.ankr.com/solana'
        ];

        async function tryConnect() {
            setStatus('Attempting connection...');
            for (const endpoint of endpoints) {
                try {
                    const conn = new Connection(endpoint, {
                        commitment: 'confirmed',
                        wsEndpoint: undefined,
                        confirmTransactionInitialTimeout: 60000
                    });
                    
                    setStatus(`Testing connection to ${endpoint}...`);
                    await conn.getLatestBlockhash();
                    console.log('Connected to:', endpoint);
                    setConnection(conn);
                    setError('');
                    setStatus(`Connected to ${endpoint}`);
                    return;
                } catch (err) {
                    console.warn(`Failed to connect to ${endpoint}:`, err);
                    setStatus(`Failed to connect to ${endpoint}, trying next...`);
                    continue;
                }
            }
            setError('Failed to connect to any endpoint');
            setStatus('All connection attempts failed');
        }

        tryConnect();
    }, []);

    return (
        <div className="p-4">
            <p className="text-blue-500">{status}</p>
            {error && <p className="text-red-500">{error}</p>}
            {connection && <p className="text-green-500">Connected to Solana network</p>}
            {/* Your existing payment form */}
        </div>
    );
};

export default NewPaymentPage; 