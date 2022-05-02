import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { SplitPaymentBuilder } from "./SplitPaymentBuilder";
import { SplUtils } from "./SplUtils";

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

export class TransactionService {
  constructor(
    private readonly connection: Connection,
    private readonly splUtils: SplUtils,
    private readonly feePayer: Keypair,
    private readonly splitters: Splitters
  ) {}

  async createSplitPayTx({
    amount,
    sender,
    recipient,
    splToken,
  }: SplitPayDetailsDto): Promise<Transaction> {
    // Check that the token provided is an initialized mint
    const mint = await getMint(this.connection, splToken);
    if (!mint.isInitialized) throw new Error("mint not initialized");

    const tokens = amount * Math.pow(10, mint.decimals);

    const instructions = await SplitPaymentBuilder.init(this.splUtils, tokens)
      .setSplToken(splToken)
      .setFeePayer(this.feePayer.publicKey)
      .setSender(sender)
      .setDecimals(mint.decimals)
      .addMerchant(recipient)
      .addDev(this.splitters.devA)
      .addDev(this.splitters.devB)
      .addSplitter(this.splitters.splitterA)
      .addSplitter(this.splitters.splitterB)
      .addOperator(this.splitters.operator)
      .build();

    return this.createTransaction(instructions);
  }

  private async createTransaction(
    instructions: TransactionInstruction[]
  ): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: this.feePayer.publicKey,
      recentBlockhash: blockhash,
    });
    instructions.forEach((ix) => tx.add(ix));
    tx.partialSign(this.feePayer);

    return tx;
  }
}
