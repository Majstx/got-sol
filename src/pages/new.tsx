import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from '@solana/wallet-adapter-react';

// USDC token mint address on mainnet
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

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
            setStatus('Processing USDC payment...');
            const params = new URLSearchParams(window.location.search);
            const recipientAddress = params.get('recipient');
            
            if (!recipientAddress) {
                throw new Error('No recipient address found');
            }

            const recipient = new PublicKey(recipientAddress);

            // Get token accounts
            const senderATA = await getAssociatedTokenAddress(USDC_MINT, publicKey);
            const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipient);

            // Amount in USDC (6 decimals)
            const transferAmount = amount * 1_000_000;

            // Create transfer instruction
            const transferIx = createTransferInstruction(
                senderATA,
                recipientATA,
                publicKey,
                transferAmount,
                [],
                TOKEN_PROGRAM_ID
            );

            const { blockhash } = await connection.getLatestBlockhash();
            const transaction = new Transaction().add(transferIx);

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signed = await signTransaction(transaction);
            const txid = await connection.sendRawTransaction(signed.serialize());
            
            setStatus(`USDC Transaction sent: ${txid}`);
            console.log('USDC Payment sent:', txid);
        } catch (err) {
            console.error('USDC Payment failed:', err);
            setError(err.message);
        }
    };

    return (
        <div className="p-4">
            <p className="text-blue-500">{status}</p>
            {error && <p className="text-red-500">{error}</p>}
            <button onClick={() => handlePayment(1)} className="bg-blue-500 text-white p-2 rounded">
                Send 1 USDC
            </button>
        </div>
    );
};

export default NewPaymentPage; 