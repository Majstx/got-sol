import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { useWallet } from '@solana/wallet-adapter-react';

const NewPaymentPage: FC = () => {
    const { wallet, connect, connected, publicKey, signTransaction } = useWallet();
    const [connection, setConnection] = useState<Connection | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        const endpoint = 'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d';
        
        async function connectToNetwork() {
            setStatus('Connecting to network...');
            try {
                const conn = new Connection(endpoint, {
                    commitment: 'processed',
                    confirmTransactionInitialTimeout: 30000
                });
                
                await conn.getLatestBlockhash();
                setConnection(conn);
                setStatus('Network connected');
                setError('');
                console.log('Connected to Helius');
            } catch (err) {
                console.error('Network error:', err);
                setError('Failed to connect to network');
                setStatus('Network connection failed');
            }
        }

        connectToNetwork();
    }, []);

    const handlePayment = async (amount: number) => {
        if (!connection || !publicKey || !signTransaction) {
            setError('Please connect your wallet first');
            return;
        }
        
        try {
            setStatus('Creating transaction...');
            // Your payment transaction code here
            console.log('Creating payment for:', amount);
        } catch (err) {
            console.error('Payment error:', err);
            setError(`Payment failed: ${err.message}`);
        }
    };

    return (
        <div className="p-4">
            <p className="text-blue-500">{status}</p>
            {error && <p className="text-red-500">{error}</p>}
            {!connected && (
                <button onClick={connect} className="bg-blue-500 text-white p-2 rounded">
                    Connect Wallet
                </button>
            )}
            {/* Your existing payment form */}
        </div>
    );
};

export default NewPaymentPage; 