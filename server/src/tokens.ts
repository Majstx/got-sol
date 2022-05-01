import { Cluster, PublicKey } from "@solana/web3.js";

export type TokenSymbol = "USDC" | "USDT";

export type TokenDetails = {
  mint: PublicKey;
  decimals: number;
};

export type TokenList = {
  [symbol: TokenSymbol | string]: TokenDetails;
};

export type TokensByCluster = {
  [cluster: Cluster | string]: TokenList;
};

const list: TokensByCluster = {
  "mainnet-beta": {
    USDC: {
      mint: new PublicKey("2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9"),
      decimals: 6,
    },
  },
  devnet: {
    USDC: {
      mint: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
      decimals: 6,
    },
  },
};

export default list;
