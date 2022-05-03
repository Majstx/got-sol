import { PublicKey } from "@solana/web3.js";

export type Splitters = {
  operator: PublicKey;
  splitterA: PublicKey;
  splitterB: PublicKey;
  devA: PublicKey;
  devB: PublicKey;
};
