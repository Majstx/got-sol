import { FC, useEffect, useState } from 'react';
import { Connection } from "@solana/web3.js";

const ConnectionTest: FC = () => {
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function testConnection() {
            try {
                setStatus('Creating connection...');
                const connection = new Connection(
                    'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d',
                    'confirmed'
                );

                setStatus('Testing connection...');
                const { blockhash } = await connection.getLatestBlockhash();
                const slot = await connection.getSlot();

                setStatus(`Connected! Blockhash: ${blockhash}, Slot: ${slot}`);
                setError('');
            } catch (err) {
                setError(err.message);
                setStatus('Connection failed');
            }
        }

        testConnection();
    }, []);

    return (
        <div>
            <h2>Solana Connection Status</h2>
            <p>{status}</p>
            {error && <p style={{color: 'red'}}>Error: {error}</p>}
        </div>
    );
}

export default ConnectionTest; 