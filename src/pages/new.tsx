import { FC, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import { useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

function MyApp({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;

// USDC token mint address on mainnet
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

const NewPaymentPage: FC = () => {
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const handlePayment = async (amount: number) => {
        if (!publicKey || !signTransaction) {
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
            const transferAmount = BigInt(amount * 1_000_000);

            // Create transfer instruction
            const transferIx = createTransferCheckedInstruction(
                senderATA,
                USDC_MINT,
                recipientATA,
                publicKey,
                transferAmount,
                6
            );

            const { blockhash } = await connection.getLatestBlockhash();
            const transaction = new Transaction().add(transferIx);

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signed = await signTransaction(transaction);
            const txid = await connection.sendRawTransaction(signed.serialize());
            
            setStatus(`Transaction sent: ${txid}`);
        } catch (err) {
            console.error('Payment failed:', err);
            setError(err.message);
        }
    };

    return (
        <div className="p-4">
            <WalletMultiButton />
            <p className="text-blue-500 mt-4">{status}</p>
            {error && <p className="text-red-500">{error}</p>}
            <button 
                onClick={() => handlePayment(1)} 
                className="bg-blue-500 text-white p-2 rounded mt-4"
                disabled={!publicKey}
            >
                Send 1 USDC
            </button>
        </div>
    );
};