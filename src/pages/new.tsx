import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from '@solana/wallet-adapter-react';

const NewPaymentPage: FC = () => {
    const { publicKey, signTransaction } = useWallet();
    const [connection, setConnection] = useState<Connection | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        const endpoint = 'https://api.mainnet-beta.solana.com';
        const conn = new Connection(endpoint);
        setConnection(conn);
    }, []);

    const handlePayment = async (amount: number) => {
        if (!connection || !publicKey || !signTransaction) {
            setError('Please connect your wallet first');
            return;
        }

        try {
            setStatus('Processing payment...');
            const params = new URLSearchParams(window.location.search);
            const recipientAddress = params.get('recipient');
            
            if (!recipientAddress) {
                throw new Error('No recipient address found');
            }

            const recipient = new PublicKey(recipientAddress);
            const lamports = amount * LAMPORTS_PER_SOL;

            const { blockhash } = await connection.getLatestBlockhash();
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipient,
                    lamports: lamports
                })
            );

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signed = await signTransaction(transaction);
            const txid = await connection.sendRawTransaction(signed.serialize());
            
            setStatus(`Transaction sent: ${txid}`);
            console.log('Payment sent:', txid);
        } catch (err) {
            console.error('Payment failed:', err);
            setError(err.message);
        }
    };

    return (
        <div className="p-4">
            <p className="text-blue-500">{status}</p>
            {error && <p className="text-red-500">{error}</p>}
            <button onClick={() => handlePayment(0.1)} className="bg-blue-500 text-white p-2 rounded">
                Send 0.1 SOL
            </button>
        </div>
    );
};

export default NewPaymentPage; 