import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { SplitPaymentTransactionBuilder } from "./SplitPaymentTransactionBuilder";
import { SplUtils } from "./SplUtils";
import { TransactionFactory } from "./TransactionFactory";

type Splitters = {
  operator: PublicKey;
  splitterA: PublicKey;
  splitterB: PublicKey;
  devA: PublicKey;
  devB: PublicKey;
};

export type SplitPayDetailsDto = {
  amount: number;
  sender: PublicKey;
  recipient: PublicKey;
  splToken: PublicKey;
};

export class SplitPaymentService {
  constructor(
    private readonly connection: Connection,
    private readonly transactionFactory: TransactionFactory,
    private readonly splUtils: SplUtils,
    private readonly feePayer: Keypair,
    private readonly splitters: Splitters
  ) {}

  async createTransaction({
    amount,
    sender,
    recipient,
    splToken,
  }: SplitPayDetailsDto): Promise<Transaction> {
    // Check that the token provided is an initialized mint
    const mint = await getMint(this.connection, splToken);
    if (!mint.isInitialized) throw new Error("mint not initialized");

    const tokens = amount * Math.pow(10, mint.decimals);

    return await SplitPaymentTransactionBuilder.init(
      this.transactionFactory,
      this.splUtils,
      tokens
    )
      .setSplToken(splToken)
      .setFeePayer(this.feePayer)
      .setSender(sender)
      .setDecimals(mint.decimals)
      .addMerchant(recipient)
      .addDev(this.splitters.devA)
      .addDev(this.splitters.devB)
      .addSplitter(this.splitters.splitterA)
      .addSplitter(this.splitters.splitterB)
      .addOperator(this.splitters.operator)
      .build();
  }
}
