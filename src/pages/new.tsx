import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const NewPaymentPage: FC = () => {
    const [connection, setConnection] = useState<Connection | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const minimumAmount = 0.001;

    useEffect(() => {
        // Use a more reliable endpoint
        const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/demo';
        
        async function connect() {
            setStatus('Connecting...');
            try {
                const conn = new Connection(endpoint, {
                    commitment: 'confirmed',
                    confirmTransactionInitialTimeout: 60000
                });
                
                // Test connection
                await conn.getLatestBlockhash();
                setConnection(conn);
                setStatus('Connected');
                setError('');
            } catch (err) {
                console.error('Connection error:', err);
                setError('Failed to connect to Solana network');
                setStatus('Connection failed');
            }
        }

        connect();
    }, []);

    const handlePayment = async (amount: number) => {
        setProcessing(true);
        setError('');
        try {
            if (!connection) {
                throw new Error('No connection to Solana network');
            }
            // Add your payment processing logic here
            setStatus('Processing payment...');
            
            // Log connection status
            console.log('Connection status:', connection);
            
        } catch (err) {
            console.error('Payment error:', err);
            setError(`Payment failed: ${err.message}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-4">
            <p className="text-blue-500">{status}</p>
            {error && <p className="text-red-500">{error}</p>}
            {processing && <p>Processing payment...</p>}
            {/* Your existing payment form */}
        </div>
    );
};

export default NewPaymentPage; 