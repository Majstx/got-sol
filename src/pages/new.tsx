import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey } from "@solana/web3.js";

const NewPaymentPage: FC = () => {
    const [connection, setConnection] = useState<Connection | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        // Use Helius endpoint with API key
        const endpoint = 'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d';
        
        async function connect() {
            setStatus('Connecting...');
            try {
                const conn = new Connection(endpoint, {
                    commitment: 'processed',
                    confirmTransactionInitialTimeout: 30000
                });
                
                // Test connection with shorter timeout
                await conn.getLatestBlockhash();
                setConnection(conn);
                setStatus('Connected');
                setError('');
                console.log('Connected to Helius');
            } catch (err) {
                console.error('Connection error:', err);
                setError('Failed to connect to Solana network');
                setStatus('Connection failed');
            }
        }

        connect();
    }, []);

    return (
        <div className="p-4">
            <p className="text-blue-500">{status}</p>
            {error && <p className="text-red-500">{error}</p>}
            {/* Your existing payment form */}
        </div>
    );
};

export default NewPaymentPage; 