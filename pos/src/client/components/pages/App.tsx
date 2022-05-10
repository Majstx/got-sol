import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { AppContext, AppProps as NextAppProps, default as NextApp } from 'next/app';
import { AppInitialProps } from 'next/dist/shared/lib/utils';
import { FC, useMemo } from 'react';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import css from './App.module.css';
import { MAINNET_ENDPOINT, MAINNET_USDC_MINT } from '../../utils/constants';
import { USDCIcon } from '../images/USDCIcon';
import { useRouter } from 'next/router';

interface AppProps extends NextAppProps {
    host: string;
    query: {
        recipient?: string;
        label?: string;
        message?: string;
    };
}

const getRouteParams = () => {
    const { query, basePath } = useRouter();
    const req = basePath ? new URL(basePath) : null;
    const recipient = query.recipient as string;
    const label = query.label as string;
    const message = (query.message as string) || undefined;
    const host = req?.host || 'localhost:3000';

    return {
        query: { recipient, label, message },
        host,
    };
};

const App: FC<AppProps> & { getInitialProps(appContext: AppContext): Promise<AppInitialProps> } = ({
    Component,
    pageProps,
}) => {
    const { host, query } = getRouteParams();
    const baseURL = `http://${host}`;
    const backendURL = `https://api.gotsol.store/tx/`;

    // const baseURL = `https://api.gotsol.store`;

    // If you're testing without a mobile wallet, set this to true to allow a browser wallet to be used.
    const connectWallet = false;
    const network = WalletAdapterNetwork.Devnet;
    const wallets = useMemo(
        () => (connectWallet ? [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })] : []),
        [connectWallet, network]
    );

    // Toggle comments on these lines to use transaction requests instead of transfer requests.
    // const link = undefined;
    // const link = useMemo(() => new URL(`${baseURL}/tx/`), [baseURL]);
    const link = useMemo(() => new URL(backendURL), [backendURL]);

    let recipient: PublicKey | undefined = undefined;
    const { recipient: recipientParam, label, message } = query;
    if (recipientParam && label) {
        try {
            recipient = new PublicKey(recipientParam);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <ThemeProvider>
            <FullscreenProvider>
                {recipient && label ? (
                    <ConnectionProvider endpoint={MAINNET_ENDPOINT}>
                        <WalletProvider wallets={wallets} autoConnect={connectWallet}>
                            <WalletModalProvider>
                                <ConfigProvider
                                    baseURL={baseURL}
                                    link={link}
                                    recipient={recipient}
                                    label={label}
                                    splToken={MAINNET_USDC_MINT}
                                    message={message}
                                    symbol="USDC"
                                    icon={<USDCIcon />}
                                    decimals={6}
                                    minDecimals={2}
                                    connectWallet={connectWallet}
                                >
                                    <TransactionsProvider>
                                        <PaymentProvider>
                                            <Component {...pageProps} />
                                        </PaymentProvider>
                                    </TransactionsProvider>
                                </ConfigProvider>
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                ) : (
                    <div className={css.logo}>
                        <SolanaPayLogo width={240} height={88} />
                    </div>
                )}
            </FullscreenProvider>
        </ThemeProvider>
    );
};

App.getInitialProps = async (appContext) => {
    return await NextApp.getInitialProps(appContext);
};

export default App;
