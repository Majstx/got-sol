import { Cluster } from "@solana/web3.js";

export type Config = {
  port: string | number;
  appUrl: string;
  solanaCluster: Cluster;
};
